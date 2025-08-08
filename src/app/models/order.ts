import {OrderDetail} from './order.detail'
export interface Order {
    id: number;
    user_id: number;
    fullname: string; 
    email: string;
    phone_number: string; 
    address: string;
    zip_code: string;
    prefecture: string;
    city: string;
    address_line1: string;
    address_line2: string
    note: string;
    order_date: Date; 
    status: string;
    total_money: number; 
    shipping_method: string; 
    shipping_address: string; 
    shipping_date: Date; 
    tracking_number: string; 
    payment_method: string; 
    active: boolean;
    order_details: OrderDetail[]; 
  }  
