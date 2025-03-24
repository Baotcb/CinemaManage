import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ApiUrlsService } from '../../service/apiurls.service';

interface User {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  profilePictureUrl?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, 
    MaterialModule, 
    ReactiveFormsModule,
    MatProgressBarModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user?: User;
  isLoading = true;
  isEditing = false;
  isChangingPassword = false;
  profileForm: FormGroup;
  changePasswordForm: FormGroup;
  profilePicture: File | null = null;
  previewProfilePicture: string | ArrayBuffer | null = null;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private apiurls: ApiUrlsService
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(50)
      ]],
      email: ['', [
        Validators.required, 
        Validators.email,
        Validators.maxLength(100)
      ]],
      phoneNumber: ['', [
        Validators.required, 
        Validators.pattern('^(0[3|5|7|8|9])[0-9]{8}$')
      ]],
      dateOfBirth: ['', [
        Validators.required,
        this.dateOfBirthValidator
      ]],
      address: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(200)
      ]]
    });

    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [
        Validators.required, 
        Validators.minLength(8)
      ]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        //Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadUserProfile(userId);
  }

  loadUserProfile(userId: string) {
    this.isLoading = true;
    this.http.get<User>(this.apiurls.getUserByIdUrl(userId))
    .subscribe({
        next: (data) => {
          this.user = data;
          console.log('User info: ',this.user);
          this.profileForm.patchValue({
            fullName: data.fullName,
            email: data.email,
            phoneNumber: data.phoneNumber,
            dateOfBirth: data.dateOfBirth,
            address: data.address
          });
          this.isLoading = false;
        },
        error: (error) => {
          this.showErrorMessage('Không thể tải thông tin tài khoản');
          this.isLoading = false;
        }
      });
  }

  onProfilePictureChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.profilePicture = file;
      
      const reader = new FileReader();
      reader.onload = () => {
        this.previewProfilePicture = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.profileForm.patchValue({
        fullName: this.user?.fullName,
        email: this.user?.email,
        phoneNumber: this.user?.phoneNumber,
        dateOfBirth: this.user?.dateOfBirth,
        address: this.user?.address
      });
      this.previewProfilePicture = null;
      this.profilePicture = null;
    }
  }

  onSubmit() {
    if (this.profileForm.valid && this.user) {
      const updatedUser = {
        ...this.user,
        ...this.profileForm.value
      };

      this.http.put<User>(this.apiurls.getUpdateUserUrl(), updatedUser)
      .subscribe({
          next: (response) => {
            this.user = response;
            this.showSuccessMessage('Cập nhật thông tin thành công');
            this.isEditing = false;
          },
          error: (error) => {
            this.showErrorMessage('Cập nhật thông tin thất bại');
          }
        });
    }
  }

 
  dateOfBirthValidator(control: any) {
    if (!control.value) return null;
    
    const birthDate = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= 16 ? null : { 'underage': true };
  }

  togglePasswordChange() {
    this.isChangingPassword = !this.isChangingPassword;
    if (!this.isChangingPassword) {
      this.changePasswordForm.reset();
    }
    

    if (this.isChangingPassword) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (newPassword?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }

    return null;
  }

  getPasswordStrength(password: string): number {
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    return strength;
  }

  onChangePassword() {
    if (this.changePasswordForm.valid) {
    
      const currentPassword = this.changePasswordForm.get('currentPassword')?.value;
      const newPassword = this.changePasswordForm.get('newPassword')?.value;
      

      const userId = Number(localStorage.getItem('userId'));
      
      
      const payload = {
        userId: userId,
        oldPassword: currentPassword, 
        newPassword: newPassword
      };
  
      this.http.put(this.apiurls.getChangePasswordUrl(), payload)
        .subscribe({
          next: (response) => {
            this.snackBar.open('Đổi mật khẩu thành công', 'Đóng', { duration: 3000 });
            this.changePasswordForm.reset();
            this.isChangingPassword = false;
          },
          error: (error) => {
            console.error('Error changing password:', error);
            
            
            if (error.error && error.error.message) {
              this.snackBar.open(error.error.message, 'Đóng', { duration: 5000 });
            } else {
              this.snackBar.open('Đổi mật khẩu thất bại', 'Đóng', { duration: 3000 });
            }
          }
        });
    }
  }

  showSuccessMessage(message: string) {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  showErrorMessage(message: string) {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }
}