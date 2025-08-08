import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterOptions, ProductFilterComponent } from '../product-filter/product-filter.component';
import { ProductListComponent } from '../product-list/product-list.component';
@Component({
  selector: 'app-product',
  imports: [CommonModule, ProductFilterComponent, ProductListComponent],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent {
  currentFilters: FilterOptions = {
    categories: [],
    brands: [],
    priceRange: { min: 0, max: 500000 },
    rating: 0,
    badge: '',
    sortBy: 'newest'
  };

 

  onFilterChange(newFilters: FilterOptions) {
    this.currentFilters = { ...newFilters }; 
  }
}
