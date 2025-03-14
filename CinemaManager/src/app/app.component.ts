import { Component, ViewChild } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router, RouterModule } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatInputModule,
    MatFormFieldModule,
    RouterModule,
    MatDividerModule,
    MatMenuModule,
    CommonModule
  ],
  standalone: true
})
export class AppComponent {
[x: string]: any;
  title = 'CinemaManager';
  @ViewChild('sidenav') sidenav!: MatSidenav;
  @ViewChild('adminSidenav') adminSidenav!: MatSidenav;

  constructor(private router: Router) {}

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('userId');
  }
  
  get isAdmin(): boolean {
    return localStorage.getItem('isAdmin') === 'true';
  }

  toggleSidenav() {
    this.sidenav.toggle();
  }
  
  toggleAdminSidenav() {
    this.adminSidenav.toggle();
  }

  logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdmin');
    this.router.navigate(['/']);
  }
}