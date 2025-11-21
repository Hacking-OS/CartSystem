import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AlertService, AlertType } from '../../../sharedModule/alertServices/alert.service';
import { MessengerService } from '../../services/messenger.service';
import { SocketService } from '../../../sharedModule/sharedServices/socket.service';
import {
  MessengerMessageDTO,
  MessengerGroupDTO,
  GroupMembershipDTO,
  MessengerTypingStartDTO,
  MessengerTypingStopDTO,
  MessengerJoinedDTO,
  MessengerJoinRejectedDTO,
  MessengerErrorDTO,
  GroupCreatedDTO,
  JoinRequestDTO,
  JoinApprovedDTO,
  MemberJoinedDTO,
  MembershipUpdatedDTO,
  MessengerSendMessageResponseDTO,
} from '../../../sharedModule/sharedServices/socket.dto';

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.css'],
})
export class MessengerComponent implements OnInit, OnDestroy {
  groups: MessengerGroupDTO[] = [];
  selectedGroup: MessengerGroupDTO | null = null;
  messages: MessengerMessageDTO[] = [];
  userId = Number(localStorage.getItem('userId') || 0);
  newMessage = '';
  loadingMessages = false;
  creatingGroup = false;
  createGroupModel = {
    name: '',
    description: '',
    requiresApproval: true,
  };
  typingUsers: Set<number> = new Set();
  typingTimeout: any = null;
  private typingDebounceTime = 3000; // 3 seconds

  constructor(
    private messengerService: MessengerService,
    private alertService: AlertService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.fetchGroups();
    this.initializeSocket();
  }

