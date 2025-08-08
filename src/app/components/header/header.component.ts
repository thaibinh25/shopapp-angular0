import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router, ActivatedRoute, NavigationStart } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, filter, Subject, Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';
import { NgbPopover, NgbPopoverModule, NgbPopoverConfig } from '@ng-bootstrap/ng-bootstrap';
import { UserResponse } from '../../responses/user/user.response';
import { UserService } from '../../service/user.service';
import { TokenService } from '../../service/token.service';
import { NotificationService } from '../../service/notification.service';
import { UserNotification } from '../../models/notification';
import { NotificationSocketService } from '../../service/notification.socket.service';
import { TranslateModule } from '@ngx-translate/core';
import { CartService } from '../../service/cartService';

declare const google: any;
declare global {
  interface Window {
    google: any;
  }
}
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, NgbPopoverModule, TranslateModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @ViewChild('popover') popover?: NgbPopover;
  userResponse?: UserResponse | null;
  isPopoverOpen = false;

  notifications: UserNotification[] = [];
  unreadCount: number = 0;
  showPopover = false;
  googleReady: boolean = false;
  private userSub?: Subscription;
  isMobileMenuOpen: boolean = false;
  isMobile: boolean = false;
  searchQuery: string = '';
  cartCount: number = 0;
  keyword: string = '';
  keywordSubject = new Subject<string>();

  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private router: Router,
    private cdRef: ChangeDetectorRef, // Đảm bảo cập nhật UI khi cần
    private notificationService: NotificationService,
    private socketService: NotificationSocketService,
    private cartService: CartService

  ) { 
    this.keywordSubject.pipe(
      debounceTime(100)
    ).subscribe(keyword => {
      if (keyword.trim().length > 1) {
        this.router.navigate(['/products'], {
          queryParams: { keyword: keyword.trim() }
        });
      } else {
        this.router.navigate(['/products']);
      }
    });
    
  }

  ngOnInit() {
    //this.loadCartCount(); 
    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
      this.cdRef.detectChanges(); // 👈 Đảm bảo cập nhật UI nếu cần
    });

    this.userSub = this.userService.user$.subscribe(user => {
      this.userResponse = user;
      console.log('🔄 Header cập nhật user:', user);
    });

    this.userResponse = this.userService.getUserResponseFromLocalStorage();

    // Đóng popover khi điều hướng thành công
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.popover?.close(); // Đóng popover khi chuyển route
      }
    });

    const user = this.tokenService.getUser(); 
    console.log('👤 USER INFO:', user);
    if (user && user.userId && user?.['role'] === 'user') {
      debugger
      this.loadNotifications();
      // Kết nối socket và lắng nghe thông báo
      this.socketService.connect(user.userId.toString(), (data) => {
        debugger
        console.log('🔔 Nhận thông báo mới:', data);

        // Thêm vào danh sách
        this.notifications.unshift(data);

        // Cập nhật số lượng chưa đọc

        this.unreadCount++;

      });
    }

    this.updateMobileStatus();
  }




  viewNotificationDetail(notiId: number) {
    this.markAsRead(notiId);
    this.router.navigate(['/notifications', notiId]);
  }

  loadNotifications() {
    debugger
    const userId = this.tokenService.getUserId();
    this.notificationService.getNotifications(userId).subscribe({

      next: (data) => {
        debugger
        this.notifications = data;
        this.unreadCount = data.filter((n: any) => !(n.read === true || n.read === 'true')).length;
        console.log('Dữ liệu read:', data.map(n => ({ id: n.id, read: n.read, type: typeof n.read })));
      },
      error: (err) => {
        console.error('Error loading notifications:', err);
      }
    });
  }


  toggleNotificationPopover() {
    this.showPopover = !this.showPopover;
  }

  togglePopover(event: Event): void {
    this.isPopoverOpen = !this.isPopoverOpen;
  }

  handleItemClick(index: number, popover: NgbPopover): void {
    debugger
    // Đóng popover ngay lập tức
    popover.close();

    switch (index) {
      case 0: // Tài khoản của tôi
        this.router.navigate(['/user-profile']);
        break;
      case 1: // Đơn mua
        this.router.navigate(['/orders']);
        break;
      case 2: // lịch sử mua hàng 
        this.router.navigate(['orders/users:id']);
        break;
      case 3: // Đăng xuất
        this.userService.removeUserFromLocalStorage();
        this.tokenService.removeToken();
        this.userResponse = undefined;
        this.socketService.disconnect();
        this.router.navigate(['/']).then(() => {
          window.location.reload();  // Reload sau khi chắc chắn mọi thứ đã huỷ
        });

        break;
    }
  }

  onNavLinkClick(num: number): void {
    this.isMobileMenuOpen = false; // 👈 Khi chọn link, đóng menu
    this.popover?.close();

    // Sử dụng window.location.href để thử điều hướng
    if (num === 0) {
      console.log('Link clicked trang chủ');
      window.location.href = '/'; // Điều hướng không qua Angular Router
    } else if (num === 1) {
      console.log('Link clicked thông báo');
      window.location.href = '/notifications'; // Điều hướng không qua Angular Router
    } else if (num === 2) {
      console.log('Link clicked giỏ hàng');
      window.location.href = '/orders'; // Điều hướng không qua Angular Router
    }
  }

  markAsRead(id: number) {
    this.notificationService.markAsRead(id).subscribe(() => {
      debugger
      const noti = this.notifications.find(n => n.id === id);
      console.log(this.notifications);
      if (noti) noti.read = true;
      this.unreadCount = this.notifications.filter(n => !n.read).length;
      this.cdRef.detectChanges();

    });
  }
  //Ẩn popover khi click ra ngoài
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const targetElement = event.target as HTMLElement;
    if (!targetElement.closest('.notification-icon')) {
      this.showPopover = false;
    }
  }

  
   // 👇 Toggle mở menu trên thiết bị di động
   toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

   // 👇 Cập nhật trạng thái thiết bị
   @HostListener('window:resize', ['$event'])
   onResize() {
     this.updateMobileStatus();
   }
 
   private updateMobileStatus() {
     this.isMobile = window.innerWidth <= 768;
     if (!this.isMobile) {
       this.isMobileMenuOpen = false; // 👈 Reset khi quay lại desktop
     }
   }
   loadCartCount(): void {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.cartCount = cart.length;
  }

  onSearchSubmit() {
    const trimmedKeyword = this.keyword.trim();
    if (trimmedKeyword) {
      this.router.navigate(['/products'], {
        queryParams: { keyword: trimmedKeyword }
      });
    }
  }

 
  
onKeywordChange(value: string) {
  this.keywordSubject.next(value);
}
  
}
