import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OrderResponse } from '../../responses/order/order.response';
import { OrderDetail } from '../../models/order.detail';
import { environment } from '../../../environments/environment';
import { OrderService } from '../../service/order.service';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './order.detail.component.html',
  styleUrl: './order.detail.component.scss'
})
export class OrderDetailComponent implements OnInit {

  orderId: number = 0;
  orderResponse: OrderResponse = {
    id: 0, // Hoặc bất kỳ giá trị số nào bạn muốn
    user_id: 0,
    fullname: '',
    phone_number: '',
    email: '',
    address: '',
    zip_code: '',
    prefecture: '',
    city: '',
    address_line1: '',
    address_line2: '',
    note: '',
    order_date: new Date(),
    status: '',
    total_money: 0, // Hoặc bất kỳ giá trị số nào bạn muốn
    shipping_method: '',
    shipping_address: '',
    shipping_date: new Date(),
    payment_method: '',
    order_details: [], // Một mảng rỗng
    
  };

  constructor(private orderService: OrderService, private activatedRoute: ActivatedRoute,private translate: TranslateService) { }

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.getOrderDetails();
    console.log('Ngôn ngữ hiện tại:', this.translate.currentLang);
  }

  getOrderDetails(): void {

    //const orderId = 15; // Thay bằng ID của đơn hàng bạn muốn lấy.
    const idParam = this.activatedRoute.snapshot.paramMap.get('id');
    if (idParam !== null) {
      this.orderId = +idParam;
    }
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (response: any) => {
        debugger
        this.orderResponse = {
          ...response,
          order_date: response.order_date ? new Date(response.order_date) : new Date(),
          shipping_date: response.shipping_date ? new Date(response.shipping_date) : null,
          order_details: response.order_details.map((od: OrderDetail) => ({
            ...od,
            product: {
              ...od.product,
              thumnail: od.product.thumbnail
              // thumbnail: `${environment.apiBaseUrl}/products/images/${od.product.thumbnail}`
            }
          }))
        };

      },
      complete: () => {

      },
      error: (error: any) => {

        console.error('Error fetching detail:', error);
      }
    });
  }


  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'pending': '注文確認中',
      'confirmed': '注文確定',
      'processing': '処理中',
      'shipped': '配送中',
      'delivered': '配送完了',
      'cancelled': 'キャンセル'
    };
    return statusLabels[status] || status;
  }

  printOrder() {
    window.print();
  }

  downloadInvoice() {
    console.log('Download invoice for order:', this.orderResponse.id);
    // Implement invoice download
  }

  contactSupport() {
    console.log('Contact support for order:', this.orderResponse.id);
    // Navigate to support page with order context
  }

  reportProblem() {
    console.log('Report problem for order:', this.orderResponse.id);
    // Navigate to problem report form
  }

  cancelOrder() {
    if (confirm('本当に注文をキャンセルしますか？')) {
      console.log('Cancel order:', this.orderResponse.id);
      // Implement order cancellation
    }
  }

  canCancel(): boolean {
    return ['pending', 'confirmed'].includes(this.orderResponse.status);
  }
  reorderItem(itemId: number) {
    console.log('Reorder item:', itemId);
    // Add item to cart
  }

  reviewItem(itemId: number) {
    console.log('Review item:', itemId);
    // Navigate to review page
  }

}
