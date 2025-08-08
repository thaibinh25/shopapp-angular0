import { Component, ViewChild } from '@angular/core';
import { FooterComponent } from "../footer/footer.component";
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '../../service/user.service';
import { RegisterDTO } from '../../dtos/user/register.dto';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  providers: [HttpClient, Router],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  @ViewChild('registerForm') registerForm!: NgForm;

  phoneNumber: string;
  email: string;
  password: string;
  retypePassword: string;
  fullName: string;
  address: string;
  zipCode: string;
  prefecture: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  isAccepted: boolean;
  dateOfBirth: Date;
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;
  isLoading = false;

  constructor(private router: Router, private userService: UserService) {
    this.phoneNumber = ''
    this.email = ''
    this.password = ''
    this.retypePassword = ''
    this.fullName = ''
    this.address = ''
    this.zipCode = '';
    this.prefecture = '';
    this.city = '';
    this.addressLine1 = '';
    this.addressLine2 = '';
    this.isAccepted = true
    this.dateOfBirth = new Date()
    this.dateOfBirth.setFullYear(this.dateOfBirth.getFullYear() - 18);
  }

  onPhoneNumberChange() {
    console.log(`Phone typed: ${this.phoneNumber}`)
  }
  register() {
    debugger

    const formattedDate = this.dateOfBirth instanceof Date
    ? this.dateOfBirth.toISOString().split('T')[0]
    : this.dateOfBirth;

    const message = `phone: ${this.phoneNumber}` +
    `email: ${this.email}` +
      `password: ${this.password}` +
      `retypePassword: ${this.retypePassword}` +
      `fullName: ${this.fullName}` +
      `zipCode: ${this.zipCode}` +
      `prefecture: ${this.prefecture}` +
      `city: ${this.city}` +
      `addressLine1: ${this.addressLine1}` +
      `addressLine2: ${this.addressLine2}` +
      `isAccepted: ${this.isAccepted}` +
      `dateOfBirth: ${this.dateOfBirth}`;

     this.isLoading= true;
    //alert(message);

    const registerDTO: RegisterDTO = {
      fullname: this.fullName,
      email: this.email,
      phone_number: this.phoneNumber,
      address: this.address,
      zip_code: this.zipCode,
      prefecture: this.prefecture,
      city: this.city,
      address_line1: this.addressLine1,
      address_line2: this.addressLine2,
      password: this.password,
      retype_password: this.retypePassword,
      date_of_birth: formattedDate,
      facebook_account_id:  null,
      google_account_id:  null,
      role_id: 1
    };
    
    
    this.userService.register(registerDTO).subscribe({
      next: (response: any) => {
        
        this.router.navigate(['/login']);
      },
      complete: () => {

      },
      error: (error: any) => {
        this.isLoading = false;
        alert(`Cannot register, error: ${error.error}`)
      }
    }
    )

  }

  //how to check password match????
  checkPasswordsMatch() {
    if (this.password !== this.retypePassword) {
      this.registerForm.form.controls['retypePassword'].setErrors({ 'PasswordMismatch': true });
    }
    else {
      this.registerForm.form.controls['retypePassword'].setErrors(null);
    }
  }

  checkAge() {
    if (this.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(this.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        this.registerForm.form.controls['dateOfBirth'].setErrors({ 'invaliAge': true });
      } else {
        this.registerForm.form.controls['dateOfBirth'].setErrors(null);
      }
    }
  }

  login() {
    this.router.navigate(['/login']);
  }

  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPassword(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  validateConfirm(confirmModel: NgModel | null) {
    if (!confirmModel) return;
    const ctrl = confirmModel.control;
    const errors = { ...(ctrl.errors || {}) };
  
    if (this.retypePassword && this.password && this.retypePassword !== this.password) {
      errors['PasswordMismatch'] = true;
    } else {
      delete errors['PasswordMismatch'];
    }
    // set null nếu không còn lỗi nào
    Object.keys(errors).length ? ctrl.setErrors(errors) : ctrl.setErrors(null);
  }

  validateAge(birthModel: NgModel | null) {
    if (!birthModel) return;
    const ctrl = birthModel.control;
    const errors = { ...(ctrl.errors || {}) };
  
    if (!this.dateOfBirth) {
      delete errors['invalidAge'];
      return ctrl.setErrors(Object.keys(errors).length ? errors : null);
    }
    const today = new Date();
    const dob = new Date(this.dateOfBirth);
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  
    if ((age < 12)) errors['invalidAge'] = true; else delete errors['invalidAge'];
    ctrl.setErrors(Object.keys(errors).length ? errors : null);
  }
  
}
