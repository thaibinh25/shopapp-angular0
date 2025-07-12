import { Component, OnInit } from '@angular/core';
import { Order } from '../../../models/order';
import { OrderService } from '../../../service/order.service';
import { OrderResponse } from '../../../responses/order/order.response';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-order-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './order.admin.component.html',
  styleUrl: './order.admin.component.scss'
})
export class OrderAdminComponent implements OnInit{
    orders: OrderResponse[] = [];
    currentPage: number = 1;
    itemsPerPage: number = 12;
    pages: number[] = [];
    totalPages: number = 0;
    keyword: string = "";
    visiblePages: number[] = [];
    constructor(
        private orderService: OrderService
    ){

    }
    ngOnInit(): void {
        debugger
        this.getAllOrders(this.keyword, this.currentPage, this.itemsPerPage);
    }

    getAllOrders(keyword: string, page: number, limit: number){
        debugger
        this.orderService.getAllOrders(keyword,page -1,limit).subscribe({
            next: (response: any) => {
                debugger
                this.orders = response.orders;
                this.totalPages = response.totalPages;
                this.visiblePages = this.generateVisiblePageArray(this.currentPage,this.totalPages);
            },
            complete: () => {
       
            },
            error: (error: any) => {
              
              console.error('Error fetching products:', error);
            }
            
        });
    }

    onPageChange(page: number ) {
    
        this.currentPage = page;
        this.getAllOrders(this.keyword, this.currentPage, this.itemsPerPage);
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

      deleteOrder(orderId: number): void{
        if (confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
            this.orderService.deleteOrder(orderId).subscribe({
              next: () => {
                this.orders = this.orders.filter(o => o.id !== orderId);
                alert('Xóa đơn hàng thành công!');
              },
              error: (err) => {
                console.error('Lỗi khi xóa đơn hàng:', err);
                alert('Không thể xóa đơn hàng.');
              }
            });
          }
    }
}