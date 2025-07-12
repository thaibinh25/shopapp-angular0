import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserNotification } from '../models/notification';
import { environment } from '../../environments/environment';



@Injectable({
  providedIn: 'root',
})
export class NotificationService {
 
  private apiUrl  = `${environment.apiBaseUrl}/notifications`;

  constructor(private http: HttpClient) {}

  // Lấy danh sách thông báo của người dùng hiện tại
  getNotifications(userId: number): Observable<UserNotification[]> {
    return this.http.get<UserNotification[]>(`${this.apiUrl}?userId=${userId}`);
  }

  // Đánh dấu một thô ng báo là đãđọc
  markAsRead(notificationId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${notificationId}/read`, {responseType: 'text' as 'json'});
  }

  // (Tùy chọn) Gửi thông báo mới – nếu bạn có quyền
  sendNotification(notification: {
    title: string;
    content: string;
    userId: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}`, notification);
  }

  getNotificationById(id: number) {
    return this.http.get<UserNotification>(`${this.apiUrl}/${id}`);
  }


  broadcastToAll(payload: any) {
    return this.http.post(`${this.apiUrl}/broadcast`, payload);
  }

  sendToUser(payload: any) {
    return this.http.post(`${this.apiUrl}/send`, payload);
  }
  
}
