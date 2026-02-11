import io from 'socket.io-client';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

class SocketService {
  constructor() {
    this.socket = null;
    this.userId = null;
  }

  connect(userId) {
    if (this.socket?.connected && this.userId === userId) {
      return this.socket;
    }

    this.userId = userId;
    this.socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    });

    this.socket.on('connect', () => {
      console.log('Socket connected globally');
      // Join personal notification room
      this.socket.emit('join_user_room', { user_id: userId });
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  joinChat(adId, userId, otherUserId) {
    if (this.socket) {
      this.socket.emit('join_chat', {
        ad_id: adId,
        user1: userId,
        user2: otherUserId
      });
    }
  }

  leaveChat(adId) {
    if (this.socket) {
      this.socket.emit('leave_chat', { ad_id: adId });
    }
  }

  sendMessage(messageData) {
    if (this.socket) {
      this.socket.emit('send_message', messageData);
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new_message', callback);
    }
  }

  onNotification(callback) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  onMessagesSeen(callback) {
    if (this.socket) {
      this.socket.on('messages_seen', callback);
    }
  }

  offNewMessage() {
    if (this.socket) {
      this.socket.off('new_message');
    }
  }

  offNotification() {
    if (this.socket) {
      this.socket.off('notification');
    }
  }

  offMessagesSeen() {
    if (this.socket) {
      this.socket.off('messages_seen');
    }
  }
}

export default new SocketService();
