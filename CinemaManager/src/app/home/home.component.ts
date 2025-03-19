// home.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ApiUrlsService } from '../../service/apiurls.service';


export interface Movie {
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
}
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  httpClient = inject(HttpClient);

  featuredMovies:Movie[] = [];

  upcomingMovies:Movie[] = [];

  
  constructor(private http: HttpClient, private apiurls : ApiUrlsService) {}

  promotions = [
    {
      id: 1,
      title: 'Giảm 50%',
      description: 'Cho học sinh, sinh viên vào ngày thứ Tư',
      icon: 'local_offer'
    },
    {
      id: 2,
      title: 'Combo Gia Đình',
      description: 'Mua 4 vé chỉ với giá 3 vé vào cuối tuần',
      icon: 'family_restroom'
    },
    {
      id: 3,
      title: 'Thẻ Thành Viên',
      description: 'Tích điểm đổi vé miễn phí cho thành viên',
      icon: 'card_membership'
    }
  ];


  ngOnInit(): void {
    let apiUrl =this.apiurls.getShowingMoviesUrl();
    this.httpClient.get(apiUrl).subscribe((data: any) => {
      this.featuredMovies = data;
    });
    apiUrl = this.apiurls.getCommingUpMoviesUrl();
    this.httpClient.get(apiUrl).subscribe((data: any) => {
      this.upcomingMovies = data;
      console.log('phim sap chieu :', this.upcomingMovies);
    });
   }

}