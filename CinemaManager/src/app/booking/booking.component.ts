import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

interface MovieInfo {
  movieId: number;
  title: string;
  posterUrl: string;
  duration: number;
}

interface SeatInfo {
  seatId: number;
  seatRow: string;
  seatNumber: number;
  seatType: string;
}

interface ShowtimeInfo {
  showtimeId: number;
  movieId: number;
  roomId: number;
  startTime: string;
  endTime: string;
  basePrice: number;
  movieInfo: MovieInfo;
}

interface BookingDetail {
  bookingDetailId: number;
  bookingId: number;
  showtimeId: number;
  seatId: number;
  price: number;
  ticketType: string;
  showtimeInfo: ShowtimeInfo;
  seatInfo: SeatInfo;
}

interface Booking {
  bookingId: number;
  userId: number;
  bookingDate: string;
  totalAmount: number;
  discountAmount: number;
  discountCode: string | null;
  additionalPurchases: number;
  paymentMethod: string;
  transactionId: string;
  bookingStatus: string;
  paymentStatus: string;
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
  bookingDetails: BookingDetail[];
}

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTooltipModule,
    FormsModule
],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  isLoading = true;
  error: string | null = null;
  userId: number | null = null;
  activeTab = 0; // 0: All, 1: Upcoming, 2: Past
  expandedBookingId: number | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const userIdStr = localStorage.getItem('userId');
    if (!userIdStr) {
      this.isLoading = false;
      this.error = 'Bạn cần đăng nhập để xem lịch sử đặt vé';
      return;
    }
    
    this.userId = Number(userIdStr);
    this.loadBookings();
  }

  loadBookings(): void {
    if (!this.userId) return;
    
    this.isLoading = true;
    this.http.get<Booking[]>(`https://localhost:7057/api/Booking/User/${this.userId}`)
      .subscribe({
        next: (data) => {
          this.bookings = data;
          this.sortBookingsByDate();
          this.filterBookings(this.activeTab);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading bookings:', err);
          this.error = 'Không thể tải lịch sử đặt vé. Vui lòng thử lại sau.';
          this.isLoading = false;
        }
      });
  }

  sortBookingsByDate(): void {
    this.bookings.sort((a, b) => 
      new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
    );
  }

  filterBookings(tabIndex: number): void {
    this.activeTab = tabIndex;
    const now = new Date().getTime();
    
    switch (tabIndex) {
      case 1: 
        this.filteredBookings = this.bookings.filter(booking => 
          booking.bookingDetails.some(detail => 
            new Date(detail.showtimeInfo.startTime).getTime() > now
          )
        );
        break;
      
      case 2: 
        this.filteredBookings = this.bookings.filter(booking => 
          booking.bookingDetails.every(detail => 
            new Date(detail.showtimeInfo.startTime).getTime() <= now
          )
        );
        break;
      
      default: 
        this.filteredBookings = [...this.bookings];
        break;
    }
  }

  toggleBookingDetails(bookingId: number): void {
    if (this.expandedBookingId === bookingId) {
      this.expandedBookingId = null;
    } else {
      this.expandedBookingId = bookingId;
    }
  }

  isUpcoming(showtime: string): boolean {
    return new Date(showtime).getTime() > new Date().getTime();
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmed': 
        return 'success-chip';
      case 'cancelled': 
        return 'danger-chip';
      case 'pending': 
        return 'warning-chip';
      default: 
        return 'info-chip';
    }
  }

  formatShowtime(startTime: string): string {
    const date = new Date(startTime);
    return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }


  getGroupedSeats(details: BookingDetail[]): { [key: string]: BookingDetail[] } {
    const grouped: { [key: string]: BookingDetail[] } = {};
    
    details.forEach(detail => {
      const showtimeId = detail.showtimeId;
      if (!grouped[showtimeId]) {
        grouped[showtimeId] = [];
      }
      grouped[showtimeId].push(detail);
    });
    
    return grouped;
  }

  countTicketsByType(details: BookingDetail[]): { [key: string]: number } {
    const counts: { [key: string]: number } = {};
    
    details.forEach(detail => {
      if (!counts[detail.ticketType]) {
        counts[detail.ticketType] = 0;
      }
      counts[detail.ticketType]++;
    });
    
    return counts;
  }


canCancelBooking(booking: Booking): boolean {
  // Allow cancellation only for bookings that are:
  // 1. In "Confirmed" status (not cancelled or completed)
  // 2. For future showtimes (at least 24 hours before showtime)
  
  if (booking.bookingStatus.toLowerCase() !== 'confirmed') {
    return false;
  }
  

  const now = new Date();
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  return booking.bookingDetails.some(detail => {
    const showtimeDate = new Date(detail.showtimeInfo.startTime);
    return showtimeDate > twentyFourHoursFromNow;
  });
}

confirmCancelBooking(bookingId: number): void {

  const confirmCancel = window.confirm('Bạn có chắc chắn muốn hủy đặt vé này? Tiền hoàn trả sẽ tuân theo chính sách của rạp chiếu phim.');
  
  if (confirmCancel) {
    this.cancelBooking(bookingId);
  }
}

cancelBooking(bookingId: number): void {
  if (!this.userId) {
    this.snackBar.open('Không thể hủy vé. Vui lòng đăng nhập lại.', 'Đóng', {
      duration: 5000
    });
    return;
  }
  
  this.isLoading = true;
  
  
  this.http.post(`https://localhost:7057/api/Booking/Cancel/${this.userId}/${bookingId}`, {})
    .subscribe({
      next: (response: any) => {
        this.snackBar.open(response.message || 'Đã hủy đặt vé thành công', 'Đóng', {
          duration: 3000
        });
     
        this.loadBookings();
      },
      error: (error) => {
        console.error('Error cancelling booking:', error);
        const errorMessage = error.error?.message || 'Không thể hủy đặt vé. Vui lòng thử lại sau.';
        
        this.snackBar.open(errorMessage, 'Đóng', {
          duration: 5000
        });
        this.isLoading = false;
      }
    });
}
}