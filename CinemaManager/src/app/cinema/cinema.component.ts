import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

interface Cinema {
  cinemaId: number;
  name: string;
  address: string;
  city: string;
  phoneNumber: string;
  email: string;
  description: string;
  imageUrl: string | null;
}

@Component({
  selector: 'app-cinema',
  imports: [CommonModule, MaterialModule, RouterModule, MatChipsModule,MatSelectModule,FormsModule],
  templateUrl: './cinema.component.html',
  styleUrls: ['./cinema.component.css']
})
export class CinemaComponent implements OnInit {
  cinemas: Cinema[] = [];
  isLoading = true;
  selectedDistrict = 'all';
  districts = [
    { value: 'all', viewValue: 'Tất cả' },
    { value: 'District 1', viewValue: 'Quận 1' },
    { value: 'District 3', viewValue: 'Quận 3' },
    { value: 'District 7', viewValue: 'Quận 7' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadCinemas();
  }

  loadCinemas() {
    this.isLoading = true;
    this.http.get<Cinema[]>('https://localhost:7057/api/Cinema/GetAllCinemas')
      .subscribe({
        next: (data) => {
          this.cinemas = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching cinemas:', error);
          this.isLoading = false;
        }
      });
  }

  filterByDistrict(district: string) {
    this.selectedDistrict = district;
    if (district === 'all') {
      this.loadCinemas();
    } else {
      this.cinemas = this.cinemas.filter(cinema => 
        cinema.address.includes(district)
      );
    }
  }
}