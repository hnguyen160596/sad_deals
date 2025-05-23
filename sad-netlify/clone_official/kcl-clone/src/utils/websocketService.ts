/**
 * WebSocket service for real-time updates
 * This handles connections to our WebSocket server for live updates
 */

// Import event tracking
import { trackEvent } from '../components/Analytics';

// WebSocket server URL
const WS_URL = import.meta.env.VITE_WEBSOCKET_URL || 'wss://api.salesaholics.com/ws';

// Event types for WebSocket messages
export enum WebSocketEventType {
  NEW_TELEGRAM_MESSAGE = 'new_telegram_message',
  DEAL_UPDATED = 'deal_updated',
  USER_ONLINE = 'user_online',
  ENGAGEMENT_UPDATE = 'engagement_update',
  CHAT_MESSAGE = 'chat_message',
  RECONNECT = 'reconnect',
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error'
}

// Basic message interface
export interface WebSocketMessage {
  type: WebSocketEventType;
  timestamp: number;
  data: any;
}

// WebSocket connection states
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting'
}

// Telegram Message DTO
export interface TelegramMessageDto {
  id: number;
  text: string;
  price?: string;
  title?: string;
  date: number;
  sender?: string;
  hasMedia: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'document';
  store?: string;
  category?: string;
  url?: string;
  viewCount?: number;
}

// Chat Message DTO
export interface ChatMessageDto {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
  avatar?: string;
  replyTo?: string;
  attachments?: {
    type: string;
    url: string;
  }[];
}

// WebSocket subscription interface
export interface WebSocketSubscription {
  id: string;
  eventType: WebSocketEventType;
  callback: (data: any) => void;
}

