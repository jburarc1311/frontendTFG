import { Usuario } from './usuario';
import { ChatMessage } from './message';

export interface Conversation {
  _id: string;
  participant1: string | Usuario;
  participant2: string | Usuario;
  messages: string[] | ChatMessage[];
  lastMessage: string | ChatMessage | null;
  lastMessageAt?: string | null;
  createdAt: string;
}
