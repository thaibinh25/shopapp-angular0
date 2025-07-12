import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Category } from "../models/category";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root'
  })
  export class CategoryService {
   
    private apiUrl  = `${environment.apiBaseUrl}/categories`;
  
    constructor(private http: HttpClient) { }
    getCategories(page: number, limit: number):Observable<Category[]> { 
      const params = new HttpParams()
        .set('page', page.toString())
        .set('limit', limit.toString());     
        return this.http.get<Category[]>(this.apiUrl, { params });           
    }
  
    create(category: Category): Observable<any> {
      return this.http.post(this.apiUrl, category,{
        responseType: 'text' as 'json'});
    }
  
    update(category: Category): Observable<any> {
      return this.http.put(`${this.apiUrl}/${category.id}`, category,{
        responseType: 'text' as 'json'});
    }
  
    delete(id: number): Observable<any> {
      return this.http.delete(`${this.apiUrl}/${id}`,{
        responseType: 'text' as 'json'});
    }
    
  }