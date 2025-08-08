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
import { ProductResponse } from '../../responses/product/product.response';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule,CommonModule, TranslateModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  pages: number[] = [];
  priceMin = 0;
  priceMax = 300000;
  priceGap = 100;
  
  brands: Brand[] = [];
  categories: Category[] = [];
  products: Product[] = [];
  visiblePages: number[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 15
  productsPerPage: number = 8;
  totalPages: number = 20;

  keyword: string = "";
  selectedBrandIds: number[] = [];
  selectedCategoryIds: number[] = [];

  minPrice: number | null = 0;
  maxPrice: number | null = 500000;
  minRating: number | null = null;
  badge: string | null = null;
  totalItems: number = 0;
  sortBy: string = 'newest';


  selectedMin = 0;
  selectedMax = 300000;
  rangeLeft = 0;
  rangeRight = 0;
  activeThumb: 'min' | 'max' | null = null;
  @ViewChild('slider', { static: true }) slider!: ElementRef;
  tempMin: number = this.selectedMin;
  tempMax: number = this.selectedMax;
  categoryCounts: { [key: number]: number } = {};

  timestamp= Date.now();

  slideshowImages: string[] = [
    'https://i.pcmag.com/imagery/articles/00L79RtBGxsdnfRY8KKCxwy-1..v1697409182.jpg',
    'https://cafefcdn.com/203337114487263232/2024/4/20/iphone16-17135892099401391267841-1713591543604-1713591545522445761024.jpg',
    'https://maytinhbaoloc.vn/wp-content/uploads/2023/07/Goc-setup-pc-gaming-dep-1.jpg',
    'https://cdn.tgdd.vn/News/1533341/top-dong-dong-ho-dinh-da-nam-sang-trong-noi-01-800x450-1.jpg',
    'https://images.samsung.com/jp/smartphones/galaxy-s25-ultra/images/galaxy-s25-ultra-features-kv.jpg?imbypass=true'
  ];

  categoryImages: { [key: number]: string } = {
    1: 'https://ttb-shop-product-images.s3.ap-southeast-2.amazonaws.com/categories/lapptop.jpg', // Máy tính & Laptop
    2: 'https://ttb-shop-product-images.s3.ap-southeast-2.amazonaws.com/categories/dongho.webp', // Đồng hồ
    3: 'https://ttb-shop-product-images.s3.ap-southeast-2.amazonaws.com/categories/dienthoaivsipad.jpg', // Điện thoại & Tablet
    4: 'https://ttb-shop-product-images.s3.ap-southeast-2.amazonaws.com/categories/thietbijthongminh.jpg', // Thiết bị gia dụng
    5: 'https://ttb-shop-product-images.s3.ap-southeast-2.amazonaws.com/categories/thietbivanphong.png', // Văn phòng
    6: 'https://ttb-shop-product-images.s3.ap-southeast-2.amazonaws.com/categories/phukien.jpg', // Phụ kiện công nghệ
    7: 'https://ttb-shop-product-images.s3.ap-southeast-2.amazonaws.com/categories/amthanhvsloa.jpg', // Âm thanh
    8: 'https://ttb-shop-product-images.s3.ap-southeast-2.amazonaws.com/categories/phammembanquyen.jpg'  // Mạng & Lưu trữ
  };

  currentSlide: number = 0;
  featuredProducts: Product[] = [];
  currentFilters: any = {}; 


  countdown?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };

  private targetDate = new Date();
  private intervalId: any;

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
    this.getCategories(1, 100);
    this.getBrands(1,100);
    
    this.updateSliderRange();
    this.fetchCounts();
    setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.slideshowImages.length;
    }, 6000);

   
    this.getProducts(
      this.keyword,
      this.selectedCategoryIds,
      this.selectedBrandIds,
      this.minPrice,
      this.maxPrice,
      this.minRating,
      'おすすめ',
      this.sortBy,
      this.currentPage - 1,
      this.itemsPerPage
    );
    
     // Ví dụ: khuyến mãi kết thúc sau 2 ngày
     this.targetDate.setDate(this.targetDate.getDate() + 2);
     this.startCountdown();
  }

  fetchCounts() {
      this.productService.getAllProductsWithoutPagination().subscribe({
        next: (products: ProductResponse[]) => {
          this.categoryCounts = {};
          
  
          for (const product of products) {
            const catId = product.category_id;
            const brandId = product.brand_id;
  
            this.categoryCounts[catId] = (this.categoryCounts[catId] || 0) + 1;
            
          }
        },
        error: (err) => {
          console.error('Failed to fetch product counts:', err);
        }
      });
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
  ) {
    this.productService.getProducts(
      keyword, categoryIds, brandIds, minPrice, maxPrice, minRating, badge,sortBy, page, limit
    ).subscribe({
      next: (response: any) => {
        response.products.forEach((product: Product) => {
          product.url = product.thumbnail;
        });
      
        this.products = response.products;
        this.totalPages = response.totalPage;
    
        this.visiblePages = this.generateVisiblePageArray(this.currentPage, this.totalPages);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (error: any) => {
        console.error('Error fetching products:', error);
      }
    });
  }

 
  goToCategory(category: Category) {
    this.router.navigate(['/products'], {
      queryParams: {
        category_id: category.id,
        category_name: category.name
      }
    });
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

  onProductClick(productId: number) {
    this.router.navigate(['/products', productId]);
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

  

  updateSliderRange(min = this.selectedMin, max = this.selectedMax) {
    const total = this.priceMax - this.priceMin;
    this.rangeLeft = ((min - this.priceMin) / total) * 100;
    this.rangeRight = ((this.priceMax - max) / total) * 100;
  }

  addToCart(product: Product): void {
      if (product) {
        this.cartService.addToCart(product.id, 1);
    
        Swal.fire({
          title: 'Đã thêm vào giỏ hàng!',
          html: `
            <div class="custom-toast">
              <img src="${product.thumbnail}" alt="${product.name}" class="toast-img" />
              <div class="toast-content">
                <strong>${product.name}</strong>
                <span class="toast-subtext">đã được thêm vào giỏ hàng.</span>
              </div>
            </div>
          `,
          icon: 'success',
          timer: 4500,
          showConfirmButton: false,
          position: 'bottom-end',
          toast: true,
          customClass: {
            popup: 'custom-swal-popup'
          }
        });
      }
    }
  
  goToProducts(): void {
    this.router.navigate(['/products']);
  }

  getCategoryCount(categoryId: number): number {
    return this.categoryCounts[categoryId] || 0;
  }

  private startCountdown(): void {
    this.intervalId = setInterval(() => {
      const now = new Date().getTime();
      const distance = this.targetDate.getTime() - now;

      if (distance < 0) {
        clearInterval(this.intervalId);
        this.countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        return;
      }

      this.countdown = {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((distance / (1000 * 60)) % 60),
        seconds: Math.floor((distance / 1000) % 60),
      };
    }, 1000);
  }

  getBrandName(brandId: number): string {
    const brand = this.brands.find(b => b.id === brandId);
    return brand ? brand.name : '不明'; // '不明' nghĩa là "không rõ"
  }

  getStars(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }
  getDiscountPercentage(price: number, oldPrice: number): number {
    if (!oldPrice || oldPrice <= price) return 0;
    return Math.round(((oldPrice - price) / oldPrice) * 100);
  }
}













/*import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  minRating: number | null = null;
  badge: string | null = null;
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
  featuredProducts: Product[] = []; // Dùng cho section "おすすめ製品"
  currentFilters: any = {}; // Dùng cho app-product-filter
 

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
  

  
}*/



