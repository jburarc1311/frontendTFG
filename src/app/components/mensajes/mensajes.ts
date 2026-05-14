import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ConversacionesService } from '../../services/conversaciones';
import { Conversation } from '../../interfaces/conversation';
import { ChatMessage } from '../../interfaces/message';
import { Usuario } from '../../interfaces/usuario';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-mensajes',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './mensajes.html',
  styleUrl: './mensajes.css',
})
export class Mensajes implements OnInit, OnDestroy {
  private conversacionesService = inject(ConversacionesService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private translate = inject(TranslateService);

  conversations: Conversation[] = [];
  filteredConversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  messages: ChatMessage[] = [];
  newMessage = '';
  searchTerm = '';
  loadingConversations = false;
  loadingMessages = false;
  error = '';
  targetConversationId: string | null = null;
  private autoRefreshTimer: ReturnType<typeof setInterval> | null = null;
  private autoRefreshInProgress = false;

  currentUser = this.authService.getUser() as (Usuario & { id?: string }) | null;

  ngOnInit(): void {
    this.targetConversationId = this.route.snapshot.queryParamMap.get('conversationId');
    this.loadConversations();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
      this.autoRefreshTimer = null;
    }
  }

  startAutoRefresh(): void {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
    }

    this.autoRefreshTimer = setInterval(() => {
      if (this.autoRefreshInProgress) return;
      this.autoRefreshInProgress = true;

      this.refreshConversationsSilently();

      if (this.selectedConversation?._id) {
        this.reloadConversation(this.selectedConversation._id, true);
      }

      this.autoRefreshInProgress = false;
    }, 3000);
  }

  refreshConversationsSilently(): void {
    this.conversacionesService.getConversations().subscribe({
      next: (response) => {
        const conversations = Array.isArray(response)
          ? response
          : Array.isArray((response as any)?.data)
            ? (response as any).data
            : [];

        this.conversations = conversations;
        this.applyFilter();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error refrescando conversaciones:', err);
      },
    });
  }

  loadConversations(): void {
    this.loadingConversations = true;
    this.error = '';

    this.conversacionesService
      .getConversations()
      .pipe(
        finalize(() => {
          this.loadingConversations = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (response) => {
          const conversations = Array.isArray(response)
            ? response
            : Array.isArray((response as any)?.data)
              ? (response as any).data
              : [];

          this.conversations = conversations;
          this.applyFilter();

          if (this.targetConversationId) {
            const targetConversation = this.filteredConversations.find(
              (conversation) => conversation._id === this.targetConversationId,
            );

            if (targetConversation) {
              this.selectConversation(targetConversation);
              this.targetConversationId = null;
              return;
            }
          }

          if (!this.selectedConversation && this.filteredConversations.length > 0) {
            this.selectConversation(this.filteredConversations[0]);
          }

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error cargando conversaciones:', err);
          this.error = this.translate.instant('messages.errors.loadConversations');
          this.cdr.detectChanges();
        },
      });
  }

  applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      this.filteredConversations = [...this.conversations];
      return;
    }

    this.filteredConversations = this.conversations.filter((conversation) => {
      const partner = this.getConversationPartner(conversation);
      const partnerName = this.getEntityName(partner).toLowerCase();
      const preview = this.getLastMessageText(conversation).toLowerCase();

      return partnerName.includes(term) || preview.includes(term);
    });
  }

  onSearchChange(): void {
    this.applyFilter();
    this.cdr.detectChanges();
  }

  selectConversation(conversation: Conversation): void {
    this.selectedConversation = conversation;
    this.loadingMessages = true;
    this.error = '';

    this.conversacionesService
      .getConversation(conversation._id)
      .pipe(
        finalize(() => {
          this.loadingMessages = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (detail) => {
          this.selectedConversation = detail;
          this.messages = Array.isArray(detail.messages) ? (detail.messages as ChatMessage[]) : [];
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error cargando conversación:', err);
          this.error = this.translate.instant('messages.errors.loadConversation');
          this.cdr.detectChanges();
        },
      });
  }

  sendMessage(): void {
    if (!this.selectedConversation || !this.newMessage.trim()) {
      return;
    }

    const selectedConversationId = this.selectedConversation._id;

    this.conversacionesService
      .sendMessage(selectedConversationId, this.newMessage.trim())
      .subscribe({
        next: () => {
          this.newMessage = '';
          this.loadConversations();

          this.reloadConversation(selectedConversationId, true);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error enviando mensaje:', err);
          this.error = this.translate.instant('messages.errors.send');
          alert(this.error);
          this.cdr.detectChanges();
        },
      });
  }

  trackByConversationId(_: number, conversation: Conversation): string {
    return conversation._id;
  }

  trackByMessageId(_: number, message: ChatMessage): string {
    return message._id;
  }

  getConversationPartner(conversation: Conversation): Usuario | null {
    const currentId = this.getCurrentUserId();
    const participant1 = this.getEntityId(conversation.participant1);
    const participant2 = this.getEntityId(conversation.participant2);

    if (currentId && participant1 === currentId) {
      return this.isUsuario(conversation.participant2) ? conversation.participant2 : null;
    }

    return this.isUsuario(conversation.participant1) ? conversation.participant1 : null;
  }

  getConversationTitle(conversation: Conversation): string {
    const partner = this.getConversationPartner(conversation);
    return partner ? partner.name : this.translate.instant('messages.conversation');
  }

  getConversationPhoto(conversation: Conversation): string {
    const partner = this.getConversationPartner(conversation);
    return partner?.photo || '';
  }

  getInitials(conversation: Conversation): string {
    const partner = this.getConversationPartner(conversation);
    const name = partner?.name || this.translate.instant('messages.chat');
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  }

  getLastMessageText(conversation: Conversation): string {
    const lastMessage = conversation.lastMessage;

    if (lastMessage && typeof lastMessage === 'object' && 'body' in lastMessage) {
      return lastMessage.body || '';
    }

    const lastFromList =
      Array.isArray(conversation.messages) && conversation.messages.length > 0
        ? conversation.messages[conversation.messages.length - 1]
        : null;

    if (lastFromList && typeof lastFromList === 'object' && 'body' in lastFromList) {
      return lastFromList.body || '';
    }

    return this.translate.instant('messages.noMessages');
  }

  getConversationTime(conversation: Conversation): string {
    const lastMessage = conversation.lastMessage;

    if (lastMessage && typeof lastMessage === 'object' && 'createdAt' in lastMessage) {
      return this.formatTime(String(lastMessage.createdAt));
    }

    return this.formatTime(conversation.createdAt);
  }

  getMessageAuthor(message: ChatMessage): string {
    return this.getEntityName(message.sender);
  }

  isOwnMessage(message: ChatMessage): boolean {
    const currentId = this.getCurrentUserId();
    return !!currentId && this.getEntityId(message.sender) === currentId;
  }

  getCurrentUserId(): string {
    if (!this.currentUser) return '';
    return this.currentUser._id || this.currentUser.id || '';
  }

  getEntityId(entity: string | Usuario | undefined | null): string {
    if (!entity) return '';
    return typeof entity === 'string' ? entity : entity._id;
  }

  getEntityName(entity: string | Usuario | undefined | null): string {
    if (!entity) return this.translate.instant('messages.user');
    return typeof entity === 'string' ? this.translate.instant('messages.user') : entity.name;
  }

  getEntityPhoto(entity: string | Usuario | undefined | null): string {
    if (!entity || typeof entity === 'string') return '';
    return entity.photo || '';
  }

  formatTime(dateValue: string): string {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  verPerfil(): void {
    if (!this.selectedConversation) {
      return;
    }

    const partner = this.getConversationPartner(this.selectedConversation);

    if (!partner?._id) {
      alert(this.translate.instant('messages.errors.openProfile'));
      return;
    }

    this.router.navigate(['/detallesusurio', partner._id]);
  }

  reloadConversation(conversationId: string, silent = false): void {
    if (!silent) {
      this.loadingMessages = true;
    }

    this.conversacionesService.getConversation(conversationId).subscribe({
      next: (detail) => {
        this.selectedConversation = detail;
        this.messages = Array.isArray(detail.messages) ? (detail.messages as ChatMessage[]) : [];
        this.loadingMessages = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error recargando conversación:', err);
        this.loadingMessages = false;
        this.cdr.detectChanges();
      },
    });
  }

  isUsuario(entity: string | Usuario | undefined | null): entity is Usuario {
    return !!entity && typeof entity !== 'string' && 'name' in entity;
  }
}
