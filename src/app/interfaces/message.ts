import { Usuario } from './usuario';

export interface ChatMessage {
  _id: string;
  sender: string | Usuario;
  receiver: string | Usuario;
  body: string;
  createdAt: string;
}
