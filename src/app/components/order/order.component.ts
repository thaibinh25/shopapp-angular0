import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { FormBuilder, Validators } from '@angular/forms';
import { Product } from '../../models/product';
import { OrderDTO } from '../../dtos/order/order.dto';
import { CartService } from '../../service/cartService';
import { ProductService } from '../../service/product.service';
import { OrderService } from '../../service/order.service';
import { TokenService } from '../../service/token.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Order } from '../../models/order';
import { environment } from '../../../environments/environment';
import { FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { PaymentService } from '../../service/payment.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, TranslateModule],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss'
})
export class OrderComponent implements OnInit {
  public Math = Math;
  orderForm: FormGroup; // Đối tượng FormGroup để quản lý dữ liệu của form
  cartItems: { product: Product, quantity: number }[] = [];
  couponCode: string = ''; // Mã giảm giá
  totalAmount: number = 0; // Tổng tiền
  orderData: OrderDTO = {
    user_id: 0, // Thay bằng user_id thích hợp
    fullname: '', // Khởi tạo rỗng, sẽ được điền từ form
    email: '', // Khởi tạo rỗng, sẽ được điền từ form
    phone_number: '', // Khởi tạo rỗng, sẽ được điền từ form
    address: '', // Khởi tạo rỗng, sẽ được điền từ form
    note: '', // Có thể thêm trường ghi chú nếu cần
    total_money: 0, // Sẽ được tính toán dựa trên giỏ hàng và mã giảm giá
    payment_method: 'cod', // Mặc định là thanh toán khi nhận hàng (COD)
    shipping_method: 'express', // Mặc định là vận chuyển nhanh (Express)
    coupon_code: '', // Sẽ được điền từ form khi áp dụng mã giảm giá
    cart_items: []
  };

  discountAmount: number = 0;
  couponApplied: boolean = false;
  couponError: string = '';

  stripe!: Stripe | null;
  card!: StripeCardElement;
  clientSecret: string = '';

