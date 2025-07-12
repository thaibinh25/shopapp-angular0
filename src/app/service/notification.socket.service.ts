import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationSocketService {
  private socket?: WebSocket;
  private heartbeatInterval?: any;

  connect(userId: string, onMessage?: (data: any) => void): void {
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      console.warn('⚠️ WebSocket is already open or connecting.');
      return;
    }

    // ✅ Sử dụng domain thật thay vì localhost
    this.socket = new WebSocket(`wss://shopapp-1-vmys.onrender.com/ws?userId=${userId}`);

    this.socket.onopen = () => {
      console.log('✅ WebSocket connection established.');
      this.startHeartbeat();
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📩 New message:', data);
        if (onMessage) {
          onMessage(data);
        }
      } catch (e) {
        console.error('❌ Error parsing message:', e);
      }
    };

    this.socket.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    this.socket.onclose = () => {
      console.warn('⚠️ WebSocket connection closed. Retrying in 5s...');
      this.stopHeartbeat();
      setTimeout(() => this.connect(userId, onMessage), 5000); // reconnect
    };
  }

  // ✅ Ping định kỳ giữ kết nối sống
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }));
        console.log('📡 Sent heartbeat ping');
      }
    }, 30000); // 30s
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }

  send(message: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      console.warn('⚠️ WebSocket is not connected.');
    }
  }

  disconnect(): void {
    this.stopHeartbeat();
    this.socket?.close();
  }
}



/*import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationSocketService {
  private socket?: WebSocket;

  connect(userId: string, onMessage?: (data: any) => void): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.warn('WebSocket already connected.');
      return;
    }

    this.socket = new WebSocket(`wss://https://shopapp-1-vmys.onrender.com/ws?userId=${userId}`);

    this.socket.onopen = () => {
      console.log('✅ WebSocket connection established.');
    };

    this.socket.onmessage = (event) => {
      const message = event.data;
      console.log('📩 New message:', message);
      // Ở đây bạn có thể xử lý hiển thị toast hoặc push vào NotificationService
      const data = JSON.parse(event.data);
      if (onMessage) {
        onMessage(data);
      }
    };

    this.socket.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    this.socket.onclose = () => {
      console.warn('⚠️ WebSocket connection closed.');
      setTimeout(() => this.connect(userId, onMessage), 5000); // retry sau 5s
    };
  }

  send(message: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      console.warn('WebSocket is not connected.');
    }
  }

  disconnect() {
    this.socket?.close();
  }
}

*/

