import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderResponse } from '../../responses/order/order.response';
import { OrderService } from '../../service/order.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenService } from '../../service/token.service';
import { UserService } from '../../service/user.service';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-order.history',
  imports: [CommonModule, TranslateModule],
  templateUrl: './order.history.component.html',
  styleUrl: './order.history.component.scss'
})
export class OrderHistoryComponent implements OnInit {
  orders: OrderResponse[] = [];
  userId: number = 0;
  token: string = ''

  constructor(
    private orderService: OrderService,
    private activatedRoute: ActivatedRoute,
    private tokenService: TokenService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
    this.token = this.tokenService.getToken() ?? '';
  
    this.userService.getUserDetail(this.token).subscribe({
      next: (response: any) => {
        debugger
        this.userId = response.id;
        console.log("user ID =", this.userId);
  
        // Gọi API đơn hàng ở đây, sau khi có userId
        this.orderService.getOrdersByUser(this.userId).subscribe({
          next: (data: OrderResponse[]) => {
            this.orders = data;
          },
          error: err => {
            console.error('Lỗi khi lấy lịch sử đơn hàng', err);
          }
        });
      },
      error: err => {
        console.error('Lỗi khi lấy thông tin user', err);
      }
    });
  }
  
  viewOrderDetail(orderId: number){
    this.router.navigate(['/orders', orderId]);
  }
  
}