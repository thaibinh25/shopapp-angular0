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
import { ViewChild, ElementRef, AfterViewChecked } from '@angular/core';

import {
  loadStripe,
  Stripe,
  StripeCardNumberElement,
  StripeCardExpiryElement,
  StripeCardCvcElement,
  StripeCardElement,
} from '@stripe/stripe-js';

import { HttpClient } from '@angular/common/http';
import { PaymentService } from '../../service/payment.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';



interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  zipCode: string;
  prefecture: string;
  city: string;
  address_line1: string;
  address_line2?: string;
}

interface PaymentMethod {
  type: 'credit' | 'bank' | 'daibiki';
  label: string;
  icon: string;
}

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
    zip_code: '',
    prefecture: '',
    city: '',
    address_line1: '',
    address_line2: '',
    note: '', // Có thể thêm trường ghi chú nếu cần
    total_money: 0, // Sẽ được tính toán dựa trên giỏ hàng và mã giảm giá
    payment_method: '', // Mặc định là thanh toán khi nhận hàng (COD)
    shipping_method: 'express', // Mặc định là vận chuyển nhanh (Express)
    coupon_code: '', // Sẽ được điền từ form khi áp dụng mã giảm giá
    cart_items: []
  };

  discountAmount: number = 0;
  couponApplied: boolean = false;
  couponError: string = '';

  stripe!: Stripe | null;
  card!: StripeCardElement;
  cardNumberElement!: StripeCardNumberElement;
  cardExpiryElement!: StripeCardExpiryElement;
  cardCvcElement!: StripeCardCvcElement;

  cardBrand: string = '';
  cardComplete: boolean = false;

  clientSecret: string = '';

  isProcessing: boolean = false;
  currentStep = 1;

  shippingAddress: ShippingAddress = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    zipCode: '',
    prefecture: '',
    city: '',
    address_line1: '',
    address_line2: ''
  };


  paymentMethods: PaymentMethod[] = [
    { type: 'credit', label: 'クレジットカード', icon: '💳' },
    { type: 'bank', label: '銀行振込', icon: '🏦' },
    { type: 'daibiki', label: '代引き', icon: '〒' },

  ];

  selectedPaymentMethod: string = '';
  shouldShakeCoupon = false;
  isCardComplete: boolean = false;
  hasMountedStripe = false;
  stripeInitializing: boolean = false;




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
    private translate: TranslateService
  ) {
    // Tạo FormGroup và các FormControl tương ứng
    this.orderForm = this.formBuilder.group({
      fullname: ['', Validators.required], // fullname là FormControl bắt buộc      
      email: ['', [Validators.email]], // Sử dụng Validators.email cho kiểm tra định dạng email
      phone_number: ['', [Validators.required, Validators.minLength(6)]], // phone_number bắt buộc và ít nhất 6 ký tự
      address: ['', [Validators.required, Validators.minLength(5)]], // address bắt buộc và ít nhất 5 ký tự
      zip_code: ['', [Validators.required, Validators.pattern(/^\d{7}$/)]],
      prefecture: ['',[Validators.required, Validators.minLength(2)]],
      city: ['',[Validators.required, Validators.minLength(2)]],
      address_line1: ['',[Validators.required, Validators.minLength(5)]],
      address_line2: [''],
      note: [''],
      shipping_method: ['express'],
      payment_method: ['', Validators.required],
      coupon_code: [''],
    });
  }

  @ViewChild('creditCardForm') creditCardFormRef!: ElementRef;
  async ngOnInit() {
    this.getCartItems();
    this.orderForm.get('coupon_code')?.valueChanges
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(code => {
        if (code?.trim()) this.onCouponEntered();
        else {
          this.couponApplied = false;
          this.discountAmount = 0;
        }
      });

      this.loadPaymentMethods();
      // ✅ Lắng nghe khi đổi ngôn ngữ
  this.translate.onLangChange.subscribe(() => {
    this.loadPaymentMethods(); // Gọi lại để update label đa ngôn ngữ
  });
  }

  async ngAfterViewInit(): Promise<void> {


    if (this.selectedPaymentMethod === 'credit') {
      await this.waitForStripeElementsToBeReady(); // 🔥 Đợi DOM sẵn sàng
      await this.setupStripeCard();
    }
  }

  loadPaymentMethods() {
    this.paymentMethods = [
      {
        type: 'credit',
        label: this.translate.instant('order.payment.method.credit'),
        icon: '💳',
      },
      {
        type: 'bank',
        label: this.translate.instant('order.payment.method.bank'),
        icon: '🏦',
      },
      {
        type: 'daibiki',
        label: this.translate.instant('order.payment.method.daibiki'),
        icon: '〒',
      },
    ];
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

  async placeOrder(): Promise<void> {
    debugger
    if (this.tokenService.getToken() == null || this.tokenService.isTokenExpired()) {
      this.router.navigate(['/login']); return;
    }
    this.fillOrderFormFromShippingAddress();

    if (!this.orderForm.valid) {
      alert('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.'); return;
    }


    this.orderData = {
      ...this.orderData,
      total_money: this.totalAmount,
      ...this.orderForm.value,
      shipping_date: new Date().toLocaleDateString('en-CA'),
      cart_items: this.cartItems.map(item => ({ product_id: item.product.id, quantity: item.quantity }))
    };

    const paymentMethod = this.orderForm.get('payment_method')?.value;

    if (paymentMethod === 'credit') {
      const amountInCents = Math.round((this.totalAmount - this.discountAmount) * 100);
      this.isProcessing = true;

      try {
        const res = await this.paymentService.createPaymentIntent(amountInCents).toPromise();
        this.clientSecret = res.clientSecret;

        const numberDiv = document.getElementById('card-number');
        if (!this.cardNumberElement || !this.cardExpiryElement || !this.cardCvcElement || !numberDiv || numberDiv.children.length === 0) {
          alert('❌ Stripe Elements chưa mount đầy đủ!');
          this.isProcessing = false; return;
        }

        const paymentMethodResult = await this.stripe!.createPaymentMethod({
          type: 'card',
          card: this.cardNumberElement,
          billing_details: {
            name: this.orderForm.value.fullname,
            email: this.orderForm.value.email
          }
        });

        if (paymentMethodResult.error) {
          alert('❌ Tạo phương thức thanh toán thất bại: ' + paymentMethodResult.error.message);
          this.isProcessing = false; return;
        }

        const result = await this.stripe!.confirmCardPayment(this.clientSecret, {
          payment_method: paymentMethodResult.paymentMethod.id
        });

        if (result.error) {
          alert('❌ Thanh toán thất bại: ' + result.error.message);
          this.isProcessing = false; return;
        }

        if (result.paymentIntent?.status === 'succeeded') {
          this.submitOrder();
        } else {
          alert('❌ Thanh toán không thành công. Vui lòng thử lại.');
        }

      } catch (error: any) {
        alert('❌ Lỗi hệ thống: ' + (error?.message || 'Không rõ nguyên nhân'));
      }

      this.isProcessing = false;
    } else {
      this.submitOrder();
    }
  }


  fillOrderFormFromShippingAddress(): void {
    debugger
    const fullName = `${this.shippingAddress.lastName} ${this.shippingAddress.firstName}`.trim();
    const fullAddress = `${this.shippingAddress.zipCode}${this.shippingAddress.prefecture}${this.shippingAddress.city}${this.shippingAddress.address_line1}${this.shippingAddress.address_line2}`.trim();

    this.orderForm.patchValue({
      fullname: fullName,
      email: this.shippingAddress.email,
      phone_number: this.shippingAddress.phone,
      address: fullAddress,
      zip_code: this.shippingAddress.zipCode,
      prefecture: this.shippingAddress.prefecture,
      city: this.shippingAddress.city,
      address_line1: this.shippingAddress.address_line1,
      address_line2: this.shippingAddress.address_line2,
    });
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
    console.log('🔥 setupStripeCard() được gọi');

    this.stripeInitializing = true;

    if (!this.stripe) {
      this.stripe = await loadStripe("pk_test_51RSo4xPFbw4IcrssemjdpIYT7mqKMy7ya89Cq54XrZYoPjPXRxAN4njP03jpFPpcclEQd2uuE7ikMHiJjWkJXRIA00QxXAyTZn"); // dùng biến env
    }

    const numberEl = document.getElementById('card-number');
    const expiryEl = document.getElementById('card-expiry');
    const cvcEl = document.getElementById('card-cvc');

    if (!numberEl || !expiryEl || !cvcEl) {
      console.warn('❌ DOM thiếu element để mount');
      return;
    }

    numberEl.innerHTML = '';
    expiryEl.innerHTML = '';
    cvcEl.innerHTML = '';

    try {
      const elements = this.stripe!.elements();

      this.cardNumberElement = elements.create('cardNumber');
      this.cardNumberElement.mount('#card-number');
      console.log('✅ cardNumber mounted');

      this.cardExpiryElement = elements.create('cardExpiry');
      this.cardExpiryElement.mount('#card-expiry');
      console.log('✅ cardExpiry mounted');

      this.cardCvcElement = elements.create('cardCvc');
      this.cardCvcElement.mount('#card-cvc');
      console.log('✅ cardCvc mounted');

      this.cardNumberElement.on('change', (event) => {
        this.cardBrand = event.brand;
        this.cardComplete = event.complete;
        const errorDiv = document.getElementById('card-errors');
        if (errorDiv) errorDiv.textContent = event.error?.message || '';
      });
    } catch (error) {
      console.error('❌ Mount lỗi:', error);
    } finally {
      this.stripeInitializing = false;
    }
  }


  selectPaymentMethod(method: string) {
    this.selectedPaymentMethod = method;
    this.orderForm.patchValue({ payment_method: method });

    if (method === 'credit') {
      setTimeout(async () => {
        console.log('👉 Đang chờ mount Stripe...');
        await this.waitForStripeElementsToBeReady();
        console.log('✅ Các div đã sẵn sàng, tiến hành mount');
        await this.setupStripeCard();
      }, 0);
    }
  }






  onPaymentMethodChange() {
    const method = this.orderForm.get('payment_method')?.value;
    if (method === 'credit') {
      // ⚠️ Chờ DOM hiển thị element
      setTimeout(() => this.setupStripeCard(), 300);
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

  getSubtotal() {
    return this.cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  getTotal(): number {
    return this.getSubtotal(); // No shipping cost
  }



  getSelectedPaymentLabel(): string {
    const type = this.orderForm.get('payment_method')?.value;
    const method = this.paymentMethods.find(pm => pm.type === type);
    return method ? `${method.icon} ${method.label}` : '未選択';
  }

  getTax(): number {
    return Math.round((this.getSubtotal() - this.discountAmount) * 0.1); // 10% tax
  }

  getFinalTotal(): number {
    return this.getSubtotal() + this.getTax() - this.discountAmount;
  }

  nextStep() {
    if (this.currentStep === 2) {
      this.fillOrderFormFromShippingAddress();

    }

    if (this.currentStep === 3) {
      this.orderForm.patchValue({
        payment_method: this.selectedPaymentMethod
      });
    }

    if (!this.canProceed()) {
      if (this.currentStep === 3 && this.selectedPaymentMethod === 'credit' && !this.cardComplete) {
        alert('Vui lòng nhập đầy đủ thông tin thẻ trước khi tiếp tục.');
      }
      return;
    }

    if (this.currentStep === 3 && this.selectedPaymentMethod === 'credit') {
      this.destroyStripeElements(); // 🔁 thêm hàm này
    }

    this.currentStep++;

    if (this.canProceed() && this.currentStep < 3) {
      this.currentStep++;

      // 👇 Nếu vừa chuyển sang bước 4 → kích hoạt shake
      if (this.currentStep === 3) {
        this.shouldShakeCoupon = true;

        // Tắt shake sau 500ms để tránh rung mãi
        setTimeout(() => {
          this.shouldShakeCoupon = false;
        }, 500);
      }
    }
    console.log("fromOrder: ", this.orderForm.value);
  }

  destroyStripeElements() {
    try {
      if (this.cardNumberElement) this.cardNumberElement.unmount();
      if (this.cardExpiryElement) this.cardExpiryElement.unmount();
      if (this.cardCvcElement) this.cardCvcElement.unmount();
    } catch (err) {
      console.warn('⚠️ destroyStripeElements failed', err);
    }
  }

  previousStep() {
    if (this.currentStep === 3 && this.selectedPaymentMethod === 'credit') {
      console.log('🔙 Quay lại bước 3, chuẩn bị mount Stripe lại...');
      setTimeout(async () => {
        await this.waitForStripeElementsToBeReady();
        await this.setupStripeCard();
      }, 0);
    }
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.cartItems.length > 0;
      case 2:
        return this.isShippingAddressValid();
      case 3:

        if (this.selectedPaymentMethod === 'credit') {
          return this.cardComplete;
        }
        return !!this.selectedPaymentMethod;
      default:
        return true;
    }
  }

  isShippingAddressValid(): boolean {
    return !!(
      this.shippingAddress.firstName &&
      this.shippingAddress.lastName &&
      this.shippingAddress.email &&
      this.shippingAddress.phone &&
      this.shippingAddress.zipCode &&
      this.shippingAddress.prefecture &&
      this.shippingAddress.city &&
      this.shippingAddress.address_line1
    );
  }

  private waitForStripeElementsToBeReady(timeout = 3000): Promise<void> {
    return new Promise((resolve, reject) => {
      const start = Date.now();

      const check = () => {
        const number = document.getElementById('card-number');
        const expiry = document.getElementById('card-expiry');
        const cvc = document.getElementById('card-cvc');
        if (number && expiry && cvc) {
          console.log('✅ Stripe Elements container đã sẵn sàng');
          resolve();
        } else if (Date.now() - start > timeout) {
          console.warn('❌ Stripe Elements không sẵn sàng sau timeout!');
          reject(new Error('Timeout chờ DOM'));
        } else {
          setTimeout(check, 50);
        }
      };

      check();
    });
  }

}





