import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { title } from 'process';
import { Question } from 'src/app/models/question.model';
import { QuizService } from 'src/app/quiz.service';

@Component({
  selector: 'app-new-question',
  templateUrl: './new-question.component.html',
  styleUrls: ['./new-question.component.scss']
})
export class NewQuestionComponent implements OnInit {

  constructor(private quizService: QuizService, private route: ActivatedRoute, private router: Router) { }

  quizId: string;
  ngOnInit(): void {
    this.route.params.subscribe(
      (params: Params) => {
        this.quizId = params['quizId'];
      }
    )
  }

  addQuestion(title: string, answers: Array<string>, correctAns: string){
    /*console.log(title);
    console.log(answers);
    console.log(correctAns);
    console.log(this.quizId);*/
    this.quizService.addQuestion(title, answers, correctAns, this.quizId).subscribe((newQuestion: Question) => {
       //console.log(newQuestion);
       this.router.navigate(['../'], { relativeTo: this.route});
    });
  }

}
