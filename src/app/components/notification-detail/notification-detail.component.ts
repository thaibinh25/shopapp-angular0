import { Component, OnInit } from '@angular/core';
import { UserNotification } from '../../models/notification';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../service/notification.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-notification-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-detail.component.html',
  styleUrl: './notification-detail.component.scss'
})
export class NotificationDetailComponent implements OnInit {


  notification?: UserNotification;

  constructor(
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
   // Lắng nghe mỗi khi id thay đổi
   this.route.paramMap.subscribe(params => {
    const id = Number(params.get('id'));
    if (id) {
      this.loadNotification(id);
    }
  });
  }

  loadNotification(id: number){
    this.notificationService.getNotificationById(+id).subscribe({
      next: (data) => this.notification = data,
      error: (err) => console.error('Error loading notification:', err)
    });
  }
  
}
