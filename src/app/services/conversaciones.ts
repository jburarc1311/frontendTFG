import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Conversation } from '../interfaces/conversation';
import { ChatMessage } from '../interfaces/message';

@Injectable({
  providedIn: 'root',
})
export class ConversacionesService {
  private apiUrl = 'https://backendtfg-production-936a.up.railway.app/api';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = sessionStorage.getItem('accessToken');
    return {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    };
  }

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations`, this.getHeaders());
  }

  getConversation(id: string): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.apiUrl}/conversations/${id}`, this.getHeaders());
  }

  createOrGetConversation(sender: string, receiver: string): Observable<Conversation> {
    return this.http.post<Conversation>(
      `${this.apiUrl}/conversations`,
      { sender, receiver },
      this.getHeaders(),
    );
  }

  sendMessage(conversationId: string, body: string): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(
      `${this.apiUrl}/conversations/${conversationId}/messages`,
      { body },
      this.getHeaders(),
    );
  }

  deleteMessage(conversationId: string, messageId: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/conversations/${conversationId}/messages/${messageId}`,
      this.getHeaders(),
    );
  }
}
