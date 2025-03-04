import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';

interface Movie {
  movieId: number;
  title: string;
  description?: string;
  duration: number;
  releaseDate?: Date;
  endDate?: Date;
  genre?: string;
  director?: string;
  cast?: string;
  posterUrl?: string;
  trailerUrl?: string;
  language?: string;
  subtitle?: string;
  rating?: number;
}

@Component({
  selector: 'app-movie-info',
  standalone: true,
  imports: [CommonModule, MaterialModule,FormsModule,MaterialModule,ReactiveFormsModule,MatProgressBarModule ],
  templateUrl: './movie-info.component.html',
  styleUrls: ['./movie-info.component.css']
})
export class MovieInfoComponent implements OnInit {
  movieId: number = 0;
  movie?: Movie;
  isLoading = true;
  selectedDate = new Date();
  selectedTime?: string;

  showtimes = ['10:00', '12:30', '15:00', '17:30', '20:00', '22:30'];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    this.movieId = this.route.snapshot.params['id'];
  }

  ngOnInit() {
    this.loadMovieDetails();
  }

  loadMovieDetails() {
    const apiUrl = `https://localhost:7057/api/Movie/GetMovieById/${this.movieId}`;
    this.http.get<Movie>(apiUrl).subscribe({
      next: (data) => {
        this.movie = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading movie:', error);
        this.isLoading = false;
      }
    });
  }

  selectShowtime(time: string) {
    this.selectedTime = time;
  }

  bookTicket() {
    if (this.selectedTime) {
      // Implement booking logic
      console.log('Booking ticket for:', this.selectedTime);
    }
  }
}