  ngOnDestroy(): void {
    // Clean up socket listeners
    this.socketService.off('messenger:newMessage');
    this.socketService.off('messenger:error');
    this.socketService.off('messenger:joined');
    this.socketService.off('messenger:joinRejected');
    this.socketService.off('messenger:typingStart');
    this.socketService.off('messenger:typingStop');
    this.socketService.off('messenger:groupCreated');
    this.socketService.off('messenger:joinRequest');
    this.socketService.off('messenger:joinApproved');
    this.socketService.off('messenger:memberJoined');
    this.socketService.off('messenger:membershipUpdated');
    
    // Stop typing when leaving
    if (this.selectedGroup) {
      this.socketService.emitMessengerTypingStop(this.selectedGroup.id);
    }
    
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  private initializeSocket(): void {
    // Listen for new messages
    this.socketService.onMessengerNewMessage((payload: MessengerMessageDTO) => {
      if (payload.groupId === this.selectedGroup?.id) {
        this.messages = [...this.messages, payload];
      }
    });

    // Listen for errors
    this.socketService.onMessengerError((payload: MessengerErrorDTO) => {
      this.alertService.showAlert(payload?.message || 'Messenger error', AlertType.Error);
    });

    // Listen for join confirmations
    this.socketService.onMessengerJoined((data: MessengerJoinedDTO) => {
      if (data.groupId === this.selectedGroup?.id) {
        // Successfully joined the group room
      }
    });

    // Listen for join rejections
    this.socketService.onMessengerJoinRejected((data: MessengerJoinRejectedDTO) => {
      this.alertService.showAlert(data.reason, AlertType.Warning);
    });

    // Listen for typing indicators
    this.socketService.onMessengerTypingStart((data: MessengerTypingStartDTO) => {
      if (data.groupId === this.selectedGroup?.id && data.userId !== this.userId) {
        this.typingUsers.add(data.userId);
      }
    });

    this.socketService.onMessengerTypingStop((data: MessengerTypingStopDTO) => {
      if (data.groupId === this.selectedGroup?.id) {
        this.typingUsers.delete(data.userId);
      }
    });

    // Listen for real-time group updates
    this.socketService.onMessengerGroupCreated((data: GroupCreatedDTO) => {
      // Refresh groups list when a new group is created
      this.fetchGroups();
      this.alertService.showAlert(`New group "${data.group.name}" created by ${data.owner.name}`, AlertType.Info);
    });

    this.socketService.onMessengerJoinRequest((data: JoinRequestDTO) => {
      // If we're viewing this group, refresh to show new pending request
      if (this.selectedGroup?.id === data.groupId) {
        this.fetchGroups();
      }
      this.alertService.showAlert(`${data.requester.name} requested to join "${data.groupName}"`, AlertType.Info);
    });

    this.socketService.onMessengerJoinApproved((data: JoinApprovedDTO) => {
      // Refresh groups to update membership status
      this.fetchGroups();
      if (this.selectedGroup?.id === data.groupId) {
        // If viewing this group, reload messages and join socket room
        this.loadMessages(data.groupId);
        this.ensureSocketRoom(data.groupId);
      }
      this.alertService.showAlert(`You've been approved to join "${data.groupName}"!`, AlertType.Success);
    });

    this.socketService.onMessengerMemberJoined((data: MemberJoinedDTO) => {
      // Update member count for the group if we're viewing it
      if (this.selectedGroup?.id === data.groupId) {
        this.fetchGroups();
      }
    });

    this.socketService.onMessengerMembershipUpdated((data: MembershipUpdatedDTO) => {
      // Refresh groups to update pending requests list
      if (this.selectedGroup?.id === data.groupId) {
        this.fetchGroups();
      }
    });
  }

  private ensureSocketRoom(groupId: number): void {
    if (!this.socketService.isConnected()) {
      this.socketService.reconnect();
      return;
    }
    this.socketService.emitMessengerJoinGroup(groupId);
  }

  fetchGroups(): void {
    this.messengerService.getGroups<MessengerGroupDTO[]>().subscribe({
      next: (groups: MessengerGroupDTO[]) => {
        this.groups = groups;
        if (this.selectedGroup) {
          this.selectedGroup =
            groups.find((group) => group.id === this.selectedGroup?.id) ?? null;
        }
      },
      error: () => {
        this.alertService.showAlert('Unable to load groups right now.', AlertType.Error);
      },
    });
  }

  selectGroup(group: MessengerGroupDTO): void {
    // Leave previous group room
    if (this.selectedGroup) {
      this.socketService.emitMessengerLeaveGroup(this.selectedGroup.id);
      this.socketService.emitMessengerTypingStop(this.selectedGroup.id);
    }
    
    this.selectedGroup = group;
    this.typingUsers.clear();
    
    if (this.canPost(group)) {
      this.loadMessages(group.id);
      this.ensureSocketRoom(group.id);
    } else {
      this.messages = [];
    }
  }

  canPost(group: MessengerGroupDTO | null): boolean {
    if (!group) {
      return false;
    }
    if (group.ownerId === this.userId) {
      return true;
    }
    return group.membership?.status === 'approved';
  }

  loadMessages(groupId: number): void {
    this.loadingMessages = true;
    this.messengerService.loadMessages<MessengerMessageDTO[]>(groupId).subscribe({
      next: (messages: MessengerMessageDTO[]) => {
        this.messages = messages;
        this.loadingMessages = false;
      },
      error: (error: any) => {
        this.loadingMessages = false;
        const errorMessage = error?.error?.message || error?.message || 'Unable to load messages.';
        this.alertService.showAlert(errorMessage, AlertType.Error);
        console.error('Error loading messages:', error);
      },
    });
  }

  sendMessage(form: NgForm): void {
    if (!this.selectedGroup) {
      return;
    }

    // Check if user can post to this group
    if (!this.canPost(this.selectedGroup)) {
      this.alertService.showAlert('You need to be approved to send messages in this group.', AlertType.Warning);
      form.resetForm();
      return;
    }

    const trimmed = this.newMessage.trim();
    if (!trimmed.length) {
      return;
    }

    // Stop typing indicator when sending
    this.socketService.emitMessengerTypingStop(this.selectedGroup.id);
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }

    // ALWAYS use Socket.IO - no HTTP fallback
    if (!this.socketService.isConnected()) {
      this.alertService.showAlert('Connection lost. Reconnecting...', AlertType.Warning);
      this.socketService.reconnect();
      // Try again after a short delay
      setTimeout(() => {
        if (this.socketService.isConnected()) {
          this.socketService.emitMessengerSendMessage(
            this.selectedGroup!.id,
            trimmed,
            (response: any) => {
              if (!response?.success) {
                this.alertService.showAlert(response?.message || 'Unable to send message.', AlertType.Error);
              }
            }
          );
        } else {
          this.alertService.showAlert('Unable to connect. Please refresh the page.', AlertType.Error);
        }
      }, 1000);
      form.resetForm();
      return;
    }

      this.socketService.emitMessengerSendMessage(
        this.selectedGroup.id,
        trimmed,
        (response: MessengerSendMessageResponseDTO) => {
        if (!response?.success) {
          this.alertService.showAlert('Unable to send message.', AlertType.Error);
        }
      }
    );
    form.resetForm();
  }

