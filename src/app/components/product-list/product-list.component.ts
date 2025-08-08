import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterOptions } from '../product-filter/product-filter.component';
import { ProductService } from '../../service/product.service';
import { Product } from '../../models/product';
import { BrandService } from '../../service/brand.service';
import { CategoryService } from '../../service/category.service';
import { Brand } from '../../models/Brand';
import { Category } from '../../models/category';
import { ProductListResponse } from '../../responses/product/product.list.response';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CartService } from '../../service/cartService';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="product-list">
      <div class="list-header">
        <h2>製品一覧</h2>
        <div class="results-info">
          <span>{{filteredProducts.length}}件の製品が見つかりました</span>
        </div>
      </div>

      <div class="products-grid" *ngIf="filteredProducts.length > 0">
        <div class="product-card" *ngFor="let product of products">
          <div class="product-image">
            <img [src]="product.thumbnail" [alt]="product.name">
            <div class="product-badge" *ngIf="product.badge">{{ product.badge }}</div>
            <div class="product-overlay">
              <button class="quick-view-btn" (click)="onProductClick(product.id)">詳細を見る</button>
              <button class="wishlist-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="product-info">
            <div class="product-brand">{{ getBrandName(product.brand_id) }}</div>
            <h3>{{ product.name }}</h3>
            <p class="product-description">{{ product.description }}</p>
            <div class="product-rating">
              <div class="stars">
                <span *ngFor="let star of getStars(product.rating ?? 0)" class="star">★</span>
                <span *ngFor="let star of getStars(5-(product.rating ?? 0))" class="star empty">☆</span>
              </div>
              <span class="rating-text">({{ product.reviews }}件)</span>
            </div>
            <div class="product-price">
              <span class="current-price">¥{{ product.price | number }}</span>
              <span class="old-price" *ngIf="product.oldPrice">¥{{ product.oldPrice | number }}</span>
              <span class="discount" *ngIf="product.oldPrice">
                {{ getDiscountPercentage(product.price, product.oldPrice) }}%OFF
              </span>
            </div>
            <div class="product-actions">
              <button class="add-to-cart-btn" (click)="addToCart(product)">カートに追加</button>
            </div>
          </div>
        </div>
      </div>

      <div class="no-results" *ngIf="filteredProducts.length === 0">
        <div class="no-results-icon">🔍</div>
        <h3>該当する製品が見つかりませんでした</h3>
        <p>フィルター条件を変更して再度お試しください</p>
      </div>

      
      <div class="d-flex justify-content-center">
        <nav class="d-inline-block" aria-label="Page navigation">
            <ul class="pagination">
                <li class="page-item" *ngIf="currentPage > 0">
                    <a class="page-link" (click)="onPageChange(1)">First</a>
                </li>
                <li class="page-item" *ngIf="currentPage > 0">
                    <a class="page-link" (click)="onPageChange(currentPage - 1)">Previous</a>
                </li>
                <ng-container *ngFor="let page of visiblePages">
                    <li class="page-item" [ngClass]="{'active': page === currentPage}">
                        <a class="page-link" (click)="onPageChange(page)">{{ page }}</a>
                    </li>
                </ng-container>
                <li class="page-item" *ngIf="currentPage < totalPages - 1">
                    <a class="page-link" (click)="onPageChange(currentPage + 1)">Next</a>
                </li>
                <li class="page-item" *ngIf="currentPage < totalPages - 1">
                    <a class="page-link" (click)="onPageChange(totalPages)">Last</a>
                </li>
            </ul>
        </nav>
    </div>
      
    </div>
  `,
  styleUrls: ['./product-list.component.scss']
})



export class ProductListComponent implements OnInit, OnChanges {
  @Input() filters: any = {};

  products: Product[] = [];
  filteredProducts: Product[] = [];
  brands: Brand[] = [];
  categories: Category[] = [];

  currentPage: number = 1;
  itemsPerPage: number = 15;
  totalPages: number = 0;
  visiblePages: number[] = [];

  keyword: string = '';
  selectedBrandIds: number[] = [];
  selectedCategoryIds: number[] = [];

  minPrice: number | null = 0;
  maxPrice: number | null = 500000;
  minRating: number | null = null;
  badge: string | null = null;
  sortBy: string = 'newest';
  totalItems: number = 0;
  private isInitialized: boolean = false;

  

  constructor(
    private productService: ProductService,
    private brandService: BrandService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private cartService: CartService,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // Load danh mục và brand trước
    forkJoin({
      categories: this.categoryService.getCategories(1, 100),
      brands: this.brandService.getBrands(1, 100)
    }).subscribe({
      next: ({ categories, brands }) => {
        this.categories = categories;
        this.brands = brands;
        this.isInitialized = true;
      },
      error: (err) => {
        console.error('Error loading filters:', err);
      }
    });
  
    // ĐẶT subscribe queryParams ở ngoài forkJoin → để lắng nghe mỗi lần thay đổi
    this.route.queryParams.subscribe(params => {
      this.keyword = params['keyword'] || '';
      this.initFiltersFromRoute(params);
  
      // Khi query thay đổi (kể cả ở trang /products) thì vẫn lọc lại
      this.getProducts(
        this.keyword,
        this.selectedCategoryIds,
        this.selectedBrandIds,
        this.minPrice,
        this.maxPrice,
        this.minRating,
        this.badge,
        this.sortBy,
        this.currentPage - 1,
        this.itemsPerPage
      );
    });
  }
  
  

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isInitialized && changes['filters']) {
      this.currentPage = 1;
      this.applyFilters();
    }
  }
  
  

  initFiltersFromRoute(params: any): void {
    const categoryId = Number(params['category_id']);
    const keyword = params['keyword'] ?? '';

    if (!isNaN(categoryId) && categoryId > 0) {
      this.selectedCategoryIds = [categoryId];
    }

    this.keyword = params['keyword'] || '';
    this.minPrice = 0;
    this.maxPrice = 500000;
  }

  applyFilters(): void {
   
    this.selectedCategoryIds = this.filters.categories.map((name: string) =>
      this.getCategoryIdFromName(name)
    );
    this.selectedBrandIds = this.filters.brands.map((name: string) =>
      this.getBrandIdFromName(name)
    );
    this.minPrice = this.filters.priceRange?.min || null;
    this.maxPrice = this.filters.priceRange?.max || null;
    this.minRating = this.filters.rating || null;
    this.badge = this.filters.badge || null;
    this.sortBy = this.filters.sortBy || 'newest';

    this.getProducts(
      this.keyword,
      this.selectedCategoryIds,
      this.selectedBrandIds,
      this.minPrice,
      this.maxPrice,
      this.minRating,
      this.badge,
      this.sortBy,
      0,
      this.itemsPerPage
    );
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
  ): void {
    this.productService
      .getProducts(
        keyword,
        categoryIds,
        brandIds,
        minPrice,
        maxPrice,
        minRating,
        badge,
        sortBy,
        page,
        limit
      )
      .subscribe({
        next: (response: any) => {
          response.products.forEach((product: Product) => {
            product.url = product.thumbnail;
          });

          this.products = response.products;
          this.filteredProducts = this.products;
          this.totalItems = response.totalItems;
          this.totalPages = response.totalPage;
          this.visiblePages = this.generateVisiblePageArray(
            this.currentPage,
            this.totalPages
          );
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        error: (error: any) => {
          console.error('Error fetching products:', error);
        }
      });
  }

  getCategoryIdFromName(name: string): number {
    const category = this.categories.find(c => c.name === name);
    return category ? category.id : 0;
  }

  getBrandIdFromName(name: string): number {
    const brand = this.brands.find(b => b.name === name);
    return brand ? brand.id : 0;
  }

  getBrandName(brandId: number): string {
    const brand = this.brands.find(b => b.id === brandId);
    return brand ? brand.name : '不明';
  }

  getStars(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }

  getDiscountPercentage(price: number, oldPrice: number): number {
    if (!oldPrice || oldPrice <= price) return 0;
    return Math.round(((oldPrice - price) / oldPrice) * 100);
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.getProducts(
      this.keyword,
      this.selectedCategoryIds,
      this.selectedBrandIds,
      this.minPrice,
      this.maxPrice,
      this.minRating,
      this.badge,
      this.sortBy,
      this.currentPage - 1,
      this.itemsPerPage
    );
  }

  generateVisiblePageArray(currentPage: number, totalPages: number): number[] {
    const maxVisiblePages = 5;
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(currentPage - halfVisiblePages, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    return new Array(endPage - startPage + 1)
      .fill(0)
      .map((_, index) => startPage + index);
  }

  onProductClick(productId: number): void {
    this.router.navigate(['/products', productId]);
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
  
}