import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { ApiUrlsService } from './apiurls.service';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  public hubConnection!: HubConnection;
  private connectionEstablished = new BehaviorSubject<boolean>(false);
  
  constructor(private apiUrls: ApiUrlsService) {
    this.createConnections();
    this.startConnections();
  }

  private createConnections() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.apiUrls.getSignalRBaseUrl(), {
        withCredentials: true
      })
      .withAutomaticReconnect()
      .build();
  }
  
  private startConnections() {
    this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR Connected!');
        this.connectionEstablished.next(true);
      })
      .catch(err => console.error('Error while establishing connection : ', err));
  }

   // Server side methods
    public async getAllCinemas():Promise<void> {
        await this.hubConnection.invoke('GetCinemas');
    }
    public async getAllMovies():Promise<void> {
        await this.hubConnection.invoke('GetMovies');
    }
    public async getAllRooms():Promise<void> {
      await this.hubConnection.invoke('GetRooms');
    }
    public async getAllShowtimes():Promise<void> {
      await this.hubConnection.invoke('GetShowtimes');
    }

      // Event listeners

      //cinmea
    public onCinemaData(callback: (data: any[]) => void) {
        this.hubConnection.on('GetCinemas', callback);
    }
    public onCinemaAdded(callback: (data: boolean) => void) {
        this.hubConnection.on('AddCinema', callback);
    }
    public onCinemaUpdated(callback: (data: boolean) => void) {
        this.hubConnection.on('UpdateCinema', callback);
    }
    public onCinemaDeleted(callback: (data: boolean) => void) {
        this.hubConnection.on('DeleteCinema', callback);
    }
    //movie
    public onMovieData(callback: (data: any[]) => void) {
      this.hubConnection.on('GetMovies', callback);
    }
    public onMovieAdded(callback: (data: boolean) => void) {
      this.hubConnection.on('AddMovie', callback);
    }
    public onMovieUpdated(callback: (data: boolean) => void) {
      this.hubConnection.on('UpdateMovie', callback);
    }
    public onMovieDeleted(callback: (data: boolean) => void) {
      this.hubConnection.on('DeleteMovie', callback);
    }


    //room
    public onRoomData(callback: (data: any[]) => void) {
      this.hubConnection.on('GetRooms', callback);
    }
    public onUpdateRoom(callback: (data: boolean) => void) {
      this.hubConnection.on('UpdateRoom', callback);
    }
    public onAddRoom(callback: (data: boolean) => void) {
      this.hubConnection.on('AddRoom', callback);
    }
    public onDeleteRoom(callback: (data: boolean) => void) {
      this.hubConnection.on('DeleteRoom', callback);
    }

    //showtime
    public onShowtimeData(callback: (data: any[]) => void) {
      this.hubConnection.on('GetShowtimes', callback);
    }
    public onShowtimeAdded(callback: (data: boolean) => void) {
      this.hubConnection.on('AddShowtime', callback);
    }
    public onShowtimeUpdated(callback: (data: boolean) => void) {
      this.hubConnection.on('UpdateShowtime', callback);
    }
    public onShowtimeDeleted(callback: (data: boolean) => void) {
      this.hubConnection.on('DeleteShowtime', callback);
    }
    //CRUD operations

    //cinema
    public async addCinema(cinema: any): Promise<void> {
        await this.hubConnection.invoke('AddCinema', cinema);
    }
    public async updateCinema(cinema: any): Promise<void> {
        await this.hubConnection.invoke('UpdateCinema', cinema);
    }
    public async deleteCinema(cinemaId: number): Promise<void> {
        await this.hubConnection.invoke('DeleteCinema', cinemaId);
    }
    //movie
    public async addMovie(movie: any): Promise<void> {
      console.log('Adding movie via SignalR:', movie);
      const movieToSend = {
        ...movie,
        releaseDate: movie.releaseDate ? movie.releaseDate.toISOString().split('T')[0] : null,
        endDate: movie.endDate ? movie.endDate.toISOString().split('T')[0] : null
      };
      
      return this.hubConnection.invoke('AddMovie', movieToSend)
        .catch(err => {
          console.error('Error invoking AddMovie:', err);
          throw err;
        });
    }
    public async updateMovie(movie: any): Promise<void> {
      console.log('Updating movie via SignalR:', movie);
      const movieToSend = {
        ...movie,
        releaseDate: movie.releaseDate ? movie.releaseDate.toISOString().split('T')[0] : null,
        endDate: movie.endDate ? movie.endDate.toISOString().split('T')[0] : null,
        updatedAt: new Date().toISOString()
      };
      
      return this.hubConnection.invoke('UpdateMovie', movieToSend)
        .catch(err => {
          console.error('Error invoking UpdateMovie:', err);
          throw err;
        });
    }
    public async deleteMovie(movieId: number): Promise<void> {
      console.log('Deleting movie via SignalR, ID:', movieId);
      return this.hubConnection.invoke('DeleteMovie', movieId)
        .catch(err => {
          console.error('Error invoking DeleteMovie:', err);
          throw err;
        });
    }
    //room
    public async addRoom(room: any): Promise<void> {
        await this.hubConnection.invoke('AddRoom', room);
    }
    public async updateRoom(room: any): Promise<void> {
        await this.hubConnection.invoke('UpdateRoom', room);
    }
    public async deleteRoom(roomId: number): Promise<void> {
        await this.hubConnection.invoke('DeleteRoom', roomId);
    }
    //showtime
    public async addShowtime(showtime: any): Promise<void> {
        await this.hubConnection.invoke('AddShowtime', showtime);
    }
    public async updateShowtime(showtime: any): Promise<void> {
        await this.hubConnection.invoke('UpdateShowtime', showtime);
    }
    public async deleteShowtime(showtimeId: number): Promise<void> {
        await this.hubConnection.invoke('DeleteShowtime', showtimeId);
    }
    // SignalR connection status

  public isConnected() {
    return this.connectionEstablished.asObservable();
  }

  public disconnect() {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }
}