import { inject, Injectable } from "@angular/core";
import { TokenService } from "../service/token.service";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { UserService } from "../service/user.service";
import { UserResponse } from "../responses/user/user.response";

@Injectable({
    providedIn: 'root'
})
export class AdminGuard{
    userResponse?:UserResponse | null;
    constructor(
        private tokenService: TokenService, 
        private router: Router,
        private userService: UserService
    ) {}

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
        debugger
      const isTokenExpired = this.tokenService.isTokenExpired();
      const isUserIdValid = this.tokenService.getUserId() > 0;
      this.userResponse = this.userService.getUserResponseFromLocalStorage();
      const isAdmin = this.userResponse?.role.name == 'admin';

      debugger
      if (!isTokenExpired && isUserIdValid && isAdmin) {
        return true;
      } else {
        // Nếu không authenticated, bạn có thể redirect hoặc trả về một UrlTree khác.
        // Ví dụ trả về trang login:
        if (state.url !== '/login') {
            return this.router.parseUrl('/login');
          }
          return false;

      }
    }
}
// Sử dụng functional guard như sau:
export const AdminGuardFn: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree=> {
    debugger
    return inject(AdminGuard).canActivate(next, state);
  }