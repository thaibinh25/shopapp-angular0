import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { TokenService } from "../service/token.service";

@Injectable({
    providedIn: 'root'
})

export class TokenInterceptor implements HttpInterceptor {
    constructor(private tokenService: TokenService) { }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        debugger

        let req = request;

        // 1. Gắn header Authorization nếu có token
        const authToken = localStorage.getItem('access_token'); // Lấy JWT từ local storage (ví dụ)

        const excludedEndpoints = [
            'users/login',
            'users/register',
            'auth/google'
        ];

        const isExcluded = excludedEndpoints.some(endpoint =>
            req.url.includes(endpoint)
        );

        if (isExcluded) {
            return next.handle(req);
        }

        if (authToken) {
            req = req.clone({
              setHeaders: {
                Authorization: `Bearer ${authToken}`,
                'ngrok-skip-browser-warning': 'true'
              }
            });
          } else {
            req = req.clone({
              setHeaders: {
                'ngrok-skip-browser-warning': 'true'
              }
            });
          }
       

        // 3. Chuyển request xuống và bắt lỗi tại đây
        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                let userMessage: string;

                if (error.error instanceof ErrorEvent) {
                    // Lỗi phía client hoặc mất kết nối
                    userMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.';
                } else {
                    // Phân loại theo mã lỗi HTTP
                    switch (error.status) {
                        case 401:
                            userMessage = 'Bạn không có quyền (401 - Unauthorized). Vui lòng đăng nhập.';
                            // Ví dụ: logout hoặc chuyển hướng login
                            // authService.logout();
                            break;
                        case 403:
                            userMessage = 'Bị chặn truy cập (403 - Forbidden).';
                            break;
                        case 500:
                            userMessage = 'Lỗi máy chủ (500 - Internal Server Error). Vui lòng thử lại sau.';
                            break;
                        default:
                            // Thông báo chung cho lỗi khác
                            userMessage = `Lỗi ${error.status}: ${error.statusText}`;
                            break;
                    }
                }

                // Log lỗi chi tiết cho developer (tùy chọn)
                console.error('HTTP Error', error);

                // Quăng ra lỗi đã được xử lý với thông báo thân thiện
                return throwError(() => new Error(userMessage));
            })
        );
    }
}


  /*        const token = this.tokenService.getToken();
        
                // ✅ Các endpoint không cần gắn Authorization
                const excludedEndpoints = [
                  'users/login',
                  'users/register',
                  'auth/google'
                ];
            
                const isExcluded = excludedEndpoints.some(endpoint => req.url.includes(endpoint));
                if (isExcluded) {
                  return next.handle(req);
                }
            
                if (token) {
                    req = req.clone({
                        setHeaders: {
                            Authorization: `Bearer ${token}`,
                        },
                    })
                }
                return next.handle(req);
            }
            //đăng kí interceptor trong module
        }*/