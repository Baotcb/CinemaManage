import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

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
  selectedSort: string = 'date';
  upcomingMovies: Array<{
    title: string,
    releaseDate: string,
    description: string,
    genre: string,
    duration: string,
    imageUrl: string
  }> = [
    {
      title: 'Avatar 3',
      releaseDate: '2025-12-19',
      description: 'Phần tiếp theo của loạt phim Avatar, người xem sẽ được khám phá thêm nhiều vùng đất và sinh vật mới trên Pandora. Jake Sully và gia đình phải đối mặt với những thách thức mới.',
      genre: 'Khoa học viễn tưởng',
      duration: '180 phút',
      imageUrl: 'assets/images/movies/avatar3.jpg'
    },
    {
      title: 'Black Panther: Wakanda Forever 2',
      releaseDate: '2025-07-10',
      description: 'Phần tiếp theo của Black Panther: Wakanda Forever, khám phá câu chuyện mới về vương quốc Wakanda và những thách thức mà họ phải đối mặt trên trường quốc tế.',
      genre: 'Hành động, Phiêu lưu',
      duration: '155 phút',
      imageUrl: 'assets/images/movies/black-panther2.jpg'
    },
    {
      title: 'Dune: Part Three',
      releaseDate: '2025-11-15',
      description: 'Phần cuối cùng của bộ ba phim Dune, kết thúc hành trình của Paul Atreides khi anh dẫn dắt người Fremen trong cuộc chiến giành lại quyền kiểm soát hành tinh Arrakis.',
      genre: 'Khoa học viễn tưởng, Phiêu lưu',
      duration: '166 phút',
      imageUrl: 'assets/images/movies/dune3.jpg'
    },
    {
      title: 'Doctor Strange 3',
      releaseDate: '2025-05-28',
      description: 'Stephen Strange phải đối mặt với những hậu quả từ việc làm xáo trộn đa vũ trụ trong các cuộc phiêu lưu trước đó, dẫn đến sự xuất hiện của những kẻ thù mới từ các thực tại khác.',
      genre: 'Hành động, Phiêu lưu',
      duration: '140 phút',
      imageUrl: 'assets/images/movies/doctor-strange3.jpg'
    },
    {
      title: 'Fantastic Beasts 4',
      releaseDate: '2025-08-20',
      description: 'Newt Scamander tiếp tục cuộc phiêu lưu khám phá thế giới phù thủy với những sinh vật huyền bí mới và vai trò ngày càng lớn trong cuộc chiến chống lại Grindelwald.',
      genre: 'Phiêu lưu, Kỳ ảo',
      duration: '145 phút',
      imageUrl: 'assets/images/movies/fantastic-beasts4.jpg'
    },
    {
      title: 'Godzilla vs Kong 2',
      releaseDate: '2025-04-15',
      description: 'Hai quái vật huyền thoại đối đầu một lần nữa khi một mối đe dọa mới xuất hiện, buộc con người phải đặt niềm tin vào họ để cứu thế giới khỏi sự hủy diệt.',
      genre: 'Hành động, Viễn tưởng',
      duration: '135 phút',
      imageUrl: 'assets/images/movies/godzilla-kong2.jpg'
    }
  ];
  
  ngOnInit(): void {
    // Sort by date by default when component initializes
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