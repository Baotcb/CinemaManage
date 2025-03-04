// register.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MaterialModule } from '../material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

interface IUser {
  userId?: number;
  username: string;
  password: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  address?: string;
  termsAccepted: boolean;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  maxDate: Date;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // Set max date to 18 years ago (for age restriction)
    this.maxDate = new Date();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);

    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-Z0-9._-]*$')]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6),
        Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{6,}')
      ]],
      confirmPassword: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      phoneNumber: ['', [Validators.pattern('^(0|\\+84)[0-9]{9,10}$')]],
      dateOfBirth: [null],
      address: [''],
      termsAccepted: [false, [Validators.requiredTrue]] // Add this line
    }, { validators: this.passwordMatchValidator });
  }


  ngOnInit(): void {}

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : {'mismatch': true};
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      
      const userData: IUser = {
        username: this.registerForm.get('username')?.value,
        password: this.registerForm.get('password')?.value,
        email: this.registerForm.get('email')?.value,
        fullName: this.registerForm.get('fullName')?.value,
        phoneNumber: this.registerForm.get('phoneNumber')?.value,
        dateOfBirth: this.registerForm.get('dateOfBirth')?.value,
        address: this.registerForm.get('address')?.value,
        termsAccepted: this.registerForm.get('termsAccepted')?.value
      };

      console.log('User Data:', userData);
      
      // Simulate API call with a timeout
      setTimeout(() => {
        this.isLoading = false;
        this.snackBar.open('Đăng ký thành công! Vui lòng đăng nhập.', 'Đóng', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/login']);
      }, 2000);
      
      // Actual API call implementation:
      // this.userService.register(userData).subscribe({
      //   next: (response) => {
      //     this.isLoading = false;
      //     this.snackBar.open('Đăng ký thành công! Vui lòng đăng nhập.', 'Đóng', {
      //       duration: 5000,
      //       panelClass: ['success-snackbar']
      //     });
      //     this.router.navigate(['/login']);
      //   },
      //   error: (error) => {
      //     this.isLoading = false;
      //     this.snackBar.open('Đăng ký thất bại: ' + error.message, 'Đóng', {
      //       duration: 5000,
      //       panelClass: ['error-snackbar']
      //     });
      //   }
      // });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  // Helper methods for form validation messages
  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);
    
    if (control?.hasError('required')) {
      return 'Trường này là bắt buộc';
    }
    
    if (control?.hasError('email')) {
      return 'Email không hợp lệ';
    }
    
    if (control?.hasError('minlength')) {
      return `Tối thiểu ${control.errors?.['minlength'].requiredLength} ký tự`;
    }
    
    if (control?.hasError('pattern')) {
      if (controlName === 'password') {
        return 'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt';
      }
      if (controlName === 'phoneNumber') {
        return 'Số điện thoại không hợp lệ';
      }
      if (controlName === 'username') {
        return 'Tên đăng nhập chỉ được chứa chữ cái, số và các ký tự . _ -';
      }
    }
    
    return '';
  }
}