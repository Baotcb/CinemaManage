import { Component, OnInit, ViewChild } from '@angular/core';
import { SignalRService } from '../../../service/signalr.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface Showtime {
  showtimeId: number;
  movieId: number;
  roomId: number;
  startTime: Date | string;  
  endTime: Date | string;   // end time will be calculated based on start time + movie duration 
  basePrice: number;         
  studentPrice?: number;     
  childPrice?: number;       
  seniorPrice?: number;
}

export interface Cinema {
  cinemaId: number;
  name: string;
  address: string;
  city: string;
  phoneNumber: string;
  email: string;
  description?: string;
  rooms: Room[];
}

export interface Room {
  roomId: number;
  cinemaId: number;
  capacity: number;
  roomName: string;
  roomType: string;
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
}

@Component({
  selector: 'app-showtime',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './showtime.component.html',
  styleUrl: './showtime.component.css'
})
export class ShowtimeComponent implements OnInit {
  @ViewChild('showtimeForm') showtimeForm!: NgForm;
  
  showtimes: Showtime[] = [];
  cinemas: Cinema[] = [];
  Movies: Movie[] = [];
  selectedMovie: Movie | null = null;
  filteredMovies: Movie[] = [];
  searchTerm = '';
  displayedColumns: string[] = ['cinema', 'room', 'date', 'time', 'price', 'actions'];
  isLoading = true;
  isShowtimeDialogOpen = false;
  isDeleteDialogOpen = false;
  editMode = false;
  currentShowtime: Showtime = {
    showtimeId: 0,
    movieId: 0,
    roomId: 0,
    startTime: new Date(),
    endTime: new Date(),
    basePrice: 100000,
    studentPrice: 80000,
    childPrice: 50000,
    seniorPrice: 70000
  };
  showtimeToDelete: Showtime | null = null;
  selectedDate: Date = new Date();
  startTime = '';
  endTime = '';

  constructor(private signalRService: SignalRService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.signalRService.isConnected().subscribe(async (isConnected) => {
      if (isConnected) {
        this.setupSignalREvents();
        this.loadShowtimes();
      }
    });
  }
  
  loadShowtimes() {
    this.isLoading = true;
    this.signalRService.getAllShowtimes();
    this.signalRService.getAllCinemas();
    this.signalRService.getAllMovies();
  }
  
  setupSignalREvents(){
    this.signalRService.onShowtimeData((data: any[]) => {
      this.showtimes = data;
      console.log('show time data:', this.showtimes);
      this.isLoading = false;
    });
    
    this.signalRService.onCinemaData((data: any[]) => {
      this.cinemas = data;
      console.log('cinema data:', this.cinemas);
      this.isLoading = false;
    });
    
    this.signalRService.onMovieData((data: any[]) => {
      this.Movies = data;
      this.filteredMovies = [...this.Movies];
      console.log('movie data:', this.Movies);
      this.isLoading = false;
    });
    
    this.signalRService.onShowtimeAdded((data: boolean) => {
      if (data) {
        this.snackBar.open('Showtime added successfully', 'Close', {
          duration: 2000
        });
        this.closeShowtimeDialog();
        this.loadShowtimes();
      } else {
        this.snackBar.open('Failed to add showtime', 'Close', {
          duration: 2000
        });
      }
    });
    
    this.signalRService.onShowtimeUpdated((data: boolean) => {
      if (data) {
        this.snackBar.open('Showtime updated successfully', 'Close', {
          duration: 2000
        });
        this.closeShowtimeDialog();
        this.loadShowtimes();
      } else {
        this.snackBar.open('Failed to update showtime', 'Close', {
          duration: 2000
        });
      }
    });
    
    this.signalRService.onShowtimeDeleted((data: boolean) => {
      if (data) {
        this.snackBar.open('Showtime deleted successfully', 'Close', {
          duration: 2000
        });
        this.closeDeleteDialog();
        this.loadShowtimes();
      } else {
        this.snackBar.open('Failed to delete showtime', 'Close', {
          duration: 2000
        });
      }
    });
  }
  
  filterMovies() {
    if (!this.searchTerm) {
      this.filteredMovies = this.Movies;
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredMovies = this.Movies.filter(movie => 
      movie.title.toLowerCase().includes(term) || 
      (movie.genre && movie.genre.toLowerCase().includes(term)) ||
      (movie.director && movie.director.toLowerCase().includes(term))
    );
  }
  
  // Clear search and reset filtered movies
  clearSearch() {
    this.searchTerm = '';
    this.filterMovies();
  }
  
  // Select a movie to display its showtimes
  selectMovie(movie: Movie) {
    this.selectedMovie = movie;
  }
  
  // Get showtimes for selected movie
  getShowtimesForMovie(movieId: number): Showtime[] {
    return this.showtimes.filter(showtime => showtime.movieId === movieId);
  }
  
  // Format movie duration (minutes to hours and minutes)
  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
  
  // Format date display
  formatDate(dateStr: string | Date): string {
    // Tạo đối tượng Date từ tham số
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    
    // Hiển thị theo định dạng mong muốn với múi giờ local
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  // Format time display
  formatTime(dateStr: string | Date): string {
    // Tạo đối tượng Date từ tham số
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    
   
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  }
  
  // Format currency display
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  }
  
  // Helper to get cinema name from room ID
  getCinemaName(roomId: number): string {
    for (const cinema of this.cinemas) {
      const room = cinema.rooms.find(r => r.roomId === roomId);
      if (room) return cinema.name;
    }
    return 'Unknown Cinema';
  }
  
  // Helper to get cinema city from room ID
  getCinemaCity(roomId: number): string {
    for (const cinema of this.cinemas) {
      const room = cinema.rooms.find(r => r.roomId === roomId);
      if (room) return cinema.city;
    }
    return '';
  }
  
  // Helper to get room name from room ID
  getRoomName(roomId: number): string {
    for (const cinema of this.cinemas) {
      const room = cinema.rooms.find(r => r.roomId === roomId);
      if (room) return room.roomName;
    }
    return 'Unknown Room';
  }
  
  // Helper to get room type from room ID
  getRoomType(roomId: number): string {
    for (const cinema of this.cinemas) {
      const room = cinema.rooms.find(r => r.roomId === roomId);
      if (room) return room.roomType;
    }
    return '';
  }
  
  // Check if showtime is in the past
  isPastShowtime(showtime: Showtime): boolean {
    const now = new Date();
    const startTime = new Date(showtime.startTime);
    return startTime < now;
  }
  
  // Open dialog to add a new showtime
  openAddShowtimeDialog() {
    if (!this.selectedMovie) return;
    
    this.editMode = false;
    this.currentShowtime = {
      showtimeId: 0,
      movieId: this.selectedMovie.movieId,
      roomId: 0,
      startTime: new Date(),
      endTime: new Date(),
      basePrice: 100000,
      studentPrice: 80000,
      childPrice: 50000,
      seniorPrice: 70000
    };
    this.selectedDate = new Date();
    this.startTime = '18:00';
    this.calculateEndTime();
    this.isShowtimeDialogOpen = true;
  }
  
  // Open dialog to edit an existing showtime
  openEditShowtimeDialog(showtime: Showtime) {
    this.editMode = true;
    this.currentShowtime = {...showtime};
    
    // Tạo đối tượng Date từ chuỗi ISO (mặc định ở múi giờ UTC)
    const startTimeUtc = new Date(showtime.startTime);
    const endTimeUtc = new Date(showtime.endTime);
    
    // Lấy ngày tháng năm (không điều chỉnh múi giờ)
    this.selectedDate = new Date(
      startTimeUtc.getUTCFullYear(),
      startTimeUtc.getUTCMonth(),
      startTimeUtc.getUTCDate()
    );
    
    // Lấy giờ phút và điều chỉnh về múi giờ Việt Nam (+7)
    const startHours = startTimeUtc.getUTCHours() + 7;
    const startMinutes = startTimeUtc.getUTCMinutes();
    this.startTime = `${String(startHours % 24).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}`;
    
    const endHours = endTimeUtc.getUTCHours() + 7;
    const endMinutes = endTimeUtc.getUTCMinutes();
    this.endTime = `${String(endHours % 24).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
    
    this.isShowtimeDialogOpen = true;
  }

  // Open delete confirmation dialog
  openDeleteShowtimeDialog(showtime: Showtime) {
    this.showtimeToDelete = {...showtime};
    this.isDeleteDialogOpen = true;
  }

  // Close the showtime dialog
  closeShowtimeDialog() {
    this.isShowtimeDialogOpen = false;
  }

  // Close the delete confirmation dialog
  closeDeleteDialog() {
    this.isDeleteDialogOpen = false;
    this.showtimeToDelete = null;
  }

  // Calculate the end time based on the start time and movie duration
  calculateEndTime() {
    if (!this.selectedMovie || !this.startTime) {
      return;
    }
    
    // Parse the start time
    const [hours, minutes] = this.startTime.split(':').map(part => parseInt(part, 10));
    
    // Create a date object for the start time
    const startDateTime = new Date(this.selectedDate);
    startDateTime.setHours(hours, minutes, 0, 0);
    
    // Add the movie duration in minutes
    const endDateTime = new Date(startDateTime.getTime() + (this.selectedMovie.duration * 60 * 1000));
    
    // Format the end time to HH:MM
    this.endTime = `${String(endDateTime.getHours()).padStart(2, '0')}:${String(endDateTime.getMinutes()).padStart(2, '0')}`;
  }

  // Update discount prices based on base price
  updateDiscountPrices() {
    if (this.currentShowtime.basePrice) {
      // Set default discount rates if not already set
      this.currentShowtime.studentPrice = Math.round(this.currentShowtime.basePrice * 0.8);
      this.currentShowtime.childPrice = Math.round(this.currentShowtime.basePrice * 0.6);
      this.currentShowtime.seniorPrice = Math.round(this.currentShowtime.basePrice * 0.7);
    }
  }
  private adjustToVietnamTimeZone(date: Date): Date {
    // Tạo bản sao của đối tượng Date để không ảnh hưởng đến đối tượng gốc
    const adjustedDate = new Date(date);
    
    // Lấy độ lệch múi giờ của người dùng với UTC (tính bằng phút)
    const userTimezoneOffset = date.getTimezoneOffset();
    
    // Múi giờ Việt Nam là UTC+7 (tương đương -420 phút)
    const vietnamTimezoneOffset = -420;
    
    // Tính toán chênh lệch giữa múi giờ người dùng và múi giờ Việt Nam
    const timeDifference = vietnamTimezoneOffset - userTimezoneOffset;
    
    // Điều chỉnh thời gian
    adjustedDate.setMinutes(adjustedDate.getMinutes() + timeDifference);
    
    return adjustedDate;
  }


  saveShowtime() {
    if (!this.showtimeForm?.valid || !this.selectedMovie) {
      return;
    }
    
   
    const [startHours, startMinutes] = this.startTime.split(':').map(part => parseInt(part, 10));
    const startDateTime = new Date(this.selectedDate);
    startDateTime.setHours(startHours +7, startMinutes, 0, 0);
    
  
    const [endHours, endMinutes] = this.endTime.split(':').map(part => parseInt(part, 10));
    const endDateTime = new Date(this.selectedDate);
    endDateTime.setHours(endHours +7, endMinutes, 0, 0);
  
    this.currentShowtime.startTime = startDateTime.toISOString();
    this.currentShowtime.endTime = endDateTime.toISOString();
    

    this.currentShowtime.movieId = this.selectedMovie.movieId;
    

    if (this.editMode) {
      this.signalRService.updateShowtime(this.currentShowtime);
    } else {
      this.signalRService.addShowtime(this.currentShowtime);
    }
  }
  
  deleteShowtime() {
    if (!this.showtimeToDelete) {
      return;
    }
    this.signalRService.deleteShowtime(this.showtimeToDelete.showtimeId).catch(error => {
      console.error('Error deleting showtime:', error);
      this.snackBar.open('Error deleting showtime', 'Close', { duration: 3000 });
    });
  }
}