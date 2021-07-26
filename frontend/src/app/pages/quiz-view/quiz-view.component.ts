import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { QuizService } from 'src/app/quiz.service';

@Component({
  selector: 'app-quiz-view',
  templateUrl: './quiz-view.component.html',
  styleUrls: ['./quiz-view.component.scss']
})
export class QuizViewComponent implements OnInit {

  quizzes: any[];  //stores all the quizzes
  questions: any[]; //stores all the questions of particular quiz
  constructor(private quizService: QuizService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe(
      (params: Params) => {
        if(params.quizId){
          //console.log(params);
          this.quizService.getQuestions(params.quizId).subscribe((questions: any[]) =>{
          this.questions = questions;
        })
          //console.log(questions);
        }else{
          this.questions = undefined
        }   
      }
    );

    this.quizService.getQuizzes().subscribe((quizzes: any[]) => {
      this.quizzes = quizzes;
      //console.log(quizzes);
    });

  }

  
}
