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

}
