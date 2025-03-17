import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

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
  seatStatus: string;
  standardPrice: number;
  studentPrice: number;
  childPrice: number;
  seniorPrice: number;
  bookedTicketType: string | null;
  bookedPrice: number;
  bookingId: number;
  bookingStatus: string | null;
  bookedByUsername: string | null;
  bookingDate: string | null;
  showtimeInfo: {
    showtimeId: number;
    roomId: number;
    roomName: string;
    roomType: string;
    movieTitle: string;
    startTime: string;
    endTime: string;
    basePrice: number;
  };
}

@Component({
  selector: 'app-movie-info',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule, ReactiveFormsModule, MatProgressBarModule,MatButtonToggleModule,MatTooltipModule],
  templateUrl: './movie-info.component.html',
  styleUrls: ['./movie-info.component.css']
})
export class MovieInfoComponent implements OnInit {
  movieId: number = 0;
  movie?: Movie;
  isLoading = true;
  

  selectedCinema?: string;
  selectedDate?: string;
  selectedTime?: string;
  

  availableCinemas: string[] = [];
  availableDates: string[] = [];
  availableTimes: string[] = [];
  

  parsedShowtimes: ShowtimeInfo[] = [];


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

      const parts = showtime.split(' - ');
      const cinema = parts[0];
      

      const dateTimeParts = parts[1].split(' ');
      const date = dateTimeParts[0]; 
      

      let timeString = dateTimeParts[1]; 
      let period = '';
      
      if (dateTimeParts.length > 2) {
        period = dateTimeParts[2];

        const originalTime = `${timeString} ${period}`;
        const time24 = this.convertTo24HourFormat(originalTime);
        
        return {
          cinema,
          date,
          time: time24, 
          fullShowtime: showtime
        };
      }
      
      return {
        cinema,
        date,
        time: timeString, 
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
  formatTimeForDisplay(time24: string): string {
    if (!time24) return '';
    
    const [hours, minutes] = time24.split(':').map(Number);
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
  }

  parseAllShowtimes() {
    if (!this.movie?.showtimes) return;
    
    this.parsedShowtimes = this.movie.showtimes
      .map(showtime => this.parseShowtime(showtime))
      .filter(info => info.cinema !== 'Unknown');
  }

  extractCinemas() {
    if (!this.parsedShowtimes.length) return;
    

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
    
    const [day, month, year] = this.selectedDate.split('/').map(Number);
    const dateFormatted = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    const startTimeFormatted = this.selectedTime;
    
 
    const [hours, minutes, seconds] = startTimeFormatted.split(':').map(Number);
    

    const startDate = new Date();
    startDate.setHours(hours, minutes, seconds || 0);
    

    const endDate = new Date(startDate.getTime() + (this.movie.duration * 60 * 1000));
    
    const endTimeFormatted = `${endDate.getHours().toString().padStart(2, '0')}:${
      endDate.getMinutes().toString().padStart(2, '0')}:${
      endDate.getSeconds().toString().padStart(2, '0')}`;
    
    console.log(`Movie start time: ${startTimeFormatted}`);
    console.log(`Movie duration: ${this.movie.duration} minutes`);
    console.log(`Movie end time: ${endTimeFormatted}`);
      
  
    const apiUrl = `https://localhost:7057/api/Seat/GetAvailableSeats/${this.movieId}/${
      encodeURIComponent(this.selectedCinema)}/${dateFormatted}/${
      startTimeFormatted}/${endTimeFormatted}`;
    
    this.http.get<AvailableSeat[]>(apiUrl).subscribe({
      next: (seats) => {
       
       // this.availableSeats = seats.filter(seat => seat.seatStatus === "Available");
        this.availableSeats = seats;
        
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
  isSeatAvailable(seat: AvailableSeat): boolean {
    return seat.seatStatus === "Available";
  }
  
  toggleSeatSelection(seat: AvailableSeat): void {
   
    if (!this.isSeatAvailable(seat)) return;
    
    const index = this.selectedSeats.findIndex(s => s.seatId === seat.seatId);
    if (index !== -1) {
      this.selectedSeats.splice(index, 1);
    } else {
      this.selectedSeats.push(seat);
    }
  }
  convertTo24HourFormat(timeStr: string): string {
    
    if (timeStr.includes(' ')) {
      const [time, period] = timeStr.split(' ');
      const [hours, minutes, seconds] = time.split(':').map(Number);
      

      let hour24 = hours;
      
    
      if (period === 'CH' && hours < 12) {
        hour24 = hours + 12;
      }
      

      if (period === 'SA' && hours === 12) {
        hour24 = 0;
      }
      

      return `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${
        seconds ? seconds.toString().padStart(2, '0') : '00'}`;
    }
    

    return timeStr;
  }
  closeSeatSelection() {
    this.showSeatSelection = false;
    this.selectedSeats = [];
  }
  
  getUniqueRows(): string[] {
    const rows = Array.from(new Set(this.availableSeats.map(seat => seat.seatRow)));

    return rows.sort((a, b) => {
      const isALetter = isNaN(Number(a));
      const isBLetter = isNaN(Number(b));
      
      if (isALetter && !isBLetter) return -1;
      if (!isALetter && isBLetter) return 1;
      
      if (isALetter) return a.localeCompare(b);
      return Number(a) - Number(b);
    });
  }
  
  getSeatsInRow(row: string): AvailableSeat[] {
    return this.availableSeats
      .filter(seat => seat.seatRow === row)
      .sort((a, b) => a.seatNumber - b.seatNumber);
  }
  getSeatTooltip(seat: AvailableSeat): string {
    if (seat.seatStatus === "Available") {
      return `Ghế ${seat.seatRow}${seat.seatNumber} (${seat.seatType})\nGiá: ${this.getSeatPrice(seat).toLocaleString('vi-VN')} VND`;
    } else if (seat.bookingStatus === "Cancelled") {
      return `Ghế ${seat.seatRow}${seat.seatNumber} - Đã hủy`;
    } else {
      return `Ghế ${seat.seatRow}${seat.seatNumber} - Đã đặt`;
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
              this.router.navigate(['/booking']);
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