import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { ShowingMovieComponent } from './showing-movie/showing-movie.component';
import { UpcomingMovieComponent } from './upcoming-movie/upcoming-movie.component';
import { MovieInfoComponent } from './movie-info/movie-info.component';
import { CinemaComponent } from './cinema/cinema.component';
import { ProfileComponent } from './profile/profile.component';
import { BookingComponent } from './booking/booking.component';
import { ListmovieComponent } from './admin/listmovie/listmovie.component';
import { ListcinemaComponent } from './admin/listcinema/listcinema.component';
import { ShowtimeComponent } from './admin/showtime/showtime.component';
import { UserComponent } from './admin/user/user.component';
import { RoomComponent } from './admin/room/room.component';

export const routes: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: 'login', component: LoginComponent},
    {path:'register', component: RegisterComponent},
    {path:'home',component: HomeComponent},
    {path:'movie',component: ShowingMovieComponent},
    {path:'coming',component: UpcomingMovieComponent},
    {path:'movieInfo/:id',component: MovieInfoComponent},
    {path:'cinema',component:CinemaComponent},
    {path:'profile',component:ProfileComponent},
    {path:'booking',component:BookingComponent},
    {path:'admin/listmovie',component:ListmovieComponent},
    {path:'admin/listcinema',component:ListcinemaComponent},
    {path:'admin/showtime',component:ShowtimeComponent},
    {path:'admin/users',component:UserComponent},
    {path:'admin/room',component:RoomComponent}

];
