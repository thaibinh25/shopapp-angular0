import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderResponse } from '../../../responses/order/order.response';
import { OrderService } from '../../../service/order.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { OrderDTO } from '../../../dtos/order/order.dto';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './order.detail.admin.component.html',
  styleUrl: './order.detail.admin.component.scss'
})
export class OrderDetailAdminComponent implements OnInit{
  
  orderId:number = 0;
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
    total_money: 0, 
    shipping_method: '',
    shipping_address: '',
    shipping_date: new Date(),
    payment_method: '',
    order_details: [],
    
  };  
  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router
    ) {}

  ngOnInit(): void {
    this.getOrderDetails();
  }
  
  getOrderDetails(): void {
    debugger
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (response: any) => {        
        debugger;       
        this.orderResponse.id = response.id;
        this.orderResponse.user_id = response.user_id;
        this.orderResponse.fullname = response.fullname;
        this.orderResponse.email = response.email;
        this.orderResponse.phone_number = response.phone_number;
        this.orderResponse.address = response.address; 
        this.orderResponse.zip_code =response.zip_code ?? '',
        this.orderResponse.prefecture= response.prefecture ?? '',
        this.orderResponse.city= response.city ?? '',
        this.orderResponse.address_line1= response.address_line1 ?? '',
        this.orderResponse.address_line2= response.address_line2 ?? '',
        this.orderResponse.note = response.note;
        this.orderResponse.total_money = response.total_money;
        if (response.order_date) {
          this.orderResponse.order_date = new Date(
            response.order_date[0], 
            response.order_date[1] - 1, 
            response.order_date[2]
          );        
        }        
        this.orderResponse.order_details = response.order_details
          .map((order_detail:any) => {
            debugger
          order_detail.product.thumbnail = order_detail.product.thumbnail;
          order_detail.number_of_products = order_detail.number_of_products
          //order_detail.total_money = order_detail.totalMoney
          return order_detail;
        });        
        this.orderResponse.payment_method = response.payment_method;
        if (response.shipping_date) {
          this.orderResponse.shipping_date = new Date(
            response.shipping_date[0],
            response.shipping_date[1] - 1,
            response.shipping_date[2]
          );
        }         
        this.orderResponse.shipping_method = response.shipping_method;        
        this.orderResponse.status = response.status;     
        debugger   
      },
      complete: () => {
        debugger;        
      },
      error: (error: any) => {
        debugger;
        console.error('Error fetching detail:', error);
      }
    });
  }    
  
  /*saveOrder(): void {    
    debugger    
    this.orderService
      .updateOrder(this.orderId, new OrderDTO(this.orderResponse))
      .subscribe({
      next: (response: any) => {
        debugger
        // Handle the successful update
        console.log('Order updated successfully:', response);
        // Navigate back to the previous page
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      complete: () => {
        debugger;        
      },
      error: (error: any) => {
        // Handle the error
        debugger
        console.error('Error updating order:', error);
      }
    });   
  }*/

  saveOrder(): void {
    this.orderService.updateOrderStatus(this.orderId, this.orderResponse.status).subscribe({
      next: (response) => {
        console.log('Order status updated successfully', response);
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: (error) => {
        console.error('Error updating order status', error);
      }
    });
  }
}