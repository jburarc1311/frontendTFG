import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom} from 'rxjs'; //Convierte el Observable en una Promise para poder usar await
import { loadStripe, Stripe } from '@stripe/stripe-js';

@Injectable({
  providedIn: 'root',
})
export class StripeService {

   private stripe: Stripe | null = null;
   private apiUrl = 'http://localhost:4000';
   private publishableKey= 'pk_test_51TGz3CJCuWqSW0Xx11QRR8CChy3tTrTShJo6SYWlOTmSHIUWzEfDFJBnZxenzwtziUww12nZCcCiuTr3QATILrEn00soviazoj';

   constructor(private http: HttpClient) {}

   async getStripe(): Promise<Stripe | null> { //Esto evita cargar el SDK de Stripe múltiples veces, lo que sería lento e ineficiente. loadStripe() descarga el script de Stripe desde internet, por eso es async
    if (!this.stripe) {
      this.stripe = await loadStripe(this.publishableKey);
    }
    return this.stripe;
  }

  crearPaymentIntent(amount: number) { //Recibe un número — el monto que el usuario quiere donar
      return firstValueFrom( //Devuelve una Promise al componente que llame este método, para que pueda usar await y esperar la respuesta.
      this.http.post<{ clientSecret: string }>(
        `${this.apiUrl}/api/pagos/crear-intent`,
        { amount }
      )
    );
  }




  }
