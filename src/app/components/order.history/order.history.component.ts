import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderResponse } from '../../responses/order/order.response';
import { OrderService } from '../../service/order.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenService } from '../../service/token.service';
import { UserService } from '../../service/user.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-order.history',
  imports: [CommonModule, TranslateModule],
  templateUrl: './order.history.component.html',
  styleUrl: './order.history.component.scss'
})
export class OrderHistoryComponent implements OnInit {
  orders: OrderResponse[] = [];
  userId: number = 0;
  token: string = '';

  activeFilter = 'all';
  filteredOrders: OrderResponse[] = [];
  
  orderFilters = [
    { key: 'all', label: 'すべて' },
    { key: 'pending', label: '処理中' },
    { key: 'shipped', label: '配送中' },
    { key: 'delivered', label: '配送完了' },
    { key: 'cancelled', label: 'キャンセル' }
  ];

  constructor(
    private orderService: OrderService,
    private activatedRoute: ActivatedRoute,
    private tokenService: TokenService,
    private userService: UserService,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.fetchOrders();

    this.loadOrderFilters();

  this.translate.onLangChange.subscribe(() => {
    this.loadOrderFilters(); // Cập nhật khi đổi ngôn ngữ
  });
  }

  loadOrderFilters(): void {
    this.orderFilters = [
      { key: 'all', label: 'orderHistory.filter.all' },
      { key: 'pending', label: 'orderHistory.filter.pending' },
      { key: 'shipped', label: 'orderHistory.filter.shipped' },
      { key: 'delivered', label: 'orderHistory.filter.delivered' },
      { key: 'cancelled', label: 'orderHistory.filter.cancelled' }
    ];
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
            this.setActiveStatus("all");
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
  
  setActiveStatus(status: string) {
    this.activeFilter = status;
    this.filterOrders();
  }
  filterOrders() {
    if (this.activeFilter === 'all') {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter(order => order.status === this.activeFilter);
    }
  }

  getOrderCount(filter: string): number {
    if (filter === 'all') {
      return this.orders.length;
    }
    return this.orders.filter(order => order.status === filter).length;
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'pending': '注文確認中',
      'processing': '処理中',
      'shipped': '配送中',
      'delivered': '配送完了',
      'cancelled': 'キャンセル'
    };
    return statusLabels[status] || status;
  }
  goToShopping(): void {
    this.router.navigate(['/products']);
  }
  reorder(orderId: number) {
    console.log('Reorder:', orderId);
  }

  writeReview(orderId: number) {
    console.log('Write review for order:', orderId);
  }
}