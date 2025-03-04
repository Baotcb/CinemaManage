import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

export interface Movie {
  movieId: number;
  title: string;
  description?: string;
  duration: number;
  releaseDate?: Date; 
  endDate?: Date;
  genre: string;
  director?: string;
  cast?: string;
  posterUrl?: string;
  trailerUrl?: string;
  language?: string;
  subtitle?: string;
  rating?: number;
  showtimes?: string[];
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
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './showing-movie.component.html',
  styleUrls: ['./showing-movie.component.css']
})
export class ShowingMovieComponent implements OnInit {
  isLoading: boolean = false;
  selectedGenre: string = 'all';
  selectedDate: Date = new Date();
  httpClient = inject(HttpClient);
  movies: Movie[] = [];

  genres: Genre[] = [
    { value: 'all', viewValue: 'Tất cả' },
    { value: 'Action', viewValue: 'Hành động' },
    { value: 'Comedy', viewValue: 'Hài' },
    { value: 'Drama', viewValue: 'Tâm lý' },
    { value: 'Science Fiction', viewValue: 'Khoa học viễn tưởng' },
    { value: 'Thriller', viewValue: 'Kinh dị' },
    {value:'Family', viewValue:'Gia đình'},
    {value:'Animation', viewValue:'Hoạt hình'},
    {value:'Documentary', viewValue:'Tài liệu'},
  ];

  filteredMovies: Movie[] = [];

  ngOnInit(): void {
 
    let apiUrl = 'https://localhost:7057/api/Movie/GetShowingMovies';
    this.httpClient.get<Movie[]>(apiUrl).subscribe({
      next: (data) => {
        console.log('Showing movies:', data);
        this.movies = data;
        this.filteredMovies = [...this.movies]; 
      },
      error: (error) => {
        console.error('Error fetching movies:', error);
      }
    });
  }

  filterMovies(genre: string): void {
    if (genre == 'all') {
      this.filteredMovies = [...this.movies];
      console.log('Showing all movies:', this.filteredMovies);
    } else {
      console.log('Filtering movies by genre:', genre);
      this.filteredMovies = this.movies.filter(movie => 
        movie.genre.toLowerCase() == genre.toLowerCase()
      );
    }
  }
}