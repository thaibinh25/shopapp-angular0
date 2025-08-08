import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../service/category.service';
import { BrandService } from '../../service/brand.service';
import { ProductService } from '../../service/product.service';
import { Category } from '../../models/category';
import { Brand } from '../../models/Brand';
import { ProductResponse } from '../../responses/product/product.response';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';

export interface FilterOptions {
  categories: string[];
  brands: string[];
  priceRange: { min: number; max: number };
  rating: number;
  badge: string;
  sortBy: string;
}

@Component({
  selector: 'app-product-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filter-container">
      <div class="filter-header">
        <h3>製品フィルター</h3>
        <button class="clear-filters" (click)="clearAllFilters()">
          すべてクリア
        </button>
      </div>

      <!-- Sort Options -->
      <div class="filter-section">
        <h4>並び替え</h4>
        <select [(ngModel)]="filters.sortBy" (ngModelChange)="onFilterChange()" class="sort-select">
          <option value="newest">新着順</option>
          <option value="price-low">価格: 安い順</option>
          <option value="price-high">価格: 高い順</option>
          <option value="rating">評価順</option>
          <option value="popular">人気順</option>
        </select>
      </div>

      <!-- Category Filter -->
<div class="filter-section" *ngIf="availableCategories.length">
  <h4>カテゴリー</h4>
  <div class="filter-options">
    <label class="filter-option" *ngFor="let category of availableCategories">
      <input 
        type="checkbox" 
        [value]="category.name"
        [checked]="filters.categories.includes(category.name)"
        (change)="onCategoryChange(category.name, $event)"
      >
      <span class="checkmark"></span>
      <span class="option-text">{{ category.name }}</span>
      <span class="option-count">({{ getCategoryCount(category.id) }})</span>
    </label>
  </div>
</div>


     <!-- Brand Filter -->
<div class="filter-section" *ngIf="availableBrands.length">
  <h4>ブランド</h4>
  <div class="filter-options">
    <label class="filter-option" *ngFor="let brand of availableBrands">
      <input 
        type="checkbox" 
        [value]="brand.name"
        [checked]="filters.brands.includes(brand.name)"
        (change)="onBrandChange(brand.name, $event)"
      >
      <span class="checkmark"></span>
      <span class="option-text">{{ brand.name }}</span>
      <span class="option-count">({{ getBrandCount(brand.id) }})</span>
    </label>
  </div>
</div>


 <!-- Price Range Filter -->
<div class="filter-section">
  <h4>価格帯</h4>
  <div class="price-range">
    
    <!-- Giới hạn khung nhập giá -->
    <div class="price-inputs-wrapper">
      <div class="price-inputs">
        <input 
          type="number" 
          [(ngModel)]="filters.priceRange.min"
          (ngModelChange)="onFilterChange()"
          placeholder="最低価格"
          class="price-input"
        >
        <span class="price-separator">〜</span>
        <input 
          type="number" 
          [(ngModel)]="filters.priceRange.max"
          (ngModelChange)="onFilterChange()"
          placeholder="最高価格"
          class="price-input"
        >
      </div>
    </div>

    <div class="price-range-slider">
      <input 
        type="range" 
        min="0" 
        max="500000" 
        step="1000"
        [(ngModel)]="filters.priceRange.min"
        (ngModelChange)="onFilterChange()"
        class="range-slider min-slider"
      >
      <input 
        type="range" 
        min="0" 
        max="500000" 
        step="1000"
        [(ngModel)]="filters.priceRange.max"
        (ngModelChange)="onFilterChange()"
        class="range-slider max-slider"
      >
    </div>

    <div class="price-labels">
      <span>¥{{ filters.priceRange.min | number }}</span>
      <span>¥{{ filters.priceRange.max | number }}</span>
    </div>
  </div>
</div>


      <!-- Rating Filter -->
      <div class="filter-section">
        <h4>評価</h4>
        <div class="rating-options">
          <label class="rating-option" *ngFor="let rating of [5,4,3,2,1]">
            <input 
              type="radio" 
              name="rating"
              [value]="rating"
              [checked]="filters.rating === rating"
              (change)="onRatingChange(rating)"
            >
            <span class="rating-stars">
              <span *ngFor="let star of getStars(rating)" class="star filled">★</span>
              <span *ngFor="let star of getStars(5-rating)" class="star">☆</span>
            </span>
            <span class="rating-text">{{ rating }}つ星以上</span>
          </label>
          <label class="rating-option">
            <input 
              type="radio" 
              name="rating"
              value="0"
              [checked]="filters.rating === 0"
              (change)="onRatingChange(0)"
            >
            <span class="rating-text">すべて</span>
          </label>
        </div>
      </div>

      <!-- Badge Filter -->
<div class="filter-section" *ngIf="availableBadges.length">
  <h4>バッジ</h4>
  <div class="filter-options">
    <label class="filter-option" *ngFor="let b of availableBadges">
      <input 
        type="radio"
        name="badge"
        [value]="b"
        [checked]="filters.badge === b"
        (change)="onBadgeChange(b)"
      >
      <span class="option-text">{{ b }}</span>
    </label>
    <label class="filter-option">
      <input 
        type="radio"
        name="badge"
        value=""
        [checked]="!filters.badge"
        (change)="onBadgeChange('')"
      >
      <span class="option-text">すべて</span>
    </label>
  </div>
</div>


      <!-- Active Filters -->
      <div class="active-filters" *ngIf="hasActiveFilters()">
        <h4>適用中のフィルター</h4>
        <div class="filter-tags">
          <span class="filter-tag" *ngFor="let category of filters.categories">
            {{ category }}
            <button (click)="removeCategory(category)">×</button>
          </span>
          <span class="filter-tag" *ngFor="let brand of filters.brands">
            {{ brand }}
            <button (click)="removeBrand(brand)">×</button>
          </span>
          <span class="filter-tag" *ngIf="filters.rating > 0">
            {{ filters.rating }}つ星以上
            <button (click)="removeRating()">×</button>
          </span>
          <span class="filter-tag" *ngIf="filters.badge">
            {{ filters.badge }}
            <button (click)="removeBadge()">×</button>
          </span>
          <span class="filter-tag" *ngIf="filters.priceRange.min > 0 || filters.priceRange.max < 500000">
            ¥{{ filters.priceRange.min | number }} - ¥{{ filters.priceRange.max | number }}
            <button (click)="removePriceRange()">×</button>
          </span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./product-filter.component.scss']
})


