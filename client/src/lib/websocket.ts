// WebSocket client for real-time communication

type MessageHandler = (data: any) => void;
type ConnectionHandler = () => void;

interface SocketMessage {
  type: string;
  message?: string;
  data?: any;
}

class WebSocketClient {
  private socket: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private onConnectHandlers: ConnectionHandler[] = [];
  private onDisconnectHandlers: ConnectionHandler[] = [];
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.connect();
  }

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return;
    }

    try {
      // Determine the WebSocket URL based on the current page URL
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log(`Connecting to WebSocket at ${wsUrl}`);
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
      this.attemptReconnect();
    }
  }

  private handleOpen() {
    console.log("WebSocket connection established");
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.onConnectHandlers.forEach(handler => handler());
  }

  private handleMessage(event: MessageEvent) {
    try {
      const message = JSON.parse(event.data) as SocketMessage;
      console.log("WebSocket message received:", message);

      // Call handlers for this message type
      if (message.type && this.messageHandlers.has(message.type)) {
        const handlers = this.messageHandlers.get(message.type) || [];
        handlers.forEach(handler => handler(message));
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  }

  private handleClose(event: CloseEvent) {
    console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
    this.isConnected = false;
    this.onDisconnectHandlers.forEach(handler => handler());
    this.attemptReconnect();
  }

  private handleError(event: Event) {
    console.error("WebSocket error:", event);
  }

  private attemptReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      this.reconnectTimer = setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error("Maximum reconnection attempts reached");
    }
  }

  send(type: string, data: any = {}) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn("Cannot send message, WebSocket is not connected");
      return false;
    }

    try {
      const message: SocketMessage = {
        type,
        data
      };
      this.socket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error("Error sending WebSocket message:", error);
      return false;
    }
  }

  on(type: string, handler: MessageHandler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)!.push(handler);
  }

  off(type: string, handler: MessageHandler) {
    if (!this.messageHandlers.has(type)) return;
    
    const handlers = this.messageHandlers.get(type)!;
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  onConnect(handler: ConnectionHandler) {
    this.onConnectHandlers.push(handler);
    // If already connected, call the handler immediately
    if (this.isConnected) {
      handler();
    }
  }

  onDisconnect(handler: ConnectionHandler) {
    this.onDisconnectHandlers.push(handler);
  }

  removeConnectHandler(handler: ConnectionHandler) {
    const index = this.onConnectHandlers.indexOf(handler);
    if (index !== -1) {
      this.onConnectHandlers.splice(index, 1);
    }
  }

  removeDisconnectHandler(handler: ConnectionHandler) {
    const index = this.onDisconnectHandlers.indexOf(handler);
    if (index !== -1) {
      this.onDisconnectHandlers.splice(index, 1);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

// Create a singleton instance
export const websocket = new WebSocketClient();