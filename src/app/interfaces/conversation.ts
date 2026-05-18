import { Usuario } from './usuario';
import { ChatMessage } from './message';

export interface Conversation {
  _id: string;
  sender: string | Usuario;
  receiver: string | Usuario;
  messages: string[] | ChatMessage[];
  lastMessage: string | ChatMessage | null;
  lastMessageAt?: string | null;
  createdAt: string;
}
