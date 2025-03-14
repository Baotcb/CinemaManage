import { Component, OnInit } from '@angular/core';
import { SignalRService } from '../../../service/signalr.service';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Pipe, PipeTransform } from '@angular/core';

// Create a pipe for minutes to hours conversion
@Pipe({
  name: 'minutesToHours',
  standalone: true
})
export class MinutesToHoursPipe implements PipeTransform {
  transform(minutes: number): string {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes}m`;
    }
    
    return `${hours}h ${remainingMinutes}m`;
  }
}

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
  ageRestriction?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-listmovie',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatDividerModule,
    MatDialogModule,
    FormsModule,
    DatePipe,
    MinutesToHoursPipe
  ],
  animations: [
    trigger('expandCollapse', [
      state('void', style({
        height: '0px',
        opacity: 0
      })),
      state('*', style({
        height: '*',
        opacity: 1
      })),
      transition('void <=> *', animate('300ms ease-in-out')),
    ])
  ],
  templateUrl: './listmovie.component.html',
  styleUrl: './listmovie.component.css'
})
export class ListmovieComponent implements OnInit {
  movies: Movie[] = [];
  filteredMovies: Movie[] = [];
  displayedMovies: Movie[] = [];
  isLoading = true;
  

  searchQuery = '';
  selectedGenre = '';
  selectedStatus = '';
  uniqueGenres: string[] = [];
  

  pageIndex = 0;
  pageSize = 8;
  

  expandedMovie: number | null = null;
  
  constructor(private signalRService: SignalRService) {}
 
  ngOnInit() {
    this.signalRService.isConnected().subscribe(async (isConnected) => {
      if (isConnected) {
        this.setupSignalREvents();
        this.loadMovies();
      }
    });
  }
  
  setupSignalREvents() {
    this.signalRService.onMovieData((data) => {
      console.log('Received movies', data);
      this.movies = data;
      this.filteredMovies = [...this.movies];
      this.extractGenres();
      this.updateDisplayedMovies();
      this.isLoading = false;
    });
  }
  
  loadMovies() {
    this.signalRService.getAllMovies();
  }
  
  extractGenres() {
    // Extract unique genres from movies
    const genres = new Set<string>();
    
    this.movies.forEach(movie => {
      if (movie.genre) {
        movie.genre.split(', ').forEach(g => genres.add(g.trim()));
      }
    });
    
    this.uniqueGenres = Array.from(genres).sort();
  }
  
  applyFilter() {
    this.filteredMovies = this.movies.filter(movie => {
      // Search query filter
      const searchMatch = !this.searchQuery || 
        movie.title.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
        (movie.director && movie.director.toLowerCase().includes(this.searchQuery.toLowerCase())) || 
        (movie.cast && movie.cast.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (movie.description && movie.description.toLowerCase().includes(this.searchQuery.toLowerCase()));
      
      // Genre filter
      const genreMatch = !this.selectedGenre || 
        (movie.genre && movie.genre.toLowerCase().includes(this.selectedGenre.toLowerCase()));
      
      // Status filter
      let statusMatch = true;
      if (this.selectedStatus) {
        const now = new Date();
        const releaseDate = movie.releaseDate ? new Date(movie.releaseDate) : null;
        const endDate = movie.endDate ? new Date(movie.endDate) : null;
        
        if (this.selectedStatus === 'current') {
          statusMatch = releaseDate !== null && 
            releaseDate <= now && 
            (!endDate || endDate >= now);
        } else if (this.selectedStatus === 'upcoming') {
          statusMatch = releaseDate !== null && releaseDate > now;
        } else if (this.selectedStatus === 'finished') {
          statusMatch = endDate !== null && endDate < now;
        }
      }
      
      return searchMatch && genreMatch && statusMatch;
    });
    
    // Reset to first page when filters change
    this.pageIndex = 0;
    this.updateDisplayedMovies();
  }
  
  clearSearch() {
    this.searchQuery = '';
    this.applyFilter();
  }
  
  updateDisplayedMovies() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.displayedMovies = this.filteredMovies.slice(start, end);
  }
  
  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateDisplayedMovies();
  }
  
  toggleMovieDetails(movie: Movie) {
    this.expandedMovie = this.expandedMovie === movie.movieId ? null : movie.movieId;
  }
  
  getMovieStatus(movie: Movie): string {
    const now = new Date();
    const releaseDate = movie.releaseDate ? new Date(movie.releaseDate) : null;
    const endDate = movie.endDate ? new Date(movie.endDate) : null;
    
    if (releaseDate && releaseDate > now) {
      return 'status-upcoming';
    } else if (endDate && endDate < now) {
      return 'status-finished';
    } else {
      return 'status-current';
    }
  }
  
  getMovieStatusText(movie: Movie): string {
    const now = new Date();
    const releaseDate = movie.releaseDate ? new Date(movie.releaseDate) : null;
    const endDate = movie.endDate ? new Date(movie.endDate) : null;
    
    if (releaseDate && releaseDate > now) {
      return 'Upcoming';
    } else if (endDate && endDate < now) {
      return 'Finished';
    } else {
      return 'Now Showing';
    }
  }
  
  addMovie() {
    // Implement add movie functionality
    console.log('Add new movie');
  }
  
  editMovie(movie: Movie) {
    // Implement edit movie functionality
    console.log('Edit movie', movie);
  }
  
  deleteMovie(movieId: number) {
    // Implement delete movie functionality with confirmation
    if (confirm(`Are you sure you want to delete this movie? This cannot be undone.`)) {
      console.log('Delete movie', movieId);
    }
  }
  
  openTrailer(trailerUrl: string) {
    window.open(trailerUrl, '_blank');
  }
}