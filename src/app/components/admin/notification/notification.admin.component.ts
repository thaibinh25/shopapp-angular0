import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../../service/notification.service';
import { UserService } from '../../../service/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-notification',
  imports: [CommonModule, FormsModule],
  templateUrl: './notification.admin.component.html',
  styleUrl: './notification.admin.component.scss'
})
export class NotificationAdminComponent implements OnInit {
  title = '';
  content = '';
  mode: 'role' | 'user' = 'role';
  selectedUserId: number | null = null;
  users: any[] = [];

  constructor(
    private notificationService: NotificationService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe(data => this.users = data);
  }

  sendNotification() {
    const payload: any = {
      title: this.title,
      content: this.content
    };

    if (this.mode === 'role') {
      payload.target_role = 'USER';
      this.notificationService.broadcastToAll(payload).subscribe({
        next: () => alert('Đã gửi thông báo đến tất cả khách hàng'),
        error: err => alert('Lỗi khi gửi broadcast')
      });
    } else {
      payload.userId = this.selectedUserId;
      this.notificationService.sendToUser(payload).subscribe({
        next: () => alert('Đã gửi thông báo riêng'),
        error: err => alert('Lỗi khi gửi cho người dùng')
      });
    }

    this.resetForm();
  }

  resetForm() {
    this.title = '';
    this.content = '';
    this.mode = 'role';
    this.selectedUserId = null;
  }
}