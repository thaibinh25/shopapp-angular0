import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Brand } from '../../../models/Brand';
import { BrandService } from '../../../service/brand.service';
import { ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-brand.admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './brand.admin.component.html',
  styleUrl: './brand.admin.component.scss'
})
export class BrandAdminComponent implements OnInit {

  brands: Brand[] = [];
  selectedBrand: Brand = { id: 0, name: '' };
  currentPage: number = 1;
  itemsPerPage: number = 12;
  visiblePages: number[] = [];
  totalPages: number = 0;
  @ViewChild('formSection') formSection!: ElementRef;

  constructor(private brandService: BrandService) {

  }
  ngOnInit(): void {
    this.loadCategories(this.currentPage, this.itemsPerPage);
  }

  loadCategories(page: number, limit: number) {
    debugger
    this.brandService.getBrands(page - 1, limit).subscribe({

      next: (data: any) => {
        debugger
        this.brands = data;
      },
      error: (err) => {
        console.error('Lỗi khi lấy danh sách category:', err);
      }
    });
  }

  editBrand(brand: Brand) {
    this.selectedBrand = { ...brand };

    // Cuộn tới form
  setTimeout(() => {
    this.formSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 0);
  }

  saveBrand() {
    debugger
    if (!this.selectedBrand.name) {
      alert("Tên danh mục không được để trống");
      return;
    }

    if (this.selectedBrand.id === 0) {
      this.brandService.create(this.selectedBrand).subscribe(() => {
        this.loadCategories(this.currentPage, this.itemsPerPage);
        this.resetForm();
      });
    } else {
      this.brandService.update(this.selectedBrand).subscribe(() => {
        this.loadCategories(this.currentPage, this.itemsPerPage);
        this.resetForm();
      });
    }
  }

  deleteBrand(id: number) {
    if (confirm('Bạn có chắc muốn xóa không?')) {
      this.brandService.delete(id).subscribe(() => {
        this.loadCategories(this.currentPage, this.itemsPerPage);
      });
    }
  }

  resetForm() {
    this.selectedBrand = { id: 0, name: '' };
  }


  onPageChange(page: number) {

    this.currentPage = page;
    this.loadCategories(this.currentPage, this.itemsPerPage);
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
