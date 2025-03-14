import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  public hubConnection!: HubConnection;
  private connectionEstablished = new BehaviorSubject<boolean>(false);
  
  constructor() {
    this.createConnections();
    this.startConnections();
  }

  private createConnections() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('https://localhost:7057/adminHub', {
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
        await this.hubConnection.invoke('AddMovie', movie);
    }
    public async updateMovie(movie: any): Promise<void> {
        await this.hubConnection.invoke('UpdateMovie', movie);
    }
    public async deleteMovie(movieId: number): Promise<void> {
        await this.hubConnection.invoke('DeleteMovie', movieId);
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