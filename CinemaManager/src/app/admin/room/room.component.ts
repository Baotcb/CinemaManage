import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { SignalRService } from '../../../service/signalr.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs/internal/Subscription';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

interface Cinema {
  cinemaId: number;
  name: string;
  address: string;
  city: string;
  phoneNumber: string;
  email: string;
  description?: string;
  rooms: Room[];
}

interface Room {
  roomId: number;
  cinemaId: number;
  capacity: number;
  roomName: string;
  roomType: string;
}

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.css'
})
export class RoomComponent implements OnInit, OnDestroy {
  @ViewChild('roomForm') roomForm!: NgForm;
  
  cinemas: Cinema[] = [];
  filteredCinemas: Cinema[] = [];
  connectionSubscription?: Subscription;
  isLoading = true;
  searchQuery = '';
  
  // Room dialog properties
  isRoomDialogOpen = false;
  isDeleteDialogOpen = false;
  editingRoom = false;
  currentCinema: Cinema | null = null;
  currentRoom: Room = this.getEmptyRoom();
  roomToDelete: Room | null = null;
  cinemaForDelete: Cinema | null = null;

  constructor(private signalRService: SignalRService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.signalRService.isConnected().subscribe(async (isConnected) => {
      if (isConnected) {
        this.setupSignalREvents();
        this.loadRooms();
      }
    });
  }
  
  ngOnDestroy() {
    if (this.connectionSubscription) {
      this.connectionSubscription.unsubscribe();
    }
  }
  
  setupSignalREvents() {
    this.signalRService.onRoomData((cinemas: Cinema[]) => {
      this.cinemas = cinemas;
      this.filteredCinemas = [...this.cinemas];
      this.isLoading = false;
      console.log('Cinemas:', cinemas);
    });
    
    // Add event handlers for room operations
    this.signalRService.onAddRoom( (success: boolean) => {
      if (success) {
        this.snackBar.open('Room added successfully!', 'Close', {
          duration: 3000
        });
        this.closeRoomDialog();
        this.loadRooms();
      }
    });
    
    this.signalRService.onUpdateRoom((success: boolean) => {
      if (success) {
        this.snackBar.open('Room updated successfully!', 'Close', {
          duration: 3000
        });
        this.closeRoomDialog();
        this.loadRooms();
      }
    });
    
    this.signalRService.onDeleteRoom( (success: boolean) => {
      if (success) {
        this.snackBar.open('Room deleted successfully!', 'Close', {
          duration: 3000
        });
        this.closeDeleteDialog();
        this.loadRooms();
      }
    });
  }
  
  loadRooms() {
    this.isLoading = true;
    this.signalRService.getAllRooms();
  }
  
  filterCinemas() {
    if (!this.searchQuery) {
      this.filteredCinemas = [...this.cinemas];
      return;
    }
    
    const query = this.searchQuery.toLowerCase();
    this.filteredCinemas = this.cinemas.filter(cinema => 
      cinema.name.toLowerCase().includes(query) || 
      cinema.city.toLowerCase().includes(query) || 
      cinema.address.toLowerCase().includes(query)
    );
  }
  
  clearSearch() {
    this.searchQuery = '';
    this.filterCinemas();
  }
  
  getEmptyRoom(): Room {
    return {
      roomId: 0,
      cinemaId: 0,
      capacity: 0,
      roomName: '',
      roomType: 'STANDARD'
    };
  }
  
  openAddRoomDialog(cinema: Cinema) {
    this.editingRoom = false;
    this.currentCinema = cinema;
    this.currentRoom = this.getEmptyRoom();
    this.currentRoom.cinemaId = cinema.cinemaId;
    this.isRoomDialogOpen = true;
  }
  
  openEditRoomDialog(cinema: Cinema, room: Room) {
    this.editingRoom = true;
    this.currentCinema = cinema;
    this.currentRoom = { ...room };
    this.isRoomDialogOpen = true;
  }
  
  closeRoomDialog() {
    this.isRoomDialogOpen = false;
    setTimeout(() => {
      this.currentCinema = null;
      this.currentRoom = this.getEmptyRoom();
      this.editingRoom = false;
    }, 300);
  }
  
  saveRoom() {
    if (!this.roomForm.valid) return;
    
    if (this.editingRoom) {
      this.signalRService.updateRoom(this.currentRoom)
        .catch(err => {
          console.error('Error updating room:', err);
          this.snackBar.open('Failed to update room', 'Close', {
            duration: 3000
          });
        });
    } else {
      this.signalRService.addRoom(this.currentRoom)
        .catch(err => {
          console.error('Error adding room:', err);
          this.snackBar.open('Failed to add room', 'Close', {
            duration: 3000
          });
        });
    }
  }
  
  openDeleteRoomDialog(cinema: Cinema, room: Room) {
    this.cinemaForDelete = cinema;
    this.roomToDelete = room;
    this.isDeleteDialogOpen = true;
  }
  
  cancelDeleteRoom() {
    this.closeDeleteDialog();
  }
  
  closeDeleteDialog() {
    this.isDeleteDialogOpen = false;
    setTimeout(() => {
      this.cinemaForDelete = null;
      this.roomToDelete = null;
    }, 300);
  }
  
  confirmDeleteRoom() {
    if (!this.roomToDelete) return;
    
    this.signalRService.deleteRoom(this.roomToDelete.roomId)
      .catch(err => {
        console.error('Error deleting room:', err);
        this.snackBar.open('Failed to delete room', 'Close', {
          duration: 3000
        });
      });
  }
}