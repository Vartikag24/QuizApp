const express = require('express');
const app = express();

const { mongoose } = require('./db/mongoose');
const jwt = require('jsonwebtoken');

/* MIDDLEWARE  */

// Load middleware
const bodyParser = require('body-parser');

// CORS HEADERS MIDDLEWARE
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id");

    res.header(
        'Access-Control-Expose-Headers',
        'x-access-token, x-refresh-token'
    );

    next();
});

// Load in the mongoose models
const { Quiz, Question, Teacher } = require('./db/models');

//load middleware
app.use(bodyParser.json());


// check whether the request has a valid JWT access token
let authenticate = (req, res, next) => {
    let token = req.header('x-access-token');

    // verify the JWT
    jwt.verify(token, Teacher.getJWTSecret(), (err, decoded) => {
        if (err) {
            // there was an error
            // jwt is invalid - * DO NOT AUTHENTICATE *
            res.status(401).send(err);
        } else {
            // jwt is valid
            req.user_id = decoded._id;
            next();
        }
    });
}

// Verify Refresh Token Middleware (which will be verifying the session)
let verifySession = (req, res, next) => {
    // grab the refresh token from the request header
    let refreshToken = req.header('x-refresh-token');

    // grab the _id from the request header
    let _id = req.header('_id');

    Teacher.findByIdAndToken(_id, refreshToken).then((user) => {
        if (!user) {
            // user couldn't be found
            return Promise.reject({
                'error': 'User not found. Make sure that the refresh token and user id are correct'
            });
        }


        // if the code reaches here - the user was found
        // therefore the refresh token exists in the database - but we still have to check if it has expired or not

        req.user_id = user._id;
        req.userObject = user;
        req.refreshToken = refreshToken;

        let isSessionValid = false;

        user.sessions.forEach((session) => {
            if (session.token === refreshToken) {
                // check if the session has expired
                if (Teacher.hasRefreshTokenExpired(session.expiresAt) === false) {
                    // refresh token has not expired
                    isSessionValid = true;
                }
            }
        });

        if (isSessionValid) {
            // the session is VALID - call next() to continue with processing this web request
            next();
        } else {
            // the session is not valid
            return Promise.reject({
                'error': 'Refresh token has expired or the session is invalid'
            })
        }

    }).catch((e) => {
        res.status(401).send(e);
    })
}

/* END MIDDLEWARE  */


/* ROUTE HANDLERS */


/* LIST ROUTES */


app.get('/',(req,res)=>{
    res.send("Hello there!");
});

/**
 * GET /quizzes
 * Purpose: Get all quizzes
 */
app.get('/quizzes', authenticate, (req, res) =>{
    //We want to return all the quizzes in the database that belong to the authenticated user
    Quiz.find({
        _userId: req.user_id
    }).then((quizzes) => {
        res.send(quizzes);
    }).catch((e)=>{
        res.send(e);
    });
});

/**
 * POST /quizzes
 * Purpose: Create a quiz
 */
app.post('/quizzes', authenticate, (req, res) =>{
    // We want to create a new quiz and return the new quiz document back to the user (which includes the id)
    // The list information (fields) will be passed in via the JSON request body
    let title = req.body.title;
    let newQuiz = new Quiz({
        title,
        _userId: req.user_id
    });
    newQuiz.save().then((quizDoc) =>{
        // the full quiz document is returned(including id)
        res.send(quizDoc); 
    });

});



/**
 * PATCH /quizzes/:id
 * Purpose: Update a specified quiz
 */
app.patch('/quizzes/:id', authenticate,(req, res) =>{
    // We want to update the specified quiz (quiz document with id in the URL) with the new values specified in the JSON body of the request
    Quiz.findOneAndUpdate({ _id: req.params.id, _userId: req.user_id },{
        $set: req.body
    }).then(() =>{
        res.sendStatus(200);
    });
}); 

/**
 * DELETE /lists/:id
 * Purpose: Delete a list
 */
app.delete('/quizzes/:id', authenticate,(req, res) => {
    // We want to delete the specified quiz (document with id in the URL)
    Quiz.findOneAndRemove({ 
        _id: req.params.id,
        _userId: req.user_id
    }).then((removedQuizDoc) => {
        res.send(removedQuizDoc);

        //delete all the tasks that are in the deleted list
        deleteQuestionsFromQuiz(removedQuizDoc._id);
    });

});

/**
 * GET /quizzes/:quizId/questions
 * Purpose: Get all questions in a specific quiz
 */
app.get('/quizzes/:quizId/questions', authenticate, (req, res) => {
    // We want to return all questions that belong to a specific quiz (specified by quizId)
    Question.find({
        _quizId: req.params.quizId
    }).then((questions) => {
        res.send(questions);
    });
});

/**
 * POST /quizzes/:quizId/question
 * Purpose: Create a new question in a specific quiz
 */

app.post('/quizzes/:quizId/question', authenticate, (req, res) => {
    // We want to create a new task in a list specified by listId

    Quiz.findOne({
        _id: req.params.quizId,
        _userId: req.user_id
    }).then((quiz) => {
        if (quiz) {
            // quiz object with the specified conditions was found
            // therefore the currently authenticated user can create new questions
            return true;
        }

        // else - the quiz object is undefined
        return false;
    }).then((canCreateQuestion) => {
        if (canCreateQuestion) {
            let newQuestion = new Question({
                title: req.body.title,
                answers: req.body.answers,
                correctAns: req.body.correctAns,
                _quizId: req.params.quizId,
            });
            newQuestion.save().then((newQuestionDoc) => {
                res.send(newQuestionDoc);
            })
        } else {
            res.sendStatus(404);
        }
    })
});

//code before authentication was added
// app.post('/quizzes/:quizId/question', (req, res) => {
//     // We want to create a new question in a quiz specified by quizId
//     let newQuestion = new Question({
//         title: req.body.title,
//         answers: req.body.answers,
//         correctAns: req.body.correctAns,
//         _quizId: req.params.quizId,
//     });

//     newQuestion.save().then((newQuestionDoc) =>{
//         res.send(newQuestionDoc);
//     });
// });

/**
 * PATCH /quizzes/:quizId/questions/:questionId
 * Purpose: Update an existing question
 */

app.patch('/quizzes/:quizId/questions/:questionId', authenticate, (req, res) => {
    // We want to update an existing task (specified by taskId)

    Quiz.findOne({
        _id: req.params.quizId,
        _userId: req.user_id
    }).then((quiz) => {
        if (quiz) {
            // list object with the specified conditions was found
            // therefore the currently authenticated user can make updates to tasks within this list
            return true;
        }

        // else - the list object is undefined
        return false;
    }).then((canUpdateQuestions) => {
        if (canUpdateQuestions) {
            // the currently authenticated user can update tasks
            Question.findOneAndUpdate({
                _id: req.params.questionId,
                _quizId: req.params.quizId
            }, {
                    $set: req.body
                }
            ).then(() => {
                res.send({ message: 'Updated successfully.' })
            })
        } else {
            res.sendStatus(404);
        }
    })
});

//code before authentication was added
// app.patch('/quizzes/:quizId/questions/:questionId', (req, res) => {
//     //We want to update an existing question (specified by questionId)
//     Question.findOneAndUpdate({
//         _id: req.params.questionId,
//         _quizId: req.params.quizId
//     },{
//         $set: req.body
//       }
//     ).then(() => {
//         res.sendStatus(200);
//     });
// });

/**
 * DELETE /quizzes/:quizId/questions/:questionId
 * Purpose: Delete a question
 */

app.delete('/quizzes/:quizId/questions/:questionId', authenticate, (req, res) => {

    Question.findOne({
        _id: req.params.quizId,
        _userId: req.user_id
    }).then((quiz) => {
        if (quiz) {
            // list object with the specified conditions was found
            // therefore the currently authenticated user can make updates to tasks within this list
            return true;
        }

        // else - the list object is undefined
        return false;
    }).then((canDeleteQuestions) => {
        
        if (canDeleteQuestions) {
            Question.findOneAndRemove({
                _id: req.params.questionId,
                _quizId: req.params.quizId
            }).then((removedQuestionDoc) => {
                res.send(removedQuestionDoc);
            })
        } else {
            res.sendStatus(404);
        }
    });
});
 
//code before authentication
// app.delete('/quizzes/:quizId/questions/:questionId', (req, res) => {
//     Question.findOneAndRemove({
//         _id: req.params.questionId,
//         _quizId: req.params.quizId
//     }).then((removedQuestionDoc) => {
//         res.send(removedQuestionDoc);
//     });
// });


/* USER ROUTES */

/**
 * POST /teachers
 * Purpose: Sign up
 */
app.post('/teachers', (req, res) => {
    // Teacher sign up

    let body = req.body;
    let newTeacher = new Teacher(body);

    newTeacher.save().then(() => {
        return newTeacher.createSession();
    }).then((refreshToken) => {
        // Session created successfully - refreshToken returned.
        // now we geneate an access auth token for the user

        return newTeacher.generateAccessAuthToken().then((accessToken) => {
            // access auth token generated successfully, now we return an object containing the auth tokens
            return { accessToken, refreshToken }
        });
    }).then((authTokens) => {
        // Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
        res
            .header('x-refresh-token', authTokens.refreshToken)
            .header('x-access-token', authTokens.accessToken)
            .send(newTeacher);
    }).catch((e) => {
        res.status(400).send(e);
    })
})


/**
 * POST /teachers/login
 * Purpose: Login
 */
app.post('/teachers/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    Teacher.findByCredentials(email, password).then((user) => {
        return user.createSession().then((refreshToken) => {
            // Session created successfully - refreshToken returned.
            // now we geneate an access auth token for the user

            return user.generateAccessAuthToken().then((accessToken) => {
                // access auth token generated successfully, now we return an object containing the auth tokens
                return { accessToken, refreshToken }
            });
        }).then((authTokens) => {
            // Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
            res
                .header('x-refresh-token', authTokens.refreshToken)
                .header('x-access-token', authTokens.accessToken)
                .send(user);
        })
    }).catch((e) => {
        res.status(400).send(e);
    });
})


/**
 * GET /teachers/me/access-token
 * Purpose: generates and returns an access token
 */
app.get('/teachers/me/access-token', verifySession, (req, res) => {
    // we know that the user/caller is authenticated and we have the user_id and user object available to us
    req.userObject.generateAccessAuthToken().then((accessToken) => {
        res.header('x-access-token', accessToken).send({ accessToken });
    }).catch((e) => {
        res.status(400).send(e);
    });
})

/* HELPER METHODS */
let deleteQuestionsFromQuiz = (_quizId) => {
    Question.deleteMany({
        _quizId
    }).then(() => {
        console.log("Questions from " + _quizId + " were deleted!");
    })
}

app.listen(3000, () => {
    console.log("Server is listening on port 3000");
})