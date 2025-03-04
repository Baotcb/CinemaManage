import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { ShowingMovieComponent } from './showing-movie/showing-movie.component';
import { UpcomingMovieComponent } from './upcoming-movie/upcoming-movie.component';

export const routes: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: 'login', component: LoginComponent},
    {path:'register', component: RegisterComponent},
    {path:'home',component: HomeComponent},
    {path:'movie',component: ShowingMovieComponent},
    {path:'coming',component: UpcomingMovieComponent}

];
