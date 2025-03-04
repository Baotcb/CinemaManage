// showing-movie.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface ShowingMovie {
  id: number;
  title: string;
  imageUrl: string;
  duration: string;
  genre: string;
  rating: number;
  description: string;
  showTimes: string[];
}

interface Genre {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-showing-movie',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './showing-movie.component.html',
  styleUrls: ['./showing-movie.component.css']
})
export class ShowingMovieComponent implements OnInit {
  selectedGenre: string = 'all';
  selectedDate: Date = new Date();
  
  movies: ShowingMovie[] = [
    {
      id: 1,
      title: 'Dune: Part Two',
      imageUrl: 'assets/images/movies/dune2.jpg',
      duration: '166 min',
      genre: 'Science Fiction',
      rating: 4.8,
      description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
      showTimes: ['10:00', '13:30', '17:00', '20:30']
    },
    {
      id: 2,
      title: 'The Batman',
      imageUrl: 'assets/images/movies/batman.jpg',
      duration: '176 min',
      genre: 'Action',
      rating: 4.5,
      description: 'When the Riddler, a sadistic serial killer, begins murdering key political figures in Gotham, Batman is forced to investigate the city\'s hidden corruption.',
      showTimes: ['11:30', '15:00', '18:30', '21:45']
    },
    {
      id: 3,
      title: 'Everything Everywhere All at Once',
      imageUrl: 'assets/images/movies/everything.jpg',
      duration: '139 min',
      genre: 'Drama',
      rating: 4.9,
      description: 'An aging Chinese immigrant is swept up in an insane adventure, where she alone can save the world by exploring other universes connecting with the lives she could have led.',
      showTimes: ['09:45', '12:30', '16:15', '19:00']
    },
    {
      id: 4,
      title: 'Parasite',
      imageUrl: 'assets/images/movies/parasite.jpg',
      duration: '132 min',
      genre: 'Drama',
      rating: 4.7,
      description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
      showTimes: ['14:00', '17:30', '20:00']
    },
    {
      id: 5,
      title: 'Deadpool & Wolverine',
      imageUrl: 'assets/images/movies/deadpool.jpg',
      duration: '127 min',
      genre: 'Action',
      rating: 4.6,
      description: 'Wolverine is dragged out of retirement for one last adventure with the Merc with a Mouth.',
      showTimes: ['10:30', '13:00', '16:30', '19:30', '22:00']
    },
    {
      id: 6,
      title: 'Barbie',
      imageUrl: 'assets/images/movies/barbie.jpg',
      duration: '114 min',
      genre: 'Comedy',
      rating: 4.3,
      description: 'Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land. However, they soon discover the joys and perils of living among humans.',
      showTimes: ['11:00', '14:30', '17:45', '20:15']
    }
  ];

  genres: Genre[] = [
    { value: 'all', viewValue: 'Tất cả' },
    { value: 'action', viewValue: 'Hành động' },
    { value: 'comedy', viewValue: 'Hài' },
    { value: 'drama', viewValue: 'Tâm lý' },
    { value: 'science fiction', viewValue: 'Khoa học viễn tưởng' }
  ];

  filteredMovies: ShowingMovie[] = [];

  ngOnInit(): void {
    this.filteredMovies = [...this.movies];
  }

  filterMovies(genre: string): void {
    if (genre === 'all') {
      this.filteredMovies = [...this.movies];
    } else {
      this.filteredMovies = this.movies.filter(movie => 
        movie.genre.toLowerCase() === genre.toLowerCase()
      );
    }
  }
}