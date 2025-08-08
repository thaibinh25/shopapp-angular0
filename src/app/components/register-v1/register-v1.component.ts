import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

@Component({
  selector: 'app-register-v1',
  imports: [CommonModule, FormsModule],
  templateUrl: './register-v1.component.html',
  styleUrl: './register-v1.component.scss'
})
export class RegisterV1Component {
  loginForm: LoginForm = {
    email: '',
    password: '',
    rememberMe: false
  };

  showPassword = false;
  isLoading = false;
  emailError = '';
  passwordError = '';

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    this.clearErrors();
    
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      console.log('Login attempt:', this.loginForm);
      this.isLoading = false;
      // Handle successful login
      alert('ログインに成功しました！');
    }, 2000);
  }

  validateForm(): boolean {
    let isValid = true;

    if (!this.loginForm.email) {
      this.emailError = 'メールアドレスを入力してください';
      isValid = false;
    } else if (!this.isValidEmail(this.loginForm.email)) {
      this.emailError = '有効なメールアドレスを入力してください';
      isValid = false;
    }

    if (!this.loginForm.password) {
      this.passwordError = 'パスワードを入力してください';
      isValid = false;
    } else if (this.loginForm.password.length < 6) {
      this.passwordError = 'パスワードは6文字以上で入力してください';
      isValid = false;
    }

    return isValid;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  clearErrors() {
    this.emailError = '';
    this.passwordError = '';
  }

  onForgotPassword(event: Event) {
    event.preventDefault();
    console.log('Forgot password clicked');
    // Navigate to forgot password page
  }

  loginWithGoogle() {
    console.log('Login with Google');
    // Implement Google OAuth
  }

  loginWithLine() {
    console.log('Login with LINE');
    // Implement LINE OAuth
  }

  goToRegister(event: Event) {
    event.preventDefault();
    console.log('Navigate to register');
    // Navigate to register page
  }
}