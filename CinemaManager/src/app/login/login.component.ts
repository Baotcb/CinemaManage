import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MaterialModule } from '../material.module';
import { CommonModule } from '@angular/common';
import { catchError, finalize, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

interface IUser {
  userId: number;
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  isAdmin: boolean;
}

@Component({
  standalone: true,
  imports: [
    MaterialModule, 
    ReactiveFormsModule, 
    CommonModule,
    RouterModule
  ],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private router = inject(Router);
  private httpClient = inject(HttpClient);
  private fb = inject(FormBuilder);
  
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  loginError: string | null = null;
  
  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
    

    window.addEventListener('DOMContentLoaded', () => {
      const card = document.querySelector('.cinema-card') as HTMLElement;
      const spotlight = document.querySelector('.spotlight') as HTMLElement;
      
      if (card && spotlight) {
        card.addEventListener('mousemove', (e: MouseEvent) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          spotlight.style.left = `${x}px`;
          spotlight.style.top = `${y}px`;
        });
      }
    });
  }

  ngOnInit(): void {
   
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const user = {
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value,
      };
      
      this.isLoading = true;
      this.loginError = null;
      
      const apiUri = 'https://localhost:7057/api/User/Login';
      const httpOptions = {
        headers: new HttpHeaders({
          'Authorization': 'my-auth-token',
          'Content-Type': 'application/json'
        })
      };
      
      this.httpClient.post<IUser>(apiUri, user, httpOptions)
        .pipe(
          tap((response: IUser) => {
            console.log('Login response:', response);
            localStorage.setItem('isAdmin', response.isAdmin.toString());
            if (response && response.isAdmin != true) {

              localStorage.setItem('username', response.username);
              localStorage.setItem('userId', response.userId.toString());
              
              //localStorage.setItem('role', response.role.toString());
             
              if (this.loginForm.get('rememberMe')?.value) {
               
                //localStorage.setItem('user_role', response.role.toString());
              } else {
                // sessionStorage.setItem('auth_token', 'user_token'); 
                // sessionStorage.setItem('user_role', response.role.toString());
              }
              response.password = '';
              response.email = '';
              response.phoneNumber = '';
              
              this.router.navigate(['/home']);
            } else {

              this.router.navigate(['/admin/listcinema']);
            }
          }),
          catchError(error => {
            console.error('Login error:', error);
            this.loginError = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.';
            return throwError(() => error);
          }),
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe();
    }
  }

  getEmailErrorMessage(): string {
    const emailControl = this.loginForm.get('email');
    if (emailControl?.hasError('required')) {
      return 'Email không được để trống';
    }
    return emailControl?.hasError('email') ? 'Email không đúng định dạng' : '';
  }

  getPasswordErrorMessage(): string {
    const passwordControl = this.loginForm.get('password');
    if (passwordControl?.hasError('required')) {
      return 'Mật khẩu không được để trống';
    }
    return passwordControl?.hasError('minlength') ? 'Mật khẩu phải có ít nhất 6 ký tự' : '';
  }
}