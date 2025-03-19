import { Injectable } from '@angular/core';
import { environment } from '../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class ApiUrlsService {
  private baseUrl = environment.apiBaseUrl;
  private endpoints = environment.apiEndpoints;

  constructor() { }

  private formatUrl(url: string, params: {[key: string]: any}): string {
    let formattedUrl = url;
    
   
    Object.keys(params).forEach(key => {
      formattedUrl = formattedUrl.replace(`{${key}}`, params[key].toString());
    });
    
    return formattedUrl;
  }

  getUrlWithParams(endpoint: string, params: {[key: string]: any}): string {
    const url = `${this.baseUrl}${endpoint}`;
    return this.formatUrl(url, params);
  }


  // User related URLs
  getLoginUrl(): string {
    return `${this.baseUrl}${this.endpoints.login}`;
  }

  getRegisterUrl(): string {
    return `${this.baseUrl}${this.endpoints.register}`;
  }

  getUserByIdUrl(userId: string | number): string {
    return this.getUrlWithParams(this.endpoints.getUser, { userId });
  }

  getUpdateUserUrl(): string {
    return `${this.baseUrl}${this.endpoints.updateUser}`;
  }

  getChangePasswordUrl(): string {
    return `${this.baseUrl}${this.endpoints.changePassword}`;
  }

  // Movie related URLs
  getAllMoviesUrl(): string {
    return `${this.baseUrl}${this.endpoints.getAllMovies}`;
  }

  getShowingMoviesUrl(): string {
    return `${this.baseUrl}${this.endpoints.getShowingMovies}`;
  }

  getCommingUpMoviesUrl(): string {
    return `${this.baseUrl}${this.endpoints.getCommingUpMovies
    }`;
  }

  getMovieByIdUrl(movieId: number): string {
    return this.getUrlWithParams(this.endpoints.getMovieById, { movieId });
  }
  getAddMovieUrl(): string {
    return `${this.baseUrl}${this.endpoints.addMovie}`;
  }

  getUpdateMovieUrl(): string {
    return `${this.baseUrl}${this.endpoints.updateMovie}`;
  }

  getDeleteMovieUrl(id: number): string {
    return `${this.baseUrl}${this.endpoints.deleteMovie}/${id}`;
  }

  // Cinema related URLs
  getAllCinemasUrl(): string {
    return `${this.baseUrl}${this.endpoints.getAllCinemas}`;
  }

  getCinemaByIdUrl(id: number): string {
    return `${this.baseUrl}${this.endpoints.getCinemaById}/${id}`;
  }

  // Showtime related URLs
  getAllShowtimesUrl(): string {
    return `${this.baseUrl}${this.endpoints.getAllShowtimes}`;
  }

  getShowtimeByIdUrl(id: number): string {
    return `${this.baseUrl}${this.endpoints.getShowtimeById}/${id}`;
  }

  getShowtimesByMovieUrl(movieId: number): string {
    return `${this.baseUrl}${this.endpoints.getShowtimesByMovie}/${movieId}`;
  }

  getAddShowtimeUrl(): string {
    return `${this.baseUrl}${this.endpoints.addShowtime}`;
  }

  getUpdateShowtimeUrl(): string {
    return `${this.baseUrl}${this.endpoints.updateShowtime}`;
  }

  getDeleteShowtimeUrl(id: number): string {
    return `${this.baseUrl}${this.endpoints.deleteShowtime}/${id}`;
  }

  // Booking related URLs


  getBookingsByUserUrl(userId: number): string {
    return this.getUrlWithParams(this.endpoints.getBookingsByUser, { userId });
  }

  getAddBookingUrl(): string {
    return `${this.baseUrl}${this.endpoints.addBooking}`;
  }

  getCancelBookingUrl(userId: number, bookingId: number): string {
    return this.getUrlWithParams(this.endpoints.cancelBooking, { userId, bookingId });
  }
  getBookTicketsUrl(): string {
    return `${this.baseUrl}${this.endpoints.bookTickets}`;
  }

  // Seat related URLs
  getAvailableSeatsUrl(
    movieId: number,
    cinema: string, 
    date: string, 
    startTime: string, 
    endTime: string
  ): string {
    return this.getUrlWithParams(this.endpoints.getAvailableSeats, { 
      movieId, 
      cinema: encodeURIComponent(cinema), 
      date, 
      startTime, 
      endTime 
    });
  }

  // Phương thức chung để lấy URL tùy chỉnh
  getUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }

  // Phương thức lấy URL với tham số ID
  getUrlWithId(endpoint: string, id: number): string {
    return `${this.baseUrl}${endpoint}/${id}`;
  }
}