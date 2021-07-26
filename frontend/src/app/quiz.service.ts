import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';

@Injectable({
  providedIn: 'root'
})
export class QuizService {

  constructor(private webReqService: WebRequestService) { }

  
  getQuizzes(){
    //gets all the quizzes to display on the teacher side
    return this.webReqService.get('quizzes');
  }

  //to create a new quiz(teacher side)
  createQuiz(title: string) {
    // We want to send a web request to create a list
    return this.webReqService.post('quizzes', { title });
  }


  getQuestions(quizId: string){
    //gets all the questions of a particular quiz to display on the teacher side
    return this.webReqService.get(`quizzes/${quizId}/questions`);
  }

  addQuestion(title: string, answers: Array<string>, correctAns: string, quizId: string) {
    // We want to send a web request to add a question to a particular quiz
    return this.webReqService.post(`quizzes/${quizId}/question`, {title, answers, correctAns});
  }

}
