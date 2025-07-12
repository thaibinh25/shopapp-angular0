import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { OrderDTO } from "../dtos/order/order.dto";
import { TokenService } from "./token.service";
import { OrderResponse } from "../responses/order/order.response";

@Injectable({
    providedIn: 'root',
  })
  export class OrderService {
    private apiUrl = `${environment.apiBaseUrl}/orders`;
    private apiGetAllOrders = `${environment.apiBaseUrl}/orders/get-orders-by-keyword`;
    
    constructor(
        private http: HttpClient,
        private tokenService: TokenService
    ) {}
  
    placeOrder(orderData: OrderDTO): Observable<any> {    
        debugger
      // Gửi yêu cầu đặt hàng
        const token = this.tokenService.getToken();
        const headers = new HttpHeaders({
                'Authorization': `Bearer ${token}`
        });
      return this.http.post(this.apiUrl, orderData,{headers});
    }
    getOrderById(orderId: number): Observable<any> {
      const url = `${this.apiUrl}/${orderId}`;
      return this.http.get(url);
    }
    getOrdersByUser(userId: number): Observable<OrderResponse[]> {
      return this.http.get<OrderResponse[]>(`${this.apiUrl}/users/${userId}`);
    }
    
    applyCoupon(code: string, total: number) {
      return this.http.get<any>(`${environment.apiBaseUrl}/coupons/apply`, {
        params: { code, total }
      });
    }

    getAllOrders(keyword: string,
      page: number, limit: number
    ): Observable<OrderResponse[]>{
        const params = new HttpParams()
        .set('keyword', keyword)
        .set('page', page.toString())
        .set('limit', limit.toString());
        return this.http.get<any>(this.apiGetAllOrders,{params});
    }
    updateOrder(orderId: number, orderData: OrderDTO): Observable<any> {
      const url = `{${this.apiUrl}/${orderId}`;
      return this.http.put(url, orderData);
    }

    updateOrderStatus(orderId: number, status: string): Observable<OrderResponse> {
      return this.http.patch<OrderResponse>(`${this.apiUrl}/${orderId}/status`, null, {
        params: { status: status }
      });
    }

    deleteOrder(orderId: number): Observable<any> {
      const url = `${this.apiUrl}/${orderId}`;
      return this.http.delete(url, { responseType: 'text' });
    }
  
  }