// home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  featuredMovies = [
    {
      id: 1,
      title: 'Avengers: Endgame',
      imageUrl: 'assets/images/movies/endgame.jpg',
      rating: 4.5,
      duration: '181 min',
      genre: 'Action, Adventure'
    },
    {
      id: 2,
      title: 'Spider-Man: No Way Home',
      imageUrl: 'assets/images/movies/spiderman.jpg',
      rating: 4.3,
      duration: '148 min',
      genre: 'Action, Adventure, Fantasy'
    },
    {
      id: 3,
      title: 'Dune',
      imageUrl: 'assets/images/movies/dune.jpg',
      rating: 4.7,
      duration: '155 min',
      genre: 'Sci-Fi, Drama'
    },
    {
      id: 4,
      title: 'Ghostbusters: Afterlife',
      imageUrl: 'assets/images/movies/ghostbusters.jpg',
      rating: 4.1,
      duration: '124 min',
      genre: 'Comedy, Adventure'
    }
  ];

  upcomingMovies = [
    {
      id: 1,
      title: 'Black Widow',
      imageUrl: 'assets/images/movies/black-widow.jpg',
      releaseDate: '2024-07-09',
      genre: 'Action, Adventure'
    },
    {
      id: 2,
      title: 'The Batman',
      imageUrl: 'assets/images/movies/batman.jpg',
      releaseDate: '2024-08-15',
      genre: 'Action, Crime, Drama'
    },
    {
      id: 3,
      title: 'Doctor Strange 2',
      imageUrl: 'assets/images/movies/doctor-strange.jpg',
      releaseDate: '2024-09-22',
      genre: 'Action, Fantasy'
    },
    {
      id: 4,
      title: 'Jurassic World: Dominion',
      imageUrl: 'assets/images/movies/jurassic.jpg',
      releaseDate: '2024-10-05',
      genre: 'Action, Adventure, Sci-Fi'
    }
  ];

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

  constructor() { }

  ngOnInit(): void { }
}