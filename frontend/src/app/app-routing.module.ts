import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NewQuestionComponent } from './pages/new-question/new-question.component';
import { NewQuizComponent } from './pages/new-quiz/new-quiz.component';
import { QuizViewComponent } from './pages/quiz-view/quiz-view.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';


const routes: Routes = [
  { path: '', redirectTo: '/quizzes', pathMatch: 'full' },
  { path: 'new-quiz', component: NewQuizComponent},
  { path: 'login', component: LoginPageComponent},
  { path: 'signup', component: SignupPageComponent},
  { path:'quizzes', component: QuizViewComponent},
  { path:'quizzes/:quizId', component: QuizViewComponent},
  { path: 'quizzes/:quizId/new-question', component: NewQuestionComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
