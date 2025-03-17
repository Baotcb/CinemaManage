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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

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
  createdAt?: Date;
  updatedAt?: Date;
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
    MinutesToHoursPipe,
    MatDatepickerModule,
    MatNativeDateModule
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

  isEditMovieModalOpen = false;
  movieToEdit: Movie | null = null;
  editMovieForm: NgForm = new NgForm([], []);

  isDeleteDialogOpen = false;
  movieToDelete: Movie | null = null;

  

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
    this.signalRService.onMovieAdded((data) => {
      console.log('Movie added:', data);
      this.loadMovies();
      this.closeAddMovieModal();
    });
    this.signalRService.onMovieUpdated((data) => {
      console.log('Movie updated:', data);
      this.loadMovies();
      this.closeAddMovieModal();
    });
    this.signalRService.onMovieDeleted((data) => {
      console.log('Movie deleted:', data);
      this.loadMovies();
      this.closeAddMovieModal();
    });
  }
  
  loadMovies() {
    this.signalRService.getAllMovies();
  }
  
  extractGenres() {

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
      const searchMatch = !this.searchQuery || 
        movie.title.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
        (movie.director && movie.director.toLowerCase().includes(this.searchQuery.toLowerCase())) || 
        (movie.cast && movie.cast.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (movie.description && movie.description.toLowerCase().includes(this.searchQuery.toLowerCase()));
      
      const genreMatch = !this.selectedGenre || 
        (movie.genre && movie.genre.toLowerCase().includes(this.selectedGenre.toLowerCase()));
      

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
  
  
  editMovie(movie: Movie) {
    // Clone movie để không ảnh hưởng đến phiên bản gốc
    this.movieToEdit = {...movie};
    
    // Chuyển đổi string dates thành Date objects nếu cần
    if (typeof this.movieToEdit.releaseDate === 'string') {
      this.movieToEdit.releaseDate = new Date(this.movieToEdit.releaseDate);
    }
    
    if (typeof this.movieToEdit.endDate === 'string') {
      this.movieToEdit.endDate = new Date(this.movieToEdit.endDate);
    }
    
    this.isEditMovieModalOpen = true;
  }
  closeEditMovieModal() {
    this.isEditMovieModalOpen = false;
    this.movieToEdit = null;
  }
  updateMovie() {
    if (!this.movieToEdit || !this.movieToEdit.title || this.movieToEdit.duration <= 0) {
      return;
    }
  
    const movieToUpdate = {...this.movieToEdit};
    
    // Format dates to match DateOnly format in C# (YYYY-MM-DD)
    if (movieToUpdate.releaseDate) {
      const releaseDateObj = new Date(movieToUpdate.releaseDate);
      movieToUpdate.releaseDate = new Date(
        Date.UTC(
          releaseDateObj.getFullYear(),
          releaseDateObj.getMonth(),
          releaseDateObj.getDate()
        )
      );
    }
    
    if (movieToUpdate.endDate) {
      const endDateObj = new Date(movieToUpdate.endDate);
      movieToUpdate.endDate = new Date(
        Date.UTC(
          endDateObj.getFullYear(),
          endDateObj.getMonth(),
          endDateObj.getDate()
        )
      );
    }
    
    // Đặt updatedAt là thời gian hiện tại
    movieToUpdate.updatedAt = new Date();
    
    console.log('Updating movie:', movieToUpdate);
    
    this.signalRService.updateMovie(movieToUpdate)
      .then(() => {
        console.log('Movie updated successfully');
        this.closeEditMovieModal();
      })
      .catch(error => {
        console.error('Error updating movie:', error);
      });
  }
  
  deleteMovie(movieId: number) {
    // Tìm movie với movieId
    const movie = this.movies.find(m => m.movieId === movieId);
    if (!movie) return;
    
    this.movieToDelete = movie;
    this.isDeleteDialogOpen = true;
  }

  closeDeleteDialog() {
    this.isDeleteDialogOpen = false;
    this.movieToDelete = null;
  }

  confirmDeleteMovie() {
    if (!this.movieToDelete) return;
    
    console.log('Deleting movie:', this.movieToDelete.movieId);
    
    this.signalRService.deleteMovie(this.movieToDelete.movieId)
      .then(() => {
        console.log('Movie deleted successfully');
        this.closeDeleteDialog();
      })
      .catch(error => {
        console.error('Error deleting movie:', error);
      });
  }
  
  openTrailer(trailerUrl: string) {
    window.open(trailerUrl, '_blank');
  }



isAddMovieModalOpen = false;
newMovie: Movie = {
  movieId: 0,
  title: '',
  duration: 120,
  genre: '',
  releaseDate: new Date(),
  posterUrl: ''
};


addMovie() {
  this.newMovie = {
    movieId: 0,
    title: '',
    description: '',
    duration: 120,
    releaseDate: new Date(),
    endDate: new Date(),
    genre: '',
    director: '',
    cast: '',
    posterUrl: '',
    trailerUrl: '',
    language: '',
    subtitle: '',
    rating: 0,
    ageRestriction: '',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  this.isAddMovieModalOpen = true;
}


closeAddMovieModal() {
  this.isAddMovieModalOpen = false;
}

saveMovie() {
  if (!this.newMovie.title || this.newMovie.duration <= 0) {
    return;
  }

  const movieToSave = {...this.newMovie};
  

  if (movieToSave.releaseDate) {
    const releaseDateObj = new Date(movieToSave.releaseDate);
    movieToSave.releaseDate = new Date(
      Date.UTC(
        releaseDateObj.getFullYear(),
        releaseDateObj.getMonth(),
        releaseDateObj.getDate()
      )
    );
  }
  
  if (movieToSave.endDate) {
    const endDateObj = new Date(movieToSave.endDate);
    movieToSave.endDate = new Date(
      Date.UTC(
        endDateObj.getFullYear(),
        endDateObj.getMonth(),
        endDateObj.getDate()
      )
    );
  }
  
  console.log('Saving movie:', movieToSave);
  
  this.signalRService.addMovie(movieToSave)
    .catch(error => {
      console.error('Error adding movie:', error);
    });
}
}