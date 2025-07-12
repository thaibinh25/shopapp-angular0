import { Component, OnInit, ViewChild } from '@angular/core';
import { FooterComponent } from "../footer/footer.component";
import { HeaderComponent } from "../header/header.component";
import { LoginDTO } from '../../dtos/user/login.dto';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../service/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { LoginResponse } from '../../responses/user/login.response';
import { TokenService } from '../../service/token.service';
import { RoleService } from '../../service/role.service';
import { Role } from '../../models/role';
import { UserResponse } from '../../responses/user/user.response';
import { GoogleAuthService } from '../../service/google.service';


declare const google: any;
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent implements OnInit {

  @ViewChild('loginForm') loginForm!: NgForm;
  ngAfterViewInit(): void {
    // loginForm sẽ chắc chắn được khởi tạo tại đây
    console.log(this.loginForm);
  }
  //login user
  /*phoneNumber : string = '1234567890'
  password: string = '123456'*/

  //login admin
  phoneNumber: string = ''
  password: string = ''

  roles: Role[] = []; // mảng roles
  rememberMe: boolean = true;
  selectedRole: Role | undefined; //biến để lưu giá trị được chọn từ dropdown
  userResponse?: UserResponse
  isSubmitting = false;
  googleUser: any;
  oneTapActive = false;
  isGoogleInitialized = false;
  passwordVisible: boolean = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private tokenService: TokenService,
    private roleService: RoleService,
    private route: ActivatedRoute,
    private googleService: GoogleAuthService
  ) {

  }

  ngOnInit() {
    //gọi Api lấy dnah sách roles và lưu vào biến roles
    this.getRole();

  }

  getRole(){
    this.roleService.getRoles().subscribe({
      next: (roles: Role[]) => {

        this.roles = roles;
        this.selectedRole = roles.length > 0 ? roles[0] : undefined;
      },
      error: (error: any) => {

        console.error('Error getting roles:', error);
      }
    });
  }

  



  createAccount() {

    // Chuyển hướng người dùng đến trang đăng ký (hoặc trang tạo tài khoản)
    this.router.navigate(['/register']);
  }

  onPhoneNumberChange() {
    console.log(`Phone typed: ${this.phoneNumber}`)
  }
  
  login() {
    this.isSubmitting = true;
  
    const loginDTO: LoginDTO = {
      phone_number: this.phoneNumber,
      password: this.password,
      role_id: this.selectedRole?.id ?? 1
    };
  
    this.userService.login(loginDTO).subscribe({
      next: (response: LoginResponse) => {
        const { token } = response;
  
        // Lưu token nếu chọn Remember me
        if (this.rememberMe) {
          this.tokenService.setToken(token);
        }
  
        // Fetch thông tin user
        this.userService.getUserDetail(token).subscribe({
          next: (user: any) => {
            this.userResponse = {
              ...user,
              date_of_birth: new Date(user.date_of_birth),
            };
            this.userService.saveUserResponseToLocalStorage(this.userResponse);
  
            // Điều hướng
            if (this.userResponse?.role.name === 'admin') {
              this.router.navigate(['/admin']);
            } else {
              window.location.href = '/';
            }
  
            this.isSubmitting = false; // reset submit
          },
          error: (error) => {
            this.isSubmitting = false;
            const errorMessage = error?.error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
            alert(errorMessage);
          }
        });
  
      },
      error: (error) => {
        this.isSubmitting = false;
        alert(error?.error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      }
    });
  }
  

  // login.component.ts
  loginWithGoogle() {
    const clientId = '582191794962-ksv61g67eppduhcmi5gp8s73v9chshm2.apps.googleusercontent.com';
    const redirectUri = 'https://0378-240b-c010-640-8b1-4899-3cb5-3937-bbc.ngrok-free.app/oauth2/callback';
    // Trang Angular xử lý redirect
    const scope = 'openid email profile';
    const responseType = 'code';

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;

    // 🔁 Điều hướng trình duyệt
    window.location.href = authUrl;

  }

  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
    console.log("hien password")
  }



}
