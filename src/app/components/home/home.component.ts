import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { Product } from '../../models/product';
import { ProductService } from '../../service/product.service';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category } from '../../models/category';
import { CategoryService } from '../../service/category.service';
import { Router } from '@angular/router';
import { Brand } from '../../models/Brand';
import { BrandService } from '../../service/brand.service';
import { UserService } from '../../service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { CartService } from '../../service/cartService';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule,CommonModule, TranslateModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = []; // Dữ liệu động từ categoryService
  brands: Brand[] = [];
  selectedCategoryId: number  = 0; // Giá trị category được chọn
  currentPage: number = 1;
  itemsPerPage: number = 16;
  pages: number[] = [];
  totalPages: number = 0;
  visiblePages: number[] = [];
  keyword:string = "";
  selectedBrandId: number = 0;
  minPrice: number | null = null;
  maxPrice: number | null = null;
  priceMin = 0;
  priceMax = 300000;
  priceGap = 100;

  selectedMin = 0;
  selectedMax = 300000;
  rangeLeft = 0;
  rangeRight = 0;
  activeThumb: 'min' | 'max' | null = null;
  @ViewChild('slider', { static: true }) slider!: ElementRef;
  tempMin: number = this.selectedMin;
  tempMax: number = this.selectedMax;

  timestamp= Date.now();

  slideshowImages: string[] = [
    'https://i.pcmag.com/imagery/articles/00L79RtBGxsdnfRY8KKCxwy-1..v1697409182.jpg',
    'https://bqn.1cdn.vn/thumbs/1200x630/2024/10/03/441-202410031416061.jpg',
    'https://rog.asus.com/media/1704735036668.jpg',
    'https://bossluxurywatch.vn/uploads/tao/0-0000/screenshot-15.jpg',
    'https://i.ytimg.com/vi/kposuE1SeEI/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAPUXvA4VAnKybp9ixQE1Q43dCQEA'
  ];
  
  currentSlide: number = 0;
 

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private brandService: BrandService,    
    private router: Router,
    private translate: TranslateService,
    private cartService: CartService,
    private toastr: ToastrService
    ) {}

  ngOnInit() {
    console.log(`${environment.apiBaseUrl}/categories?page=1&limit=10`);

    this.getCategories(1, 100);
    this.getBrands(1,100);
    this.getProducts(this.keyword, this.selectedCategoryId, this.selectedBrandId,this.minPrice, this.maxPrice, this.currentPage -1, this.itemsPerPage);
    this.updateSliderRange();
    setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.slideshowImages.length;
    }, 6000); // chuyển ảnh sau mỗi 6 giây
    
  }
  getCategories(page: number, limit: number) {
    this.categoryService.getCategories(page, limit).subscribe({
      next: (categories: Category[]) => {
        
        this.categories = categories;
      },
      complete: () => {

      },
      error: (error: any) => {
        console.error('Error fetching categories:', error);
      }
    });
  }

  getBrands(page: number, limit: number) {
    this.brandService.getBrands(page, limit).subscribe({
      next: (brands: Brand[]) => {
        
        this.brands = brands;
      },
      complete: () => {
        
      },
      error: (error: any) => {
        console.error('Error fetching categories:', error);
      }
    });
  }
  searchProducts() {
    this.currentPage = 1;
    this.itemsPerPage = 12;
    
    this.getProducts(this.keyword, this.selectedCategoryId, this.selectedBrandId,this.minPrice, this.maxPrice, this.currentPage -1, this.itemsPerPage);
  }
  getProducts(keyword: string, selectedCategoryId: number,selectedBrandId: number, minPrice: number | null, maxPrice: number | null, page: number, limit: number) {
    
    this.productService.getProducts(keyword, selectedCategoryId, selectedBrandId, minPrice , maxPrice, page , limit).subscribe({
      next: (response: any) => {
        

        response.products.forEach((product: Product) => {          
          //product.url = `${environment.apiBaseUrl}/products/images/${encodeURIComponent(product.thumbnail)}`;
          product.url = product.thumbnail;// dùng s3 lưuu link trực tiếp rồi 
          console.log('📷 url:', product.url);
        });
        this.products = response.products;
        this.totalPages = response.totalPage;
        
        this.visiblePages = this.generateVisiblePageArray(this.currentPage, this.totalPages);
        window.scrollTo({ top: 0, behavior: 'smooth' });

      },
      complete: () => {
       
      },
      error: (error: any) => {
        
        console.error('Error fetching products:', error);
      }
    });    
  }

  onCategoryChange(event: Event) {
  const selectElement = event.target as HTMLSelectElement;
  const value = selectElement.value;  // Đây là string
  // nếu muốn number:
  const categoryId = Number(value);
  this.selectedCategoryId = categoryId;
  if (categoryId === 0) {
    
    // Nếu chọn "Tất cả" danh mục → lấy tất cả brands
    this.brandService.getBrands(1,100).subscribe(brands => {
      this.brands = brands;
    });
  } else {
    // Nếu có danh mục → chỉ lấy brands theo category
    this.brandService.getBrandsByCategory(this.selectedCategoryId).subscribe(brands => {
      this.brands = brands;
    });
  }
    // Reset trang
    this.currentPage = 1;
  
    this.getProducts(this.keyword, this.selectedCategoryId, this.selectedBrandId,this.minPrice, this.maxPrice, this.currentPage -1, this.itemsPerPage);
  }


  onBrandChange(event: Event){
    const selectElement = event.target as HTMLSelectElement;
  const value = selectElement.value;  // Đây là string
  // nếu muốn number:
  const brandId = Number(value);
  this.selectedBrandId = brandId;
  // Reset trang
  this.currentPage = 1;

  this.getProducts(this.keyword, this.selectedCategoryId, this.selectedBrandId,this.minPrice, this.maxPrice, this.currentPage -1, this.itemsPerPage);
  }

  onPageChange(page: number ) {
    
    this.currentPage = page;
    this.getProducts(this.keyword, this.selectedCategoryId, this.selectedBrandId,this.minPrice, this.maxPrice, this.currentPage -1, this.itemsPerPage);
  }

  
  

  generateVisiblePageArray(currentPage: number, totalPages: number): number[] {
    
    const maxVisiblePages = 5;
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(currentPage - halfVisiblePages, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    return new Array(endPage - startPage + 1).fill(0).map((_, index) => startPage + index);
  }
    
  // Hàm xử lý sự kiện khi sản phẩm được bấm vào
  onProductClick(productId: number) {
   
    // Điều hướng đến trang detail-product với productId là tham số
    this.router.navigate(['/products', productId]);
  }  
  
  startDrag(type: 'min' | 'max', event: MouseEvent | TouchEvent) {
    this.activeThumb = type;
    event.preventDefault();
    window.addEventListener('mousemove', this.onDrag);
    window.addEventListener('touchmove', this.onDrag);
    window.addEventListener('mouseup', this.endDrag);
    window.addEventListener('touchend', this.endDrag);
  }
  
  onDrag = (event: MouseEvent | TouchEvent) => {
    if (!this.activeThumb || !this.slider) return;
  
    const rect = this.slider.nativeElement.getBoundingClientRect();
    const clientX =
      event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
  
    const percent = ((clientX - rect.left) / rect.width) * 100;
    const value =
      this.priceMin +
      ((this.priceMax - this.priceMin) * percent) / 100;
  
    if (this.activeThumb === 'min') {
      const clamped = Math.min(
        Math.max(this.priceMin, value),
        this.tempMax - this.priceGap
      );
      this.tempMin = Math.round(clamped);
    } else if (this.activeThumb === 'max') {
      const clamped = Math.max(
        Math.min(this.priceMax, value),
        this.tempMin + this.priceGap
      );
      this.tempMax = Math.round(clamped);
    }
  
    this.updateSliderRange(this.tempMin, this.tempMax);
  };
  
  
  endDrag = () => {
    this.activeThumb = null;
    this.selectedMin = this.tempMin;
    this.selectedMax = this.tempMax;
  
    this.updateSliderRange(this.selectedMin, this.selectedMax);
     // Reset trang
     this.currentPage = 1;
    //load lại products
    this.getProducts(this.keyword, this.selectedCategoryId, this.selectedBrandId,this.selectedMin, this.selectedMax, this.currentPage -1, this.itemsPerPage);
  
     
    window.removeEventListener('mousemove', this.onDrag);
    window.removeEventListener('touchmove', this.onDrag);
    window.removeEventListener('mouseup', this.endDrag);
    window.removeEventListener('touchend', this.endDrag);
  };
  
  
  updateSliderRange(min = this.selectedMin, max = this.selectedMax) {
    const total = this.priceMax - this.priceMin;
    this.rangeLeft = ((min - this.priceMin) / total) * 100;
    this.rangeRight = ((this.priceMax - max) / total) * 100;
  }
  
  resetFilters() {
    // Reset các bộ lọc
    this.selectedCategoryId = 0;
    this.selectedBrandId = 0;
  
    // Reset giá về mặc định
    this.tempMin = this.priceMin;
    this.tempMax = this.priceMax;
    this.selectedMin = this.priceMin;
    this.selectedMax = this.priceMax;
  
    this.updateSliderRange();
  
    // Reset trang
    this.currentPage = 1;
  
    // Gọi lại brands tất cả (vì có thể category trước đó đã lọc lại brands)
    this.getBrands(1, 100);
  
    // Gọi lại danh sách sản phẩm không lọc
    this.getProducts(
      this.keyword,
      this.selectedCategoryId,
      this.selectedBrandId,
      null, // minPrice
      null, // maxPrice
      this.currentPage - 1,
      this.itemsPerPage
    );
  }
  
  addToCart(product: Product): void {
    
    if (product) {
      this.cartService.addToCart(product.id, 1);
      this.toastr.success('Đã thêm sản phẩm vào giỏ hàng!', 'Thành công!');
      //alert('Sản phẩm đã được thêm vào giỏ hàng!');
    } else {
      // Xử lý khi product là null
      console.error('Không thể thêm sản phẩm vào giỏ hàng vì product là null.');
    }
  }    
  
}



