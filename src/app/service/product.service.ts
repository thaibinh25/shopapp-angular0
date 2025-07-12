import { Inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { Product } from "../models/product";
import { ProductResponse } from "../responses/product/product.response";


@Injectable({
    providedIn: 'root'
})

export class ProductService {
    
    private apiUrl = `${environment.apiBaseUrl}/products`;
    private apiUrlProductImage = `${environment.apiBaseUrl}/productImages`

    constructor(private http: HttpClient) { }

    getProducts(
      keyword: string, 
      categoryId: number, 
      brandId: number, 
      minPrice: number | null, 
      maxPrice: number | null,
      page: number, limit: number): Observable<Product[]> {
        const params = new HttpParams()
            .set('keyword',keyword)
            .set('category_id',categoryId)
            .set('brand_id', brandId || 0)
            .set('minPrice', minPrice?.toString() || '')
            .set('maxPrice', maxPrice?.toString() || '')
            .set('page', page.toString())
            .set('limit', limit.toString())
        return this.http.get<Product[]>(this.apiUrl, { params });
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