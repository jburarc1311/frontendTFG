import { Usuario } from './usuario';

export interface ChatMessage {
  _id: string;
  participant1: string;
  participant2: string;
  sender: string | Usuario;
  receiver?: string | Usuario;
  body: string;
  createdAt: string;
}
