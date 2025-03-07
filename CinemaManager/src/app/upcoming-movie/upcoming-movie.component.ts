import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-upcoming-movie',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './upcoming-movie.component.html',
  styleUrls: ['./upcoming-movie.component.css']
})
export class UpcomingMovieComponent implements OnInit {
    httpClient = inject(HttpClient);
  selectedSort: string = 'date';
  upcomingMovies: Array<{
    title: string,
    releaseDate: string,
    description: string,
    genre: string,
    duration: string,
    imageUrl: string
  }> = [
    
  ];
  
  ngOnInit(): void {
    let apiUrl = 'https://localhost:7057/api/Movie/GetUpComingMovies';
    this.httpClient.get(apiUrl).subscribe((data: any) => {
      this.upcomingMovies = data;
      console.log('phim sap chieu :', this.upcomingMovies);
    });
    this.sortMovies('date');
  }

  sortMovies(value: string) {
    this.selectedSort = value;
    if (value === 'date') {
      this.upcomingMovies.sort((a, b) => 
        new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
      );
    } else if (value === 'name') {
      this.upcomingMovies.sort((a, b) => 
        a.title.localeCompare(b.title)
      );
    }
  }
}