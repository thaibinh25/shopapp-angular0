import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GoogleAuthService } from '../../service/google.service';
import { TokenService } from '../../service/token.service';
import { UserService } from '../../service/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './oauth.callback.component.html'
})
export class OauthCallbackComponent implements OnInit {
  loading = false;
  constructor(
    private route: ActivatedRoute,
    private googleService: GoogleAuthService,
    private tokenService: TokenService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {


    const code = this.route.snapshot.queryParamMap.get('code');
    if (code) {
      // 👉 Chỉ gọi nếu có mã code
      this.OauthCallback(code);
    }

  }



  OauthCallback(code: string) {
    debugger
    if (!code) return;
    this.loading = true;

    this.googleService.sendTokenToBackend(code).subscribe({
      next: (res: any) => {
        debugger
        this.tokenService.setToken(res.token);
        this.userService.getUserDetail(res.token).subscribe({
          next: (user: any) => {
            debugger
            const userResponse = {
              ...user,
              date_of_birth: new Date(user.date_of_birth),
            };
            this.userService.saveUserResponseToLocalStorage(userResponse);
            this.loading = false;
            setTimeout(() => {
              this.router.navigate(['/']).then(() => {
                window.location.reload();
              });
            }, 200);
          },
          error: (err) => {
            this.loading = false;
            alert('Không lấy được thông tin người dùng');
          }
        });
      },
      error: (err) => {
        this.loading = false;
        alert('Đăng nhập Google thất bại');
        console.error(err);
      }
    });
  }


}