// Main WebSocket service class
class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000; // 3 seconds
  private subscriptions: WebSocketSubscription[] = [];
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private messageQueue: WebSocketMessage[] = [];
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private lastPingTime = 0;
  private userId: string | null = null;
  private authToken: string | null = null;

  /**
   * Initialize the WebSocket service
   * @param userId Optional user ID for authentication
   * @param authToken Optional auth token for authentication
   */
  public init(userId?: string, authToken?: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (userId) this.userId = userId;
      if (authToken) this.authToken = authToken;

      // If we're already connected or connecting, just resolve
      if (
        this.socket &&
        (this.connectionState === ConnectionState.CONNECTED ||
          this.connectionState === ConnectionState.CONNECTING)
      ) {
        resolve(true);
        return;
      }

      // Update connection state
      this.connectionState = ConnectionState.CONNECTING;
      this.notifySubscribers(WebSocketEventType.CONNECT, { connecting: true });

      try {
        // Create WebSocket connection
        this.socket = new WebSocket(WS_URL);

        // Connection opened
        this.socket.addEventListener('open', () => {
          this.onConnectionOpen();
          trackEvent('WebSocket', 'Connected');
          resolve(true);
        });

        // Connection closed
        this.socket.addEventListener('close', (event) => {
          this.onConnectionClosed(event);
          // If this is the first attempt, resolve with false
          if (this.reconnectAttempts === 0) {
            resolve(false);
          }
        });

        // Connection error
        this.socket.addEventListener('error', (error) => {
          this.onConnectionError(error);
          if (this.reconnectAttempts === 0) {
            resolve(false);
          }
        });

        // Receive message
        this.socket.addEventListener('message', (event) => {
          this.onMessageReceived(event);
        });
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        this.connectionState = ConnectionState.DISCONNECTED;
        trackEvent('WebSocket', 'Connection Error', (error as Error)?.message);
        resolve(false);
      }
    });
  }

  /**
   * Safely close the WebSocket connection
   */
  public disconnect(): void {
    if (this.socket) {
      try {
        // Stop heartbeat
        if (this.heartbeatInterval) {
          clearInterval(this.heartbeatInterval);
          this.heartbeatInterval = null;
        }

        // Close socket
        this.socket.close(1000, 'Client disconnected');
        this.socket = null;
        this.connectionState = ConnectionState.DISCONNECTED;
        this.notifySubscribers(WebSocketEventType.DISCONNECT, { reason: 'User disconnected' });
        trackEvent('WebSocket', 'Disconnected', 'User initiated');
      } catch (error) {
        console.error('Error disconnecting WebSocket:', error);
      }
    }
  }

  /**
   * Reconnect the WebSocket
   */
  public reconnect(): Promise<boolean> {
    this.disconnect();
    this.reconnectAttempts = 0;
    return this.init(this.userId || undefined, this.authToken || undefined);
  }

  /**
   * Subscribe to a specific event type
   */
  public subscribe(eventType: WebSocketEventType, callback: (data: any) => void): string {
    const id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.subscriptions.push({ id, eventType, callback });
    return id;
  }

  /**
   * Unsubscribe from events
   */
  public unsubscribe(subscriptionId: string): boolean {
    const initialLength = this.subscriptions.length;
    this.subscriptions = this.subscriptions.filter(sub => sub.id !== subscriptionId);
    return this.subscriptions.length < initialLength;
  }

  /**
   * Send a message through the WebSocket
   */
  public sendMessage(type: WebSocketEventType, data: any): boolean {
    if (!this.socket || this.connectionState !== ConnectionState.CONNECTED) {
      // Queue the message if we're not connected
      this.messageQueue.push({
        type,
        timestamp: Date.now(),
        data
      });
      return false;
    }

    try {
      const message: WebSocketMessage = {
        type,
        timestamp: Date.now(),
        data
      };

      this.socket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }

  /**
   * Send a chat message
   */
  public sendChatMessage(content: string, replyToId?: string): boolean {
    return this.sendMessage(WebSocketEventType.CHAT_MESSAGE, {
      content,
      replyToId,
      userId: this.userId,
      timestamp: Date.now()
    });
  }

  /**
   * Track engagement with a Telegram message
   */
  public trackEngagement(messageId: number, action: 'view' | 'click' | 'save' | 'share'): boolean {
    return this.sendMessage(WebSocketEventType.ENGAGEMENT_UPDATE, {
      messageId,
      action,
      timestamp: Date.now(),
      userId: this.userId
    });
  }

  /**
   * Get the current connection state
   */
  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Handle WebSocket open event
   */
  private onConnectionOpen(): void {
    this.connectionState = ConnectionState.CONNECTED;
    this.reconnectAttempts = 0;

    // Notify subscribers
    this.notifySubscribers(WebSocketEventType.CONNECT, { timestamp: Date.now() });

    // Send auth if we have credentials
    if (this.userId || this.authToken) {
      this.sendMessage(WebSocketEventType.CONNECT, {
        userId: this.userId,
        authToken: this.authToken
      });
    }

    // Process any queued messages
    this.processMessageQueue();

    // Start heartbeat
    this.startHeartbeat();
  }

  /**
   * Handle WebSocket close event
   */
  private onConnectionClosed(event: CloseEvent): void {
    // Stop heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Update state
    this.connectionState = ConnectionState.DISCONNECTED;

    // Notify subscribers
    this.notifySubscribers(WebSocketEventType.DISCONNECT, {
      code: event.code,
      reason: event.reason,
      timestamp: Date.now()
    });

    trackEvent('WebSocket', 'Disconnected', `Code: ${event.code}`);

    // Try to reconnect if not a normal closure
    if (event.code !== 1000 && event.code !== 1001) {
      this.attemptReconnect();
    }
  }

  /**
   * Handle WebSocket error event
   */
  private onConnectionError(error: Event): void {
    this.connectionState = ConnectionState.DISCONNECTED;

    // Notify subscribers
    this.notifySubscribers(WebSocketEventType.ERROR, {
      error: (error as ErrorEvent)?.message || 'Unknown WebSocket error',
      timestamp: Date.now()
    });

    trackEvent('WebSocket', 'Error', (error as ErrorEvent)?.message);

    // Attempt to reconnect
    this.attemptReconnect();
  }

  /**
   * Handle message received from WebSocket
   */
  private onMessageReceived(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as WebSocketMessage;

      // Notify subscribers of this event type
      this.notifySubscribers(message.type, message.data);

      // Handle pong messages for heartbeat
      if (message.type === 'pong') {
        const latency = Date.now() - this.lastPingTime;
        // May want to monitor latency for performance metrics
        console.debug(`WebSocket latency: ${latency}ms`);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error, event.data);
    }
  }

  /**
   * Attempt to reconnect the WebSocket
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`Failed to reconnect after ${this.maxReconnectAttempts} attempts`);
      trackEvent('WebSocket', 'Reconnect Failed', `Attempts: ${this.reconnectAttempts}`);
      return;
    }

    this.reconnectAttempts++;
    this.connectionState = ConnectionState.RECONNECTING;

    // Notify subscribers that we're trying to reconnect
    this.notifySubscribers(WebSocketEventType.RECONNECT, {
      attempt: this.reconnectAttempts,
      max: this.maxReconnectAttempts,
      timestamp: Date.now()
    });

    // Exponential backoff for retry
    const timeout = this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1);

    console.log(`Attempting to reconnect in ${timeout / 1000} seconds (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.init(this.userId || undefined, this.authToken || undefined).then(success => {
        if (success) {
          trackEvent('WebSocket', 'Reconnected', `Attempt: ${this.reconnectAttempts}`);
        }
      });
    }, timeout);
  }

  /**
   * Process any queued messages after reconnection
   */
  private processMessageQueue(): void {
    if (this.messageQueue.length === 0) return;

    console.log(`Processing ${this.messageQueue.length} queued messages`);

    // Process all queued messages
    for (const message of this.messageQueue) {
      this.sendMessage(message.type, message.data);
    }

    // Clear the queue
    this.messageQueue = [];
  }

  /**
   * Start the heartbeat to keep the connection alive
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.connectionState === ConnectionState.CONNECTED) {
        this.lastPingTime = Date.now();
        this.sendMessage('ping', { timestamp: this.lastPingTime });
      }
    }, 30000); // Send ping every 30 seconds
  }

  /**
   * Notify subscribers of a particular event
   */
  private notifySubscribers(eventType: WebSocketEventType, data: any): void {
    // Find all matching subscriptions
    const matchingSubscriptions = this.subscriptions.filter(
      sub => sub.eventType === eventType || sub.eventType === WebSocketEventType.ERROR
    );

    // Call each callback with the data
    matchingSubscriptions.forEach(sub => {
      try {
        sub.callback(data);
      } catch (error) {
        console.error(`Error in WebSocket subscription callback for ${eventType}:`, error);
      }
    });
  }
}

// Create and export a singleton instance
export const webSocketService = new WebSocketService();

export default webSocketService;
