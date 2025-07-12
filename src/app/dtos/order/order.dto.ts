/*import { 
    IsString,
    IsNotEmpty,
    IsEmail,
    IsPhoneNumber,
    IsNumber,
    IsArray,
    ArrayMinSize,
    ValidateNested,
  } from 'class-validator';
    import { Type } from 'class-transformer';
    import { CartItemDTO } from './cart.item.dto';
  
  export class OrderDTO {
    @IsNumber()
    user_id: number;
  
    @IsString()
    @IsNotEmpty()
    fullname: string;
  
    @IsEmail()
    email: string;
  
    @IsString()
    @IsNotEmpty()
    phone_number: string;
  
    @IsString()
    @IsNotEmpty()
    address: string;
  
    @IsString()
    note: string;
  
    @IsNumber()
    total_money: number;
  
    @IsString()
    shipping_method: string;
  
    @IsString()
    payment_method: string;
  

  
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CartItemDTO)
    cart_items: CartItemDTO[];
  
    //cart_items: { product_id: number, quantity: number }[]; // Thêm cart_items để lưu thông tin giỏ hàng
  
    constructor(data: any) {
      this.user_id = data.user_id;
      this.fullname = data.fullname;
      this.email = data.email;
      this.phone_number = data.phone_number;
      this.address = data.address;
      this.note = data.note;
      this.total_money = data.total_money;
      this.shipping_method = data.shipping_method;
      this.payment_method = data.payment_method;
      this.cart_items = data.cart_items;
    }
  }*/

    export class OrderDTO {
      user_id: number;
      fullname: string;
      email: string;
      phone_number: string;
      address: string;
      note: string;
      total_money: number;
      shipping_method: string;
      payment_method: string;
      coupon_code: string;
      cart_items: { product_id: number; quantity: number }[];
    
      constructor(data: any) {
        this.user_id = data.user_id;
        this.fullname = data.fullname;
        this.email = data.email;
        this.phone_number = data.phone_number;
        this.address = data.address;
        this.note = data.note;
        this.total_money = data.total_money;
        this.shipping_method = data.shipping_method;
        this.payment_method = data.payment_method;
        this.coupon_code = data.coupon_code;
    
        // Đảm bảo chuyển từ order_details sang cart_items đúng định dạng
        this.cart_items = data.order_details?.map((d: any) => ({
          product_id: d.product.id,
          quantity: d.number_of_products
        })) || [];
      }
    }
    
  
  