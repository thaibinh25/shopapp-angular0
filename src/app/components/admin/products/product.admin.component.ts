import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductResponse } from '../../../responses/product/product.response';
import { ProductService } from '../../../service/product.service';
import { CategoryService } from '../../../service/category.service';
import { Category } from '../../../models/category';
import { Brand } from '../../../models/Brand';
import { BrandService } from '../../../service/brand.service';


@Component({
  selector: 'app-product-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product.admin.component.html',
  styleUrl: './product.admin.component.scss'
})
export class ProductAdminComponent implements OnInit {
  products: ProductResponse[] = [];
  categories: Category[] = [];
  brands: Brand[] = [];
  selectedProduct: ProductResponse = this.resetProduct();
  keyword = '';
  selectedCategoryId = 0;
  selectedCategoryIds: number[] =[];
  currentPage = 1;
  itemsPerPage = 12;
  visiblePages: number[] = [];
  totalPages: number = 0;
  imagePreview: string | ArrayBuffer | null = null;  // Biến chứa ảnh preview
  selectedImages: FileList | null = null;
  selectedBrandId: number = 0;
  selectedBrandIds: number[] = [];
  minPrice: number | null = null;
  maxPrice: number | null = null;
  isSubmitting = false;
  minRating: number | null = null;
  badge: string | null = null;
  sortBy: string = 'newest';


  currentImages: { id: number, url: string }[] = [];  // ảnh đang có (có id từ DB)
  newImages: File[] = [];                              // ảnh mới được chọn
  newImagePreview: string[] = [];                         // base64 preview ảnh mới
  @ViewChild('imageInput') imageInput!: ElementRef;
  @ViewChild('formSection') formSection!: ElementRef;
  @ViewChild('descriptionTextarea') descriptionTextarea!: ElementRef<HTMLTextAreaElement>;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private brandService: BrandService,
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadBrands();
    //this.loadProducts();
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

  loadCategories() {
    this.categoryService.getCategories(this.currentPage, this.itemsPerPage).subscribe({
      next: (categories: Category[]) => {
        debugger
        this.categories = categories;

      },
      complete: () => {

      },
      error: (error: any) => {
        console.error('Error fetching categories:', error);
      }
    });
  }
  loadBrands() {
    this.brandService.getBrands(this.currentPage, this.itemsPerPage).subscribe({
      next: (brands: Brand[]) => {
        this.brands = brands;
      },
      complete: () => {

      },
      error: (error: any) => {
        console.error('Error fetching brands:', error);
      }
    })
  }

