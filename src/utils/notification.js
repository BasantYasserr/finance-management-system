import { WebSocketServer } from 'ws';  // Correct ES module import

class NotificationService {
  constructor() {
    this.wss = new WebSocketServer({ port: 8080 }); // Correct usage of WebSocketServer
    this.clients = new Map();
    
    this.wss.on('connection', this.handleConnection.bind(this));
  }

  handleConnection(ws, req) {
    const userId = this.getUserIdFromRequest(req);
    this.clients.set(userId, ws);

    ws.on('close', () => {
      this.clients.delete(userId);
    });
  }

  getUserIdFromRequest(req) {
    // Implementation of getting user ID from request
    return req.headers['user-id'];
  }

  async sendNotification({ type, recipientId, data }) {
    const ws = this.clients.get(recipientId);
    if (ws) {
      ws.send(JSON.stringify({ type, data }));
    }
    // Save notification to database
    await this.saveNotificationToDb({ type, recipientId, data });
  }

  async saveNotificationToDb({ type, recipientId, data }) {
    // Implementation of saving to database
  }
}

export const notificationService = new NotificationService();
