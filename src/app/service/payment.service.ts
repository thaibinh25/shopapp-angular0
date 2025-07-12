import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { TokenService } from "./token.service";


@Injectable({
    providedIn: 'root'
  })

 
  export class PaymentService {

    private apiUrl = `${environment.apiBaseUrl}/payments`;
    
  constructor(private http: HttpClient) {}

  createPaymentIntent(amount: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create-payment-intent`, { amount });
  }
  }