  loadProducts(): void {
    this.productService.getProducts(this.keyword, this.selectedCategoryIds, this.selectedBrandIds, this.minPrice, this.maxPrice, this.minRating, this.badge,this.sortBy, this.currentPage -1, this.itemsPerPage)
      .subscribe({
        next: (response: any) => {
          debugger
          this.products = response.products;
          this.totalPages = response.totalPage;
          this.visiblePages = this.generateVisiblePageArray(this.currentPage, this.totalPages);
        },
        error: (err) => {
          console.error('Lỗi khi load sản phẩm:', err);
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
          debugger
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

  saveProduct(): void {
    const productDto = {
      name: this.selectedProduct.name,
      price: this.selectedProduct.price,
      thumbnail: this.selectedProduct.thumbnail,
      description: this.selectedProduct.description,
      category_id: this.selectedProduct.category_id,
      brand_id: this.selectedProduct.brand_id
    };

    if (this.selectedProduct.id === 0) {
      this.isSubmitting = true;
      // Tạo mới
      this.productService.createProduct(productDto).subscribe({
        next: (createdProduct) => {
          if (this.newImages.length > 0) {
            this.uploadImages(createdProduct.id, this.newImages, () => {
              this.reloadProduct(createdProduct.id, () => {
                this.loadProducts();
                this.resetForm();
                this.isSubmitting = false;
              });
            });
          } else {
            this.reloadProduct(createdProduct.id, () => {
              this.loadProducts();
              this.resetForm();
              this.isSubmitting = false;
            });
          }
        }, 
        error: (err) => {
          console.error('Lỗi khi tạo sản phẩm:', err);
          this.isSubmitting = false;
        }
      });
    } else {
      this.isSubmitting = true;
      // Cập nhật
      this.productService.updateProduct(this.selectedProduct.id, productDto).subscribe({
        next: (updateProduct) => {
          if (this.newImages.length > 0) {
            this.uploadImages(updateProduct.id, this.newImages, () => {
              this.reloadProduct(updateProduct.id, () => {
                this.loadProducts();
                this.resetForm();
                this.isSubmitting = false;
              });
            });
          } else {
            this.reloadProduct(updateProduct.id, () => {
              this.loadProducts();
              this.resetForm();
              this.isSubmitting = false;
            });
          }
        },
        error: (err) => {
          console.error('Lỗi khi cập nhật sản phẩm:', err);
          this.isSubmitting = false;
        }
      });
    }
    // Reset chiều cao ô mô tả về mặc định
    if (this.descriptionTextarea) {
      const textarea = this.descriptionTextarea.nativeElement;
      textarea.style.height = '38px'; // hoặc 'auto' hay giá trị bạn muốn (tuỳ style gốc)
    }
  }


  editProduct(product: ProductResponse): void {
    debugger
    this.selectedProduct = { ...product };
    this.currentImages = product.product_images.map(img => ({
      id: img.id,
      url: img.image_url
    }));
    this.newImages = [];
    this.newImagePreview = [];

    // Cuộn tới form
    setTimeout(() => {
      this.formSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);

    // Gọi resize mô tả sau khi DOM cập nhật
    setTimeout(() => {
      if (this.descriptionTextarea) {
        this.autoResizeTextarea(this.descriptionTextarea.nativeElement);
      }
    }, 0);


  }

  deleteProduct(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xoá sản phẩm này không?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.loadProducts();
        this.resetForm();
      });
    }
  }

  resetForm(): void {
    this.selectedProduct = this.resetProduct();
    this.selectedImages = null;
    this.imagePreview = null;
    if (this.imageInput) {
      this.imageInput.nativeElement.value = '';
    }
    this.currentImages = []; // reset ảnh hiện tại
    // Reset chiều cao ô mô tả về mặc định
    if (this.descriptionTextarea) {
      const textarea = this.descriptionTextarea.nativeElement;
      textarea.style.height = '38px'; // hoặc 'auto' hay giá trị bạn muốn (tuỳ style gốc)
    }
  }

  private resetProduct(): ProductResponse {
    return {
      id: 0,
      name: '',
      price: 0,
      thumbnail: '',
      description: '',
      category_id: 0,
      brand_id: 0,
      product_images: []
    };
  }

  onCategoryChange(): void {
    this.currentPage = 1; // Reset về trang đầu khi chọn danh mục khác
    this.loadProducts();
  }

  onBrandChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onPageChange(page: number) {

    this.currentPage = page;
    this.loadProducts();

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


  uploadImages(productId: number, files: File[], callback?: () => void): void {
    if (files.length === 0) return;

    const formData = new FormData();
    for (let file of files) {
      formData.append('files', file);
    }

    this.productService.uploadProductImages(productId, formData).subscribe({
      next: () => {
        if (callback) callback(); // Gọi lại sau khi upload xong
        this.loadProducts();
        this.newImages = [];
        this.newImagePreview = [];

      },
      error: (err) => {
        console.error('Lỗi khi upload ảnh:', err);
      }
    });
  }


  getFullThumbnailUrl(filename: string): string {
    return `https://ttb-shop-product-images.s3.amazonaws.com/products/${filename}`;
  }

  getImageUrl(img: { id: number, url: string }): string {
    return `${img.url}`;
  }

  // Khi chọn ảnh mới
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);

    const totalCurrentImages = this.currentImages.length + this.newImages.length;

    // Số ảnh có thể chọn thêm tối đa
    const maxSelectable = 5 - totalCurrentImages;

    if (maxSelectable <= 0) {
      alert('Bạn đã đạt đến số lượng ảnh tối đa (5 ảnh).');
      input.value = '';
      return;
    }
    // Chỉ lấy số ảnh trong giới hạn còn lại
    const filesToAdd = files.slice(0, maxSelectable);

    for (let file of filesToAdd) {
      this.newImages.push(file);

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newImagePreview.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }

    // reset input để có thể chọn lại cùng ảnh nếu cần
    input.value = '';
  }

  // Xoá ảnh đã có từ DB
  removeCurrentImage(index: number): void {
    const img = this.currentImages[index];
    if (!confirm('Bạn có chắc muốn xoá ảnh này không?')) return;

    this.productService.deleteProductImage(img.id).subscribe({
      next: () => {
        // ✅ Dòng thay thế: xoá ảnh bằng filter theo ID thay vì splice
        this.currentImages = this.currentImages.filter(image => image.id !== img.id);

        // Nếu ảnh bị xoá là thumbnail hiện tại thì cập nhật thumbnail mới
        if (this.selectedProduct.thumbnail === img.url) {
          const newThumbnail = this.currentImages.length > 0 ? this.currentImages[0].url : 'default-image.jpg';
          this.selectedProduct.thumbnail = newThumbnail;

          // Gửi request cập nhật thumbnail mới
          this.productService.updateProduct(this.selectedProduct.id, {
            ...this.selectedProduct,
            thumbnail: newThumbnail
          }).subscribe({
            next: () => console.log('Thumbnail updated after image deletion'),
            error: (err) => {
              console.error('Lỗi khi cập nhật thumbnail:', err);
              alert('Lỗi khi cập nhật thumbnail.');
            }
          });
        }

      },
      error: (err) => {
        console.error('Lỗi khi xoá ảnh:', err);
        alert('Lỗi khi xoá ảnh.');
      }
    });
  }


  // Xoá ảnh mới chọn
  removeNewImage(index: number): void {
    this.newImages.splice(index, 1);
    this.newImagePreview.splice(index, 1);
  }

  // Sửa reloadProduct để nhận callback khi load xong
  reloadProduct(productId: number, callback?: () => void): void {
    this.productService.getDetailProduct(productId).subscribe({
      next: (product: ProductResponse) => {
        this.selectedProduct = { ...product };
        this.currentImages = product.product_images.map(img => ({
          id: img.id,
          url: img.image_url
        }));
        this.newImages = [];
        this.newImagePreview = [];
        if (callback) callback();
      },
      error: () => {
        alert('Không thể tải lại sản phẩm sau khi cập nhật.');
      }
    });
  }

  autoResize(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto'; // Reset lại để tính lại chiều cao
    textarea.style.height = textarea.scrollHeight + 'px'; // Đặt chiều cao đúng theo nội dung
  }

  autoResizeTextarea(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
}