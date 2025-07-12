import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category } from '../../../models/category';
import { CategoryService } from '../../../service/category.service';


@Component({
  selector: 'app-category-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category.admin.component.html',
  styleUrl: './category.admin.component.scss'
})
export class CategoryAdminComponent implements OnInit {
  categories: Category[] = [];
  selectedCategory: Category = { id: 0, name: ''};
  currentPage: number = 1;
  itemsPerPage: number = 12;
  visiblePages: number[] = [];
  totalPages: number = 0;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories(this.currentPage,this.itemsPerPage);
  }

  loadCategories(page: number, limit: number) {
    debugger
    this.categoryService.getCategories(page -1, limit).subscribe({
      
      next: (data: any) => {
        debugger
        this.categories = data;
      },
      error: (err) => {
        console.error('Lỗi khi lấy danh sách category:', err);
      }
    });
  }

  editCategory(category: Category) {
    this.selectedCategory = { ...category };
  }

  saveCategory() {
    if (!this.selectedCategory.name) {
      alert("Tên danh mục không được để trống");
    return;
  }

    if (this.selectedCategory.id === 0) {
      this.categoryService.create(this.selectedCategory).subscribe(() => {
        this.loadCategories(this.currentPage,this.itemsPerPage);
        this.resetForm();
      });
    } else {
      this.categoryService.update(this.selectedCategory).subscribe(() => {
        this.loadCategories(this.currentPage,this.itemsPerPage);
        this.resetForm();
      });
    }
  }

  deleteCategory(id: number) {
    if (confirm('Bạn có chắc muốn xóa không?')) {
      this.categoryService.delete(id).subscribe(() => {
        this.loadCategories(this.currentPage,this.itemsPerPage);
      });
    }
  }

  resetForm() {
    this.selectedCategory = { id: 0, name: ''};
  }


  onPageChange(page: number ) {
    
    this.currentPage = page;
    this.loadCategories(this.currentPage,this.itemsPerPage);
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
}
