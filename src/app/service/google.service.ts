import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { LoginResponse } from "../responses/user/login.response";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {

    
  

    constructor(private http: HttpClient) { }

    sendTokenToBackend(idToken: string): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(
            `${environment.apiBaseUrl}/auth/google`,
            { token: idToken },
            { headers: { 'Content-Type': 'application/json' } }
        );
    }

    getLoginUrl(): string {
        const clientId = '582191794962-ksv61g67eppduhcmi5gp8s73v9chshm2.apps.googleusercontent.com';
        const redirectUri = encodeURIComponent('https://ffc5791377bf.ngrok-free.app/oauth2/callback'); // ⚠️ phải khớp với Google Console
        const scope = encodeURIComponent('openid email profile');
        return `https://accounts.google.com/o/oauth2/v2/auth?` +
               `client_id=${clientId}` +
               `&redirect_uri=${redirectUri}` +
               `&response_type=token` + // hoặc code nếu dùng server side
               `&scope=${scope}` +
               `&prompt=consent`; // luôn hiện form login
      }
      
}
