import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Category } from "../models/category";
import { environment } from "../../environments/environment";
import { Brand } from "../models/Brand";

@Injectable({
    providedIn: 'root'
  })
  export class BrandService {
    
    private apiUrl  = `${environment.apiBaseUrl}/brands`;
  
    constructor(private http: HttpClient) { }
    getBrands(page: number, limit: number):Observable<Brand[]> {
      const params = new HttpParams()
        .set('page', page.toString())
        .set('limit', limit.toString());     
        return this.http.get<Brand[]>(this.apiUrl, { params });           
    }
  
    getBrandsByCategory(categoryId: number): Observable<Brand[]> {
        const url = categoryId && categoryId !== 0 
          ? `${this.apiUrl}/category/${categoryId}`
          : `${this.apiUrl}/category/0`;
        return this.http.get<Brand[]>(url);
      }

    create(brand: Brand): Observable<any> {
      return this.http.post(this.apiUrl, brand,{
        responseType: 'text' as 'json'});
    }
  
    update(brand: Brand): Observable<any> {
      return this.http.put(`${this.apiUrl}/${brand.id}`, brand,{
        responseType: 'text' as 'json'});
    }
  
    delete(id: number): Observable<any> {
      return this.http.delete(`${this.apiUrl}/${id}`,{
        responseType: 'text' as 'json'});
    }
    
  }