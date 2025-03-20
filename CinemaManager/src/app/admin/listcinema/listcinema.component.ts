import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalRService } from '../../../service/signalr.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { Subscription } from 'rxjs';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';



interface Cinema {
  cinemaId: number;
  name: string;
  address: string;
  city: string;
  phoneNumber: string;
  email: string;
  description?: string;
  openTime?: string;
  closeTime?: string;
  isActive: boolean;
}
interface Room {
  roomId: number;
  capacity : number;
  roomName: string;
  roomType: string;

}


@Component({
  selector: 'app-listcinema',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatTooltipModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  templateUrl: './listcinema.component.html',
  styleUrl: './listcinema.component.css'
})
export class ListcinemaComponent implements OnInit, OnDestroy {
  @ViewChild('cinemaForm') cinemaForm!: NgForm;
  cinemas: Cinema[] = [];
  isLoading = true;
  connectionSubscription?: Subscription;
  expandedCinema: Cinema | null = null;
  openformaddcinema = false;
  openformaddroom = false;
  flageditcinema=false;
  
   newCinema: Cinema = {
    cinemaId: 0,
    name: '',
    address: '',
    city: '',
    phoneNumber: '',
    email: '',
    description:'',
    isActive: true,
 
  };
  
  
  displayedColumns: string[] = ['cinemaId', 'name', 'address', 'city', 'phone', 'isActive', 'actions'];
  private subscriptions: Subscription = new Subscription();

  constructor(private signalRService: SignalRService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.subscriptions.add(
      this.signalRService.isConnected().subscribe(async (isConnected) => {
        if (isConnected) {
          this.setupSignalREvents();
          this.loadCinemas();
        }
      })
    );
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.signalRService.hubConnection) {
     this.signalRService.unregisterCinemaEvents();
    }
  }


  private setupSignalREvents() {
    this.signalRService.onCinemaData((cinemas: Cinema[]) => {
      this.cinemas = cinemas;
      console.log('Cinemas:', cinemas);
      this.isLoading = false;
    });
    this.signalRService.onCinemaAdded((isAdded: boolean) => {
      if (isAdded) {
        this.snackBar.open('Cinema added successfully!', 'Close', {
          duration: 3000
        });
        this.openformaddcinema = false;
        this.isLoading = false;
        this.signalRService.getAllCinemas();
      }
    });
    this.signalRService.onCinemaUpdated((isUpdated: boolean) => {
      if (isUpdated) {
        this.snackBar.open('Cinema updated successfully!', 'Close', {
          duration: 3000
        });
        this.isLoading = false;
        this.openformaddcinema = false;
        this.flageditcinema=false;
        this.signalRService.getAllCinemas();
      }
    });
    this.signalRService.onCinemaDeleted((isDeleted: boolean) => {
      if (isDeleted) {
        this.snackBar.open('Cinema deleted successfully!', 'Close', {
          duration: 3000
        });
        this.isLoading = false;
        this.signalRService.getAllCinemas();
      }
    });
    
  }

  loadCinemas() {
    this.isLoading = true;
    this.signalRService.getAllCinemas()
      .catch(err => console.error('Error while getting cinemas:', err));
    
  }
  isExpansionDetailRow = (i: number, row: any) => row.hasOwnProperty('detailRow');


  viewRooms(cinema: Cinema) {
    
    console.log('View rooms:', cinema);
    event?.stopPropagation();
    this.expandedCinema = this.expandedCinema === cinema ? null : cinema;
  }
  openAddCinemaForm() {
    
    if (this.flageditcinema==false){
      this.newCinema = {
        cinemaId: 0,
        name: '',
        address: '',
        city: '',
        phoneNumber: '',
        email: '',
        description:'',
        isActive: true,
      };
    }
    

    this.openformaddcinema = true;
  }
  cancelAddCinema() {
    this.openformaddcinema = false;
    this.flageditcinema=false;
  }

  submitAddCinema() {
    if (!this.cinemaForm.valid) {
      return;
    }
    
    this.isLoading = true;    
    if (this.flageditcinema==false){
    this.signalRService.addCinema(this.newCinema); 
    }
    else{
      this.signalRService.updateCinema(this.newCinema);
    }
    this.flageditcinema=false;
  }
  editCinema(cinema: Cinema) {
    this.flageditcinema=true;
    this.newCinema = { ...cinema };
    this. openAddCinemaForm();
    
  }


  deleteCinema(cinemaId: number) {
    
    if (confirm('Are you sure you want to delete this cinema?')) {
      this.signalRService.deleteCinema(cinemaId);
      this.isLoading = true;
    }
  }

  toggleCinemaStatus(cinema: Cinema) {
    const updatedCinema = { ...cinema, isActive: !cinema.isActive };
    this.signalRService.hubConnection.invoke('UpdateCinema', updatedCinema)
      .catch(err => console.error('Error while updating cinema status:', err));
  }
}