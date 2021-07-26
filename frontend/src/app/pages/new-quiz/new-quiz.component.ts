import { Component, OnInit } from '@angular/core';
import { QuizService } from 'src/app/quiz.service';
import {Router} from '@angular/router'
import { Quiz } from 'src/app/models/quiz.model';

@Component({
  selector: 'app-new-quiz',
  templateUrl: './new-quiz.component.html',
  styleUrls: ['./new-quiz.component.scss']
})
export class NewQuizComponent implements OnInit {

  constructor(private quizService: QuizService, private router: Router) { }

  ngOnInit(): void {
  }
  createQuiz(title: string){
    this.quizService.createQuiz(title).subscribe((quiz: Quiz) =>{
      console.log(quiz);
      //Now we navigate to /quizzes/quiz._id
      this.router.navigate(['/quizzes', quiz._id]);
    });
  }


}
