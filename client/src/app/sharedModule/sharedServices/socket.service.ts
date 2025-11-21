import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { Subject, Observable } from 'rxjs';
import {
  MessengerMessageDTO,
  MessengerJoinGroupDTO,
  MessengerJoinedDTO,
  MessengerJoinRejectedDTO,
  MessengerErrorDTO,
  MessengerTypingStartDTO,
  MessengerTypingStopDTO,
  GroupCreatedDTO,
  JoinRequestDTO,
  JoinApprovedDTO,
  MemberJoinedDTO,
  MembershipUpdatedDTO,
  ApprovalStatusChangedDTO,
  AdminUserStatusChangedDTO,
  MessengerSendMessageResponseDTO,
} from './socket.dto';

@Injectable({
  providedIn: 'root',
})
export class SocketService implements OnDestroy {
  private socket: Socket | null = null;
  private connected = false;
  private connectionSubject = new Subject<boolean>();

  constructor() {
    // Don't initialize in constructor - wait for token to be available
    // Initialize will be called lazily when needed
  }

  private initialize(): void {
    // Don't initialize if already connected or connecting
    if (this.socket?.connected || this.socket?.active) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Socket.IO: No token available, cannot connect');
      return;
    }

    // Disconnect existing socket if any
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.socket = io(environment.baseUrl, {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      this.connected = true;
      this.connectionSubject.next(true);
      console.log('Socket.IO connected');
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      this.connectionSubject.next(false);
      console.log('Socket.IO disconnected');
    });

    this.socket.on('connect_error', (error) => {
      // Only log if it's not just a missing token (which is expected before login)
      if (error.message !== 'Unauthorized' || this.socket?.active) {
        console.error('Socket.IO connection error:', error);
      }
      this.connected = false;
      this.connectionSubject.next(false);
    });
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.connected && this.socket?.connected === true;
  }

  onConnectionChange(): Observable<boolean> {
    return this.connectionSubject.asObservable();
  }

  // Ensure socket is initialized before use
  private ensureInitialized(): void {
    if (!this.socket && localStorage.getItem('token')) {
      this.initialize();
    }
  }

  // Messenger events
  onMessengerNewMessage(callback: (message: MessengerMessageDTO) => void): void {
    this.ensureInitialized();
    this.socket?.on('messenger:newMessage', callback);
  }

  onMessengerError(callback: (error: MessengerErrorDTO) => void): void {
    this.ensureInitialized();
    this.socket?.on('messenger:error', callback);
  }

  onMessengerJoined(callback: (data: MessengerJoinedDTO) => void): void {
    this.ensureInitialized();
    this.socket?.on('messenger:joined', callback);
  }

  onMessengerJoinRejected(callback: (data: MessengerJoinRejectedDTO) => void): void {
    this.ensureInitialized();
    this.socket?.on('messenger:joinRejected', callback);
  }

  // Typing indicator events
  onMessengerTypingStart(callback: (data: MessengerTypingStartDTO) => void): void {
    this.ensureInitialized();
    this.socket?.on('messenger:typingStart', callback);
  }

  onMessengerTypingStop(callback: (data: MessengerTypingStopDTO) => void): void {
    this.ensureInitialized();
    this.socket?.on('messenger:typingStop', callback);
  }

  // Approval events
  onApprovalStatusChanged(callback: (data: ApprovalStatusChangedDTO) => void): void {
    this.ensureInitialized();
    this.socket?.on('approval:statusChanged', callback);
  }

  onAdminUserStatusChanged(callback: (data: AdminUserStatusChangedDTO) => void): void {
    this.ensureInitialized();
    this.socket?.on('admin:userStatusChanged', callback);
  }

  // Group events
  onMessengerGroupCreated(callback: (data: GroupCreatedDTO) => void): void {
    this.ensureInitialized();
    this.socket?.on('messenger:groupCreated', callback);
  }

  onMessengerJoinRequest(callback: (data: JoinRequestDTO) => void): void {
    this.ensureInitialized();
    this.socket?.on('messenger:joinRequest', callback);
  }

  onMessengerJoinApproved(callback: (data: JoinApprovedDTO) => void): void {
    this.ensureInitialized();
    this.socket?.on('messenger:joinApproved', callback);
  }
  
  onMessengerMemberJoined(callback: (data: MemberJoinedDTO) => void): void {
    this.ensureInitialized();
    this.socket?.on('messenger:memberJoined', callback);
  }

  onMessengerMembershipUpdated(callback: (data: MembershipUpdatedDTO) => void): void {
    this.ensureInitialized();
    this.socket?.on('messenger:membershipUpdated', callback);
  }

  // Messenger emit methods
  emitMessengerJoinGroup(groupId: number): void {
    this.ensureInitialized();
    this.socket?.emit('messenger:joinGroup', { groupId });
  }

  emitMessengerLeaveGroup(groupId: number): void {
    this.ensureInitialized();
    this.socket?.emit('messenger:leaveGroup', { groupId });
  }

  emitMessengerSendMessage(
    groupId: number,
    content: string,
    callback?: (response: MessengerSendMessageResponseDTO) => void
  ): void {
    this.ensureInitialized();
    this.socket?.emit('messenger:sendMessage', { groupId, content }, callback);
  }

  emitMessengerTypingStart(groupId: number): void {
    this.ensureInitialized();
    this.socket?.emit('messenger:typingStart', { groupId });
  }

  emitMessengerTypingStop(groupId: number): void {
    this.ensureInitialized();
    this.socket?.emit('messenger:typingStop', { groupId });
  }

  // Remove event listeners
  off(event: string, callback?: (...args: any[]) => void): void {
    this.socket?.off(event, callback);
  }

  // Reconnect if needed
  reconnect(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Socket.IO: Cannot reconnect, no token available');
      return;
    }

    if (!this.connected && this.socket) {
      this.socket.connect();
    } else if (!this.socket) {
      this.initialize();
    }
  }

  // Public method to initialize connection (call after login)
  connect(): void {
    if (!this.socket) {
      this.initialize();
    } else if (!this.connected) {
      this.socket.connect();
    }
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectionSubject.complete();
  }
}

