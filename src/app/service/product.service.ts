import { Inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { Product } from "../models/product";
import { ProductResponse } from "../responses/product/product.response";
import { ProductListResponse } from "../responses/product/product.list.response";


@Injectable({
    providedIn: 'root'
})

export class ProductService {
    
    private apiUrl = `${environment.apiBaseUrl}/products`;
    private apiUrlProductImage = `${environment.apiBaseUrl}/productImages`

    constructor(private http: HttpClient) { }

    getProducts(
      keyword: string, 
      categoryIds: number[],
      brandIds: number[],
      minPrice: number | null, 
      maxPrice: number | null,
      minRating: number | null,         
      badge: string | null,  
      sortBy: string,
      page: number, 
      limit: number
    ): Observable<ProductListResponse> {
      let params = new HttpParams()
        .set('keyword', keyword)
        .set('page', page.toString())
        .set('limit', limit.toString())
        .set('sort', sortBy);
    
      categoryIds.forEach(id => {
        params = params.append('category_id', id.toString());
      });
    
      brandIds.forEach(id => {
        params = params.append('brand_id', id.toString());
      });
    
      if (minPrice !== null && minPrice !== undefined) {
        params = params.set('minPrice', minPrice.toString());
      }
    
      if (maxPrice !== null && maxPrice !== undefined) {
        params = params.set('maxPrice', maxPrice.toString());
      }
    
      if (minRating !== null && minRating !== undefined) {
        params = params.set('minRating', minRating.toString());
      }
    
      if (badge) {
        params = params.set('badge', badge);
      }
    
      return this.http.get<ProductListResponse>(this.apiUrl, { params });
    }
    
    getAvailableBadges(): Observable<string[]> {
      return this.http.get<string[]>(`${this.apiUrl}/badges`);
    }

    getDetailProduct(productId: number): Observable<ProductResponse>  {
        return this.http.get<ProductResponse>(`${this.apiUrl}/${productId}`);
      }
    getProductsByIds(productIds: number[]): Observable<Product[]> {
      // Chuyển danh sách ID thành một chuỗi và truyền vào params
      debugger
      const params = new HttpParams().set('ids', productIds.join(',')); 
      return this.http.get<Product[]>(`${this.apiUrl}/by-ids`, { params });
    }

    getAllProductsWithoutPagination(): Observable<ProductResponse[]> {
      return this.http.get<ProductResponse[]>(`${this.apiUrl}/all`);
    }
    

    createProduct(product: any): Observable<any> {
      return this.http.post(this.apiUrl, product);
    }

    uploadImages(productId: number, files: File[]): Observable<any> {
      const formData = new FormData();
      for (let file of files) {
        formData.append('files', file);
      }
      return this.http.post(`${this.apiUrl}/uploads/${productId}`, formData);
    }
    
    updateProduct(id: number, productDto: any): Observable<any> {
      return this.http.put(`${this.apiUrl}/${id}`, productDto);
    }
  
    deleteProduct(id: number): Observable<any> {
      return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
    }

    uploadProductImages(productId: number, formData: FormData): Observable<any> {
      const url = `${this.apiUrl}/uploads/${productId}`;
      return this.http.post(url, formData, {responseType: 'text'}) ;
    }

    deleteProductImage(id: number): Observable<any>{
      return this.http.delete(`${this.apiUrlProductImage}/images/${id}`, { responseType: 'text' });
    }
}