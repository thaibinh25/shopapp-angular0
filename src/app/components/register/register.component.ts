import { Component, ViewChild } from '@angular/core';
import { FooterComponent } from "../footer/footer.component";
import { FormsModule, NgForm } from '@angular/forms';
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
  @ViewChild('registerForm') registerForm!:NgForm;

  phoneNumber: string;
  password: string;
  retypePassword: string;
  fullName: string;
  address: string;
  isAccepted: boolean;
  dateOfBirth: Date;
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;

  constructor (private router: Router, private userService: UserService) {
    this.phoneNumber = ''
    this.password = ''
    this.retypePassword = ''
    this.fullName=''
    this.address=''
    this.isAccepted=true
    this.dateOfBirth= new Date()
    this.dateOfBirth.setFullYear(this.dateOfBirth.getFullYear() -18);
  }

  onPhoneNumberChange(){
    console.log(`Phone typed: ${this.phoneNumber}`)
  }
  register(){
    const message = `phone: ${this.phoneNumber}`+
                    `password: ${this.password}`+
                    `retypePassword: ${this.retypePassword}`+
                    `fullName: ${this.fullName}`+
                    `address: ${this.address}`+
                    `isAccepted: ${this.isAccepted}`+
                    `dateOfBirth: ${this.dateOfBirth}`;


    //alert(message);
    
    const registerDTO:RegisterDTO= {
        "fullname": this.fullName,
        "phone_number": this.phoneNumber,
        "address":this.address,
        "password":this.password,
        "retype_password":this.retypePassword,
        "date_of_birth":this.dateOfBirth,
        "facebook_account_id":0,
        "google_account_id":0,
        "role_id":1
    }
    this.userService.register(registerDTO).subscribe({
      next: (response: any) => {
        
          this.router.navigate(['/login']);         
      },
      complete: () => {
        
      },
      error: (error: any) =>{
       alert(`Cannot register, error: ${error.error}`)
      }
    }
    )
    
  }

  //how to check password match????
  checkPasswordsMatch(){
    if (this.password !== this.retypePassword){
      this.registerForm.form.controls['retypePassword'].setErrors({'PasswordMismatch':true});
    }
    else{
      this.registerForm.form.controls['retypePassword'].setErrors(null);
    }
  }

  checkAge(){
    if (this.dateOfBirth){
      const today = new Date();
      const birthDate = new Date(this.dateOfBirth);
      let age =today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff <0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())){
        age--;
      }
      if (age <18){
        this.registerForm.form.controls['dateOfBirth'].setErrors({'invaliAge': true});
      }else{
        this.registerForm.form.controls['dateOfBirth'].setErrors(null);
      }
    }
  }

  login(){
    this.router.navigate(['/login']);
  }

  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPassword(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

}