  onMessageInput(): void {
    if (!this.selectedGroup || !this.canPost(this.selectedGroup)) {
      return;
    }

    // Clear existing timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    // Emit typing start
    if (this.socketService.isConnected()) {
      this.socketService.emitMessengerTypingStart(this.selectedGroup.id);
    }

    // Set timeout to stop typing after debounce
    this.typingTimeout = setTimeout(() => {
      if (this.socketService.isConnected()) {
        this.socketService.emitMessengerTypingStop(this.selectedGroup!.id);
      }
      this.typingTimeout = null;
    }, this.typingDebounceTime);
  }

  getTypingUsersNames(): string {
    if (this.typingUsers.size === 0) {
      return '';
    }
    // In a real app, you'd fetch user names from a service
    // For now, just show count
    const count = this.typingUsers.size;
    return count === 1 ? 'Someone is typing...' : `${count} people are typing...`;
  }

  requestJoin(group: MessengerGroupDTO): void {
    this.messengerService.requestJoin(group.id).subscribe({
      next: (response: any) => {
        this.alertService.showAlert(response.message, AlertType.Info);
        this.fetchGroups();
      },
      error: () => {
        this.alertService.showAlert('Unable to submit join request.', AlertType.Error);
      },
    });
  }

  createGroup(form: NgForm): void {
    this.creatingGroup = true;
    this.messengerService.createGroup<MessengerGroupDTO>(this.createGroupModel).subscribe({
      next: () => {
        this.creatingGroup = false;
        this.alertService.showAlert('Group created successfully!', AlertType.Success);
        form.resetForm({ requiresApproval: true });
        this.fetchGroups();
      },
      error: () => {
        this.creatingGroup = false;
        this.alertService.showAlert('Unable to create group.', AlertType.Error);
      },
    });
  }

  approveMember(member: GroupMembershipDTO, action: 'approve' | 'reject'): void {
    if (!this.selectedGroup) {
      return;
    }
    this.messengerService
      .reviewMembership<MessengerGroupDTO>(this.selectedGroup.id, member.id, action)
      .subscribe({
        next: () => {
          const message =
            action === 'approve' ? 'Member approved successfully.' : 'Member rejected.';
          this.alertService.showAlert(message, AlertType.Success);
          this.fetchGroups();
          if (action === 'approve') {
            this.loadMessages(this.selectedGroup!.id);
          }
        },
        error: () => {
          this.alertService.showAlert('Unable to update membership.', AlertType.Error);
        },
      });
  }

  deleteMessage(message: MessengerMessageDTO): void {
    if (!this.selectedGroup) {
      return;
    }
    this.messengerService.deleteMessage(this.selectedGroup.id, message.id).subscribe({
      next: () => {
        this.messages = this.messages.filter((item) => item.id !== message.id);
        this.alertService.showAlert('Message deleted.', AlertType.Info);
      },
      error: () => {
        this.alertService.showAlert('Unable to delete message.', AlertType.Error);
      },
    });
  }
}
