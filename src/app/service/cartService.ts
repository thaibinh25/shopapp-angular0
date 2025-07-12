import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
  })
  
  export class CartService {
    private cart: Map<number, number> = new Map(); // Dùng Map để lưu trữ giỏ hàng, key là id sản phẩm, value là số lượng
  
    constructor() {
      // Lấy dữ liệu giỏ hàng từ localStorage khi khởi tạo service    
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        this.cart = new Map(JSON.parse(storedCart));      
      }
    }
  
    addToCart(productId: number, quantity: number = 1): void {
      debugger
      if (this.cart.has(productId)) {
        // Nếu sản phẩm đã có trong giỏ hàng, tăng số lượng lên `quantity`
        this.cart.set(productId, this.cart.get(productId)! + quantity);
      } else {
        // Nếu sản phẩm chưa có trong giỏ hàng, thêm sản phẩm vào với số lượng là `quantity`
        this.cart.set(productId, quantity);
      }
       // Sau khi thay đổi giỏ hàng, lưu trữ nó vào localStorage
      this.saveCartToLocalStorage();
    }
    
    getCart(): Map<number, number> {
      return this.cart;
    }

    removeFromCart(productId: number): void {
      if (this.cart.has(productId)) {
        this.cart.delete(productId); // Xóa sản phẩm khỏi giỏ hàng
        this.saveCartToLocalStorage(); // Lưu lại giỏ hàng vào localStorage
      }
    }
    updateQuantity(productId: number, quantity: number): void {
      const cart = this.getCart();
      if (quantity <= 0) {
        cart.delete(productId);
      } else {
        cart.set(productId, quantity);
      }
      localStorage.setItem('cart', JSON.stringify(Array.from(cart.entries())));
    }

    // Lưu trữ giỏ hàng vào localStorage
    private saveCartToLocalStorage(): void {
      debugger
      localStorage.setItem('cart', JSON.stringify(Array.from(this.cart.entries())));
    }  
    // Hàm xóa dữ liệu giỏ hàng và cập nhật Local Storage
    clearCart(): void {
      this.cart.clear(); // Xóa toàn bộ dữ liệu trong giỏ hàng
      this.saveCartToLocalStorage(); // Lưu giỏ hàng mới vào Local Storage (trống)
    }
  }
  