export class ProductFilterComponent implements OnInit {
  @Output() filterChange = new EventEmitter<FilterOptions>();

  filters: FilterOptions = {
    categories: [],
    brands: [],
    priceRange: { min: 0, max: 500000 },
    rating: 0,
    badge: '',
    sortBy: 'newest'
  };

  availableCategories: Category[] = [];

  availableBrands: Brand[] = [];

  availableBadges: string[] = [];

  categoryCounts: { [key: number]: number } = {};
  brandCounts: { [key: number]: number } = {};

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private brandService: BrandService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    // Gọi song song các API
  forkJoin({
    categories: this.categoryService.getCategories(1, 100),
    brands: this.brandService.getBrands(1, 100),
    badges: this.productService.getAvailableBadges(),
    products: this.productService.getAllProductsWithoutPagination()
  }).subscribe({
    next: ({ categories, brands, badges, products }) => {
      this.availableCategories = categories;
      this.availableBrands = brands;
      this.availableBadges = badges;

      // Đếm số lượng theo category và brand
      this.categoryCounts = {};
      this.brandCounts = {};
      for (const product of products) {
        this.categoryCounts[product.category_id] = (this.categoryCounts[product.category_id] || 0) + 1;
        this.brandCounts[product.brand_id] = (this.brandCounts[product.brand_id] || 0) + 1;
      }

      // Đọc query param sau khi có availableCategories
      const categoryId = +this.route.snapshot.queryParamMap.get('category_id')!;
      if (categoryId) {
        const matchedCategory = this.availableCategories.find(c => c.id === categoryId);
        if (matchedCategory) {
          this.filters.categories = [matchedCategory.name];
        }
      }

      // Gửi filter sau cùng
      this.filterChange.emit({ ...this.filters });
    },
    error: (err) => console.error('Error loading filter data:', err)
  });

    
  }

  getCategories(page: number, limit: number) {
    return this.categoryService.getCategories(page, limit).subscribe({
      next: (categories: Category[]) => {
        this.availableCategories = categories;
      },
      error: (error: any) => {
        console.error('Error fetching categories:', error);
      }
    });
  }
  

  getBrands(page: number, limit: number) {
    this.brandService.getBrands(page, limit).subscribe({
      next: (brands: Brand[]) => {

        this.availableBrands = brands;
      },
      complete: () => {

      },
      error: (error: any) => {
        console.error('Error fetching categories:', error);
      }
    });
  }
  loadAvailableBadges() {
    this.productService.getAvailableBadges().subscribe({
      next: (badges) => this.availableBadges = badges,
      error: (err) => console.error('Failed to load badges:', err)
    });
  }


  onCategoryChange(category: string, event: any) {
    if (event.target.checked) {
      this.filters.categories.push(category);
    } else {
      this.filters.categories = this.filters.categories.filter(c => c !== category);
    }
    this.onFilterChange();
  }



  onBrandChange(brand: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      this.filters.brands.push(brand);
    } else {
      this.filters.brands = this.filters.brands.filter(b => b !== brand);
    }
    this.onFilterChange();
  }

  fetchCounts() {
    this.productService.getAllProductsWithoutPagination().subscribe({
      next: (products: ProductResponse[]) => {
        this.categoryCounts = {};
        this.brandCounts = {};

        for (const product of products) {
          const catId = product.category_id;
          const brandId = product.brand_id;

          this.categoryCounts[catId] = (this.categoryCounts[catId] || 0) + 1;
          this.brandCounts[brandId] = (this.brandCounts[brandId] || 0) + 1;
        }
      },
      error: (err) => {
        console.error('Failed to fetch product counts:', err);
      }
    });
  }



  onRatingChange(rating: number) {
    this.filters.rating = rating;
    this.onFilterChange();
  }

  onBadgeChange(badge: string) {
    this.filters.badge = badge;
    this.onFilterChange();
  }

  onFilterChange() {
    this.filterChange.emit(this.filters);
  }

  clearAllFilters() {
    this.filters = {
      categories: [],
      brands: [],
      priceRange: { min: 0, max: 500000 },
      rating: 0,
      badge: '',
      sortBy: 'newest'
    };
    this.onFilterChange();
  }

  hasActiveFilters(): boolean {
    return this.filters.categories.length > 0 ||
      this.filters.brands.length > 0 ||
      this.filters.rating > 0 ||
      !!this.filters.badge ||
      this.filters.priceRange.min > 0 ||
      this.filters.priceRange.max < 500000;
  }

  removeCategory(category: string) {
    this.filters.categories = this.filters.categories.filter(c => c !== category);
    this.onFilterChange();
  }

  removeBrand(brand: string) {
    this.filters.brands = this.filters.brands.filter(b => b !== brand);
    this.onFilterChange();
  }

  removeRating() {
    this.filters.rating = 0;
    this.onFilterChange();
  }

  removeBadge() {
    this.filters.badge = '';
    this.onFilterChange();
  }

  removePriceRange() {
    this.filters.priceRange = { min: 0, max: 500000 };
    this.onFilterChange();
  }

  getCategoryCount(categoryId: number): number {
    return this.categoryCounts[categoryId] || 0;
  }
  
  getBrandCount(brandId: number): number {
    return this.brandCounts[brandId] || 0;
  }

  getStars(count: number): number[] {
    return Array(count).fill(0);
  }
}
