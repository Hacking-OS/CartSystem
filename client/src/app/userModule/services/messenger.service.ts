import { Injectable } from '@angular/core';
import { ApiService } from '../../sharedModule/sharedServices/api.service';
import { Observable } from 'rxjs';
import { MessengerMessageDTO, MessengerGroupDTO } from '../../sharedModule/sharedServices/socket.dto';

@Injectable({
  providedIn: 'root',
})
export class MessengerService {
  constructor(private api: ApiService) {}

  getGroups<T>(): Observable<T> {
    return this.api.get<T>('/message/groups');
  }

  createGroup<T>(payload: { name: string; description?: string; requiresApproval?: boolean }): Observable<T> {
    return this.api.post<T>('/message/groups', payload);
  }

  requestJoin<T>(groupId: number): Observable<T> {
    return this.api.post<T>(`/message/groups/${groupId}/join`, {});
  }

  reviewMembership<T>(groupId: number, memberId: number, action: 'approve' | 'reject'): Observable<T> {
    return this.api.patch<T>(`/message/groups/${groupId}/members/${memberId}`, { action });
  }

  loadMessages<T>(groupId: number): Observable<T> {
    return this.api.get<T>(`/message/groups/${groupId}/messages`);
  }

  sendMessage<T>(groupId: number, message: string): Observable<T> {
    return this.api.post<T>(`/message/groups/${groupId}/messages`, { message });
  }

  deleteMessage<T>(groupId: number, messageId: string): Observable<T> {
    return this.api.delete<T>(`/message/groups/${groupId}/messages/${messageId}`);
  }
}
