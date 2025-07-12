import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { Product } from '../../models/product';
import { ProductService } from '../../service/product.service';
import { ProductImage } from '../../models/product_image';
import { environment } from '../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../service/cartService';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-detail-product',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './detail-product.component.html',
  styleUrl: './detail-product.component.scss'
})
export class DetailProductComponent implements OnInit {
  product?: Product;
  productId: number = 0;
  currentImageIndex: number = 0;
  quantity: number = 1;
  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ){}

  ngOnInit() {
    setInterval(() => {
      if (this.product?.product_images && this.product.product_images.length > 0) {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.product.product_images.length;
      }
    }, 4000);
    // Lấy productId từ URL      
    const idParam = this.activatedRoute.snapshot.paramMap.get('id');
    //const idParam = 18;
    //this.cartService.clearCart();
    //const idParam = 9 //fake tạm 1 giá trị
    if (idParam !== null) {
      this.productId = +idParam;
    }
    if (!isNaN(this.productId)) {
      this.productService.getDetailProduct(this.productId).subscribe({
        next: (response: any) => {            
          // Lấy danh sách ảnh sản phẩm và thay đổi URL
          
          if (response.product_images && response.product_images.length > 0) {
            response.product_images.forEach((product_image:ProductImage) => {
              //product_image.image_url = `${environment.apiBaseUrl}/products/images/${product_image.image_url}`;
              product_image.image_url = product_image.image_url;
            });
          }            
          
          this.product = response 
          // Bắt đầu với ảnh đầu tiên
          this.showImage(0);
        },
        complete: () => {
          
        },
        error: (error: any) => {
          
          console.error('Error fetching detail:', error);
        }
      });    
    } else {
      console.error('Invalid productId:', idParam);
    }      
  }

  showImage(index: number): void {
    
    if (this.product && this.product.product_images && 
        this.product.product_images.length > 0) {
      // Đảm bảo index nằm trong khoảng hợp lệ        
      if (index < 0) {
        index = 0;
      } else if (index >= this.product.product_images.length) {
        index = this.product.product_images.length - 1;
      }        
      // Gán index hiện tại và cập nhật ảnh hiển thị
      this.currentImageIndex = index;
    }
  }
  thumbnailClick(index: number) {
    
    // Gọi khi một thumbnail được bấm
    this.currentImageIndex = index; // Cập nhật currentImageIndex
  }  
  nextImage(): void {
    if (this.product?.product_images?.length) {
      if (this.currentImageIndex === this.product.product_images.length - 1) {
        this.currentImageIndex = 0;
      } else {
        this.currentImageIndex++;
      }
    }
    
  }

  previousImage(): void {
    if (this.product?.product_images?.length){
    if (this.currentImageIndex === 0) {
      this.currentImageIndex = this.product.product_images.length - 1;
    } else {
      this.currentImageIndex--;
    }}
  }      
  addToCart(): void {
    
    if (this.product) {
      this.cartService.addToCart(this.product.id, this.quantity);
      this.toastr.success('Đã thêm sản phẩm vào giỏ hàng!', 'Thành công!');
      //alert('Sản phẩm đã được thêm vào giỏ hàng!');
    } else {
      // Xử lý khi product là null
      console.error('Không thể thêm sản phẩm vào giỏ hàng vì product là null.');
    }
  }    
      
  increaseQuantity(): void {
    this.quantity++;
  }
  
  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  
  
  
  buyNow(): void {      
    if (this.product) {
      this.cartService.addToCart(this.product.id, this.quantity);
      this.router.navigate(['/orders']);
    } else {
      console.error('Không thể mua ngay vì sản phẩm không tồn tại.');
    }
  }    


  
}

