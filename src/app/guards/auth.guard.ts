import { inject, Injectable } from "@angular/core";
import { TokenService } from "../service/token.service";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class AuthGuard{
    constructor(private tokenService: TokenService, private router: Router) {}

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
        debugger
      const isTokenExpired = this.tokenService.isTokenExpired();
      const isUserIdValid = this.tokenService.getUserId() > 0;

      debugger
      if (!isTokenExpired && isUserIdValid) {
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
export const AuthGuardFn: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree=> {
    debugger
    return inject(AuthGuard).canActivate(next, state);
  }