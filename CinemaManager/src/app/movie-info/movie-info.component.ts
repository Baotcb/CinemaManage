import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

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
  showtimes: string[];
  ageRestriction: string;
}



interface ShowtimeInfo {
  cinema: string;
  date: string;
  time: string;
  fullShowtime: string;
}


interface AvailableSeat {
  seatId: number;
  seatRow: string;
  seatNumber: number;
  seatType: string;
  priceModifier: number;
  roomName: string;
  roomType: string;
  movieTitle: string;
  cinemaName: string;
  showtimeId: number;
  startTime: string;
  endTime: string;
  standardPrice: number;
  studentPrice: number;
  childPrice: number;
  seniorPrice: number;
}

@Component({
  selector: 'app-movie-info',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule, ReactiveFormsModule, MatProgressBarModule,MatButtonToggleModule],
  templateUrl: './movie-info.component.html',
  styleUrls: ['./movie-info.component.css']
})
export class MovieInfoComponent implements OnInit {
  movieId: number = 0;
  movie?: Movie;
  isLoading = true;
  
  // Selection model
  selectedCinema?: string;
  selectedDate?: string;
  selectedTime?: string;
  
  // Available options
  availableCinemas: string[] = [];
  availableDates: string[] = [];
  availableTimes: string[] = [];
  
  // Parsed showtimes for easier processing
  parsedShowtimes: ShowtimeInfo[] = [];

  //seat selection
  availableSeats: AvailableSeat[] = [];
  selectedSeats: AvailableSeat[] = [];
  isLoadingSeats = false;
  showSeatSelection = false;
  selectedPriceType: 'standard' | 'student' | 'child' | 'senior' = 'standard';
  roomInfo: {name: string, type: string} | null = null;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar

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
        this.parseAllShowtimes();
        this.extractCinemas();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading movie:', error);
        this.isLoading = false;
      }
    });
  }

  parseShowtime(showtime: string): ShowtimeInfo {
    try {
      // Format: "CGV Landmark 81 - 10/03/2025 10:00:00 SA"
      const parts = showtime.split(' - ');
      const cinema = parts[0];
      
      // Extract date and time
      const dateTimeParts = parts[1].split(' ');
      const date = dateTimeParts[0]; // 10/03/2025
      
      // Combine time parts
      let time = dateTimeParts[1]; // 10:00:00
      if (dateTimeParts.length > 2) {
        time += ' ' + dateTimeParts[2]; // Add AM/PM (SA/CH)
      }
      
      return {
        cinema,
        date,
        time,
        fullShowtime: showtime
      };
    } catch (error) {
      console.error('Error parsing showtime:', showtime, error);
      return {
        cinema: 'Unknown',
        date: 'Unknown',
        time: 'Unknown',
        fullShowtime: showtime
      };
    }
  }

  parseAllShowtimes() {
    if (!this.movie?.showtimes) return;
    
    this.parsedShowtimes = this.movie.showtimes
      .map(showtime => this.parseShowtime(showtime))
      .filter(info => info.cinema !== 'Unknown');
  }

  extractCinemas() {
    if (!this.parsedShowtimes.length) return;
    
    // Get unique cinemas
    this.availableCinemas = [...new Set(
      this.parsedShowtimes.map(info => info.cinema)
    )];
  }

  selectCinema(cinema: string) {
    this.selectedCinema = cinema;
    this.selectedDate = undefined;
    this.selectedTime = undefined;
    this.updateAvailableDates();
  }

  updateAvailableDates() {
    if (!this.selectedCinema) return;
    

    this.availableDates = [...new Set(
      this.parsedShowtimes
        .filter(info => info.cinema === this.selectedCinema)
        .map(info => info.date)
    )];

    this.availableDates.sort((a, b) => {
      const [dayA, monthA, yearA] = a.split('/').map(Number);
      const [dayB, monthB, yearB] = b.split('/').map(Number);
      
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      
      return dateA.getTime() - dateB.getTime();
    });
  }

  selectDate(date: string) {
    this.selectedDate = date;
    this.selectedTime = undefined;
    this.updateAvailableTimes();
  }

  updateAvailableTimes() {
    if (!this.selectedCinema || !this.selectedDate) return;
    

    this.availableTimes = this.parsedShowtimes
      .filter(info => 
        info.cinema === this.selectedCinema && 
        info.date === this.selectedDate
      )
      .map(info => info.time);
  }

  selectTime(time: string) {
    this.selectedTime = time;
  }

  bookTicket() {
    if (!this.selectedCinema || !this.selectedDate || !this.selectedTime || !this.movie) return;
    
    this.isLoadingSeats = true;
    this.showSeatSelection = true;
    this.selectedSeats = [];
    
    // Parse date from DD/MM/YYYY format to YYYY-MM-DD for API
    const [day, month, year] = this.selectedDate.split('/').map(Number);
    const dateFormatted = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    // Parse start time - extract only HH:MM:SS part and handle AM/PM notation
    const timeComponents = this.selectedTime.split(' ');
    const startTimeFormatted = timeComponents[0]; // HH:MM:SS
    
    // Calculate end time based on movie duration
    const [hours, minutes, seconds] = startTimeFormatted.split(':').map(Number);
    
    // Create a Date object for time calculation
    const startDate = new Date();
    startDate.setHours(hours, minutes, seconds || 0);
    
    // Add movie duration in minutes
    const endDate = new Date(startDate.getTime() + (this.movie.duration * 60 * 1000));
    
    // Format the end time as HH:MM:SS
    const endTimeFormatted = `${endDate.getHours().toString().padStart(2, '0')}:${
      endDate.getMinutes().toString().padStart(2, '0')}:${
      endDate.getSeconds().toString().padStart(2, '0')}`;
    
    console.log(`Movie start time: ${startTimeFormatted}`);
    console.log(`Movie duration: ${this.movie.duration} minutes`);
    console.log(`Movie end time: ${endTimeFormatted}`);
    
    // Make API call with both start and end times
    const apiUrl = `https://localhost:7057/api/Seat/GetAvailableSeats/${this.movieId}/${
      encodeURIComponent(this.selectedCinema)}/${dateFormatted}/${
      startTimeFormatted}/${endTimeFormatted}`;
    
    this.http.get<AvailableSeat[]>(apiUrl).subscribe({
      next: (seats) => {
        this.availableSeats = seats;
        
        // Get room info from first seat (all seats will be in same room)
        if (seats.length > 0) {
          this.roomInfo = {
            name: seats[0].roomName,
            type: seats[0].roomType
          };
        }
        
        this.isLoadingSeats = false;
      },
      error: (error) => {
        console.error('Error loading seats:', error);
        this.isLoadingSeats = false;
        this.showSeatSelection = false;
        this.snackBar.open('Không thể tải thông tin ghế. Vui lòng thử lại sau.', 'Đóng', {
          duration: 5000
        });
      }
    });
  }
  closeSeatSelection() {
    this.showSeatSelection = false;
    this.selectedSeats = [];
  }
  
  getUniqueRows(): string[] {
    const rows = Array.from(new Set(this.availableSeats.map(seat => seat.seatRow)));
    return rows.sort(); // Sort alphabetically
  }
  
  getSeatsInRow(row: string): AvailableSeat[] {
    return this.availableSeats
      .filter(seat => seat.seatRow === row)
      .sort((a, b) => a.seatNumber - b.seatNumber);
  }
  
  toggleSeatSelection(seat: AvailableSeat): void {
    const index = this.selectedSeats.findIndex(s => s.seatId === seat.seatId);
    if (index !== -1) {
      this.selectedSeats.splice(index, 1);
    } else {
      this.selectedSeats.push(seat);
    }
  }
  
  isSeatSelected(seat: AvailableSeat): boolean {
    return this.selectedSeats.some(s => s.seatId === seat.seatId);
  }
  
  getSelectedSeatLabels(): string {
    return this.selectedSeats
      .map(seat => `${seat.seatRow}${seat.seatNumber}`)
      .join(', ');
  }
  
  getSeatPrice(seat: AvailableSeat): number {
    switch (this.selectedPriceType) {
      case 'student': return seat.studentPrice;
      case 'child': return seat.childPrice;
      case 'senior': return seat.seniorPrice;
      default: return seat.standardPrice;
    }
  }
  
  getTotalPrice(): number {
    return this.selectedSeats.reduce((total, seat) => 
      total + this.getSeatPrice(seat), 0);
  }
  
  changePriceType(type: 'standard' | 'student' | 'child' | 'senior'): void {
    this.selectedPriceType = type;
  }
  
  proceedToCheckout() {
    if (this.selectedSeats.length === 0) {
      this.snackBar.open('Vui lòng chọn ít nhất một ghế', 'Đóng', {
        duration: 3000
      });
      return;
    }
    
    // Save booking info for display in checkout UI
    const bookingDetails = {
      movieId: this.movieId,
      movieTitle: this.movie?.title,
      cinema: this.selectedCinema,
      date: this.selectedDate,
      time: this.selectedTime,
      roomName: this.roomInfo?.name,
      roomType: this.roomInfo?.type,
      seats: this.selectedSeats.map(s => ({
        id: s.seatId,
        row: s.seatRow,
        number: s.seatNumber,
        type: s.seatType,
        price: this.getSeatPrice(s)
      })),
      priceType: this.selectedPriceType,
      totalPrice: this.getTotalPrice()
    };
    
    localStorage.setItem('currentBooking', JSON.stringify(bookingDetails));
    
   
    const userId = localStorage.getItem('userId');
    
    if (!userId) {

      localStorage.setItem('redirectAfterLogin', '/checkout');
      this.snackBar.open('Vui lòng đăng nhập để đặt vé', 'Đăng nhập', {
        duration: 5000
      });
      
      this.router.navigate(['/login']);
      return;
    }
    
    
    const bookTicketRequest = {
      userId: Number(userId),
      showtimeId: this.selectedSeats[0].showtimeId, 
      seatIds: this.selectedSeats.map(seat => seat.seatId),
      ticketTypes: this.selectedSeats.map(_ => this.selectedPriceType.toUpperCase()), 
      paymentMethod: "Credit Card" 
    };
    
    
    this.isLoadingSeats = true; 
    console.log('Booking request:', bookTicketRequest);
    
    this.http.post('https://localhost:7057/api/Booking/BookTickets', bookTicketRequest)
      .subscribe({
        next: (response: any) => {
          this.isLoadingSeats = false;
          if (response.success) {
    
            localStorage.setItem('bookingConfirmation', JSON.stringify({
              bookingId: response.bookingId,
              ...bookingDetails
            }));
            
         
     
            
            this.snackBar.open('Đặt vé thành công!', 'Đóng', {
              duration: 5000
            });
          } else {
            this.snackBar.open(response.errorMessage || 'Đặt vé thất bại', 'Đóng', {
              duration: 5000
            });
          }
        },
        error: (error) => {
          this.isLoadingSeats = false;
          const errorMessage = error.error?.message || 'Đặt vé thất bại. Vui lòng thử lại sau.';
          
          this.snackBar.open(errorMessage, 'Đóng', {
            duration: 5000
          });
          
          console.error('Error booking tickets:', error);
        }
      });
  }

}