  isProcessing: boolean = false;


  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private orderService: OrderService,
    private tokenService: TokenService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private paymentService: PaymentService,
  ) {
    // Tạo FormGroup và các FormControl tương ứng
    this.orderForm = this.formBuilder.group({
      fullname: ['', Validators.required], // fullname là FormControl bắt buộc      
      email: ['', [Validators.email]], // Sử dụng Validators.email cho kiểm tra định dạng email
      phone_number: ['', [Validators.required, Validators.minLength(6)]], // phone_number bắt buộc và ít nhất 6 ký tự
      address: ['', [Validators.required, Validators.minLength(5)]], // address bắt buộc và ít nhất 5 ký tự
      note: [''],
      shipping_method: ['express'],
      payment_method: ['cod', Validators.required],
      coupon_code: [''],
    });
  }

  async ngOnInit() {
    this.getCartItems();

    //  Lắng nghe thay đổi mã coupon và tự apply sau 1s người dùng ngừng gõ
    this.orderForm.get('coupon_code')?.valueChanges
      .pipe(
        debounceTime(1000),          // Đợi 1s sau khi người dùng dừng gõ
        distinctUntilChanged()       // Chỉ thực hiện nếu giá trị khác nhau
      )
      .subscribe(code => {
        if (code && code.trim().length > 0) {
          this.onCouponEntered();        // Gọi applyCoupon tự động
        } else {
          this.couponApplied = false;
          this.discountAmount = 0;
        }
      });

    this.onPaymentMethodChange();
  }

  getCartItems() {
    this.orderData.user_id = this.tokenService.getUserId();
    // Lấy danh sách sản phẩm từ giỏ hàng

    //this.cartService.clearCart();
    const cart = this.cartService.getCart();
    const productIds = Array.from(cart.keys()); // Chuyển danh sách ID từ Map giỏ hàng    

    // Gọi service để lấy thông tin sản phẩm dựa trên danh sách ID

    // Nếu giỏ hàng rỗng, reset cartItems về rỗng và totalAmount = 0
    if (productIds.length === 0) {
      this.cartItems = [];
      this.totalAmount = 0;

      return; // Không cần gọi API nữa
    }
    this.productService.getProductsByIds(productIds).subscribe({
      next: (products) => {

        // Lấy thông tin sản phẩm và số lượng từ danh sách sản phẩm và giỏ hàng
        this.cartItems = productIds.map((productId) => {

          const product = products.find((p) => p.id === productId);
          if (product) {
            product.thumbnail = product.thumbnail;
            //product.thumbnail = `${environment.apiBaseUrl}/products/images/${product.thumbnail}`;
          }
          return {
            product: product!,
            quantity: cart.get(productId)!
          };
        });
        console.log('haha');
      },
      complete: () => {

        this.calculateTotal()
      },
      error: (error: any) => {

        console.error('Error fetching detail:', error);
      }
    });
  }

  async placeOrder() {

    //  Kiểm tra đăng nhập
    if (this.tokenService.getToken() == null || this.tokenService.isTokenExpired()) {
      this.router.navigate(['/login']);
      return;
    }

    //  Validate form
    if (!this.orderForm.valid) {
      alert('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
      return;
    }

    //  Chuẩn bị dữ liệu order
    this.orderData = {
      ...this.orderData,
      total_money: this.totalAmount,
      ...this.orderForm.value,
      shipping_date: new Date().toLocaleDateString('en-CA'),
      cart_items: this.cartItems.map(cartItem => ({
        product_id: cartItem.product.id,
        quantity: cartItem.quantity
      }))
    };

    const paymentMethod = this.orderForm.get('payment_method')?.value;

    //  Nếu chọn Visa → thực hiện gọi API tạo clientSecret
    if (paymentMethod === 'visa') {
      const total = this.totalAmount - this.discountAmount;
      const amountInCents = Math.round(total * 100); // chính xác đơn vị cent vì lúc gửi là usd trên tripe tính là cent

      this.isProcessing = true;
      this.paymentService.createPaymentIntent(amountInCents)
        .subscribe(async res => {
          debugger
          this.clientSecret = res.clientSecret;



          //  Xác nhận thanh toán bằng Stripe
          const result = await this.stripe?.confirmCardPayment(this.clientSecret, {
            payment_method: {
              card: this.card,
              billing_details: {
                name: this.orderForm.get('fullname')?.value
              }
            }
          });
          
          // ✅ Nếu thanh toán thành công → gọi hàm đặt hàng
          if (result?.paymentIntent?.status === 'succeeded') {
              this.submitOrder();
              
          } else {
            alert('Thanh toán thất bại: ' + result?.error?.message);
          }

          this.isProcessing = false;
        });
    } else {
      // Nếu là COD → gọi luôn hàm đặt hàng
      this.submitOrder();
    }
  }

  submitOrder() {
    this.orderService.placeOrder(this.orderData).subscribe({
      next: (response: Order) => {
        console.log('Đặt hàng thành công');
        this.cartService.clearCart();
        this.router.navigate(['/orders/', response.id]);
      },
      complete: () => {
        this.calculateTotal();
      },
      error: (error: any) => {
        console.error('Lỗi khi đặt hàng:', error);
      },
    });
  }

  // Thêm phương thức xóa sản phẩm khỏi giỏ hàng
  removeFromCart(productId: number): void {

    this.cartService.removeFromCart(productId); // Gọi phương thức xóa sản phẩm
    this.getCartItems(); // Cập nhật lại danh sách giỏ hàng
    this.calculateTotal(); // Cập nhật tổng giá trị giỏ hàng

  }

  increaseQuantity(productId: number): void {
    const cart = this.cartService.getCart();
    const currentQuantity = cart.get(productId) || 0;
    this.cartService.updateQuantity(productId, currentQuantity + 1);
    this.getCartItems(); // Cập nhật lại giao diện
    this.calculateTotal();
  }

  decreaseQuantity(productId: number): void {
    const cart = this.cartService.getCart();
    const currentQuantity = cart.get(productId) || 0;
    if (currentQuantity > 1) {
      this.cartService.updateQuantity(productId, currentQuantity - 1);
    } else {
      this.cartService.removeFromCart(productId); // Nếu giảm về 0 thì xoá luôn
    }
    this.getCartItems(); // Cập nhật lại giao diện
    this.calculateTotal();
  }

  // Hàm tính tổng tiền
  calculateTotal(): void {
    this.totalAmount = this.cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }

  // Hàm xử lý việc áp dụng mã giảm giá
  applyCoupon(): void {
    debugger
    const code = this.orderForm.get('coupon_code')?.value;

    if (!code) {
      this.couponError = 'Vui lòng nhập mã giảm giá';
      this.discountAmount = 0;
      this.couponApplied = false;
      return;
    }

    this.orderService.applyCoupon(code, this.totalAmount).subscribe({
      next: (response) => {
        if (response.valid) {
          this.discountAmount = response.discountAmount;
          this.couponApplied = true;
          this.couponError = '';
          this.orderData.coupon_code = code; // Lưu mã vào orderDTO nếu hợp lệ
        } else {
          this.discountAmount = 0;
          this.couponApplied = false;
          this.couponError = response.message || 'Mã giảm giá không hợp lệ';
        }
      },
      error: () => {
        this.discountAmount = 0;
        this.couponApplied = false;
        this.couponError = 'Lỗi khi kiểm tra mã giảm giá';
      }
    });
  }

  formatCardNumber(): void {
    const raw = this.orderForm.get('card_number')?.value || '';
    const digits = raw.replace(/\D/g, '');
    const groups = digits.match(/.{1,4}/g) || [];
    const formatted = groups.join(' ');
    this.orderForm.get('card_number')?.setValue(formatted, { emitEvent: false });
  }

  async setupStripeCard(): Promise<void> {
    try {
      if (!this.stripe) {
        this.stripe = await loadStripe('pk_test_51RSo4xPFbw4IcrssemjdpIYT7mqKMy7ya89Cq54XrZYoPjPXRxAN4njP03jpFPpcclEQd2uuE7ikMHiJjWkJXRIA00QxXAyTZn');
      }

      if (!this.stripe) {
        console.error('❌ Không thể load Stripe!');
        return;
      }

      const cardElementDiv = document.getElementById('card-element');
      if (!cardElementDiv) {
        console.error('❌ Không tìm thấy thẻ #card-element trong DOM!');
        return;
      }

      cardElementDiv.innerHTML = ''; // Dọn trước
      const elements = this.stripe.elements();
      this.card = elements.create('card');
      this.card.mount('#card-element');
    } catch (error) {
      console.error('❌ Lỗi khi khởi tạo Stripe card:', error);
    }
  }




  onPaymentMethodChange() {
    const method = this.orderForm.get('payment_method')?.value;
    if (method === 'visa') {
      // ⚠️ Chờ DOM hiển thị element
      setTimeout(() => this.setupStripeCard(), 50);
    }
  }


  onCouponEntered(): void {
    const code = this.orderForm.get('coupon_code')?.value?.trim();
    if (!code) {
      this.couponApplied = false;
      this.couponError = '';
      return;
    }

    this.orderService.applyCoupon(code, this.totalAmount).subscribe({
      next: (res) => {
        if (res.valid) {
          this.discountAmount = res.discountAmount;
          this.couponApplied = true;
          this.couponError = '';
          this.orderData.coupon_code = code;
        } else {
          this.discountAmount = 0;
          this.couponApplied = false;
          this.couponError = res.message || 'Mã giảm giá không hợp lệ';
        }
      },
      error: () => {
        this.discountAmount = 0;
        this.couponApplied = false;
        this.couponError = 'Lỗi khi kiểm tra mã giảm giá';
      }
    });
  }

}


