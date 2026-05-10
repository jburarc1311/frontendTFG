import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { StripeService } from '../../services/stripe';
import { Stripe, StripeElements } from '@stripe/stripe-js';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-stripe',
  imports: [],
  templateUrl: './stripe.html',
  styleUrl: './stripe.css',
})
export class StripeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('paymentElement', { static: false }) paymentElementRef!: ElementRef;

  montosPredefinidos = [1, 5, 10, 25, 50];
  montoSeleccionado = 10;

  errorMessage = '';
  exitoso = false;

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private paymentElementMounted = false;
  private currentClientSecret: string | null = null;
  private crearPaymentIntentInProgress = false;

  private stripeService = inject(StripeService);

  async ngOnInit() {
    try {
      this.stripe = await this.stripeService.getStripe();
      if (this.montoSeleccionado <= 0) {
        throw new Error('El monto debe ser mayor a 0');
      }
      await this.crearNuevoPaymentIntent();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      this.errorMessage = `Error al cargar el formulario de pago: ${errorMsg}`;
      console.error('Error en ngOnInit:', error);
    }
  }

  ngAfterViewInit() {
    // El montaje real ocurre en montarPaymentElement()
  }

  ngOnDestroy() {
    this.elements = null;
    this.stripe = null;
  }

  private async crearNuevoPaymentIntent() {
    if (this.crearPaymentIntentInProgress) {
      console.warn('createPaymentIntent ya está en progreso');
      return;
    }

    this.crearPaymentIntentInProgress = true;

    try {
      const { clientSecret } = await this.stripeService.crearPaymentIntent(this.montoSeleccionado);
      this.currentClientSecret = clientSecret;

      if (this.elements) {
        this.paymentElementMounted = false;
      }

      if (!this.stripe) throw new Error('Stripe no está inicializado');

      console.warn('El clientSecret expira en 24 horas. Si esperas mucho, recarga la página.');

      this.elements = this.stripe.elements({ clientSecret, locale: 'es' });
      this.errorMessage = '';

      //  Montar el elemento
      this.montarPaymentElement();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      this.errorMessage = `Error al crear el pago: ${errorMsg}`;
      console.error('Error en crearNuevoPaymentIntent:', error);
    } finally {
      this.crearPaymentIntentInProgress = false;
    }
  }

  private montarPaymentElement(): void {
    setTimeout(() => {
      if (this.elements && this.paymentElementRef?.nativeElement) {
        try {
          // Limpiar element anterior si existe
          if (this.paymentElementMounted) {
            this.paymentElementRef.nativeElement.innerHTML = '';
          }

          const paymentElement = this.elements!.create('payment');
          paymentElement.mount(this.paymentElementRef.nativeElement);

          this.paymentElementMounted = true;
          console.log('PaymentElement montado correctamente');
        } catch (mountError) {
          console.error('Error montando paymentElement:', mountError);
          this.errorMessage = 'Error al montar el formulario de pago';
        }
      } else {
        console.warn('Elements o paymentElementRef no están disponibles');
      }
    }, 0);
  }

  async seleccionarMonto(monto: number) {
    if (monto <= 0) {
      this.errorMessage = 'El monto debe ser mayor a 0';
      return;
    }

    this.montoSeleccionado = monto;
    this.errorMessage = '';

    await this.crearNuevoPaymentIntent();
  }

  async donar() {
    if (!this.stripe || !this.elements) return;

    this.errorMessage = '';

    try {
      const { error, paymentIntent } = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams: {
          return_url: `${window.location.origin}/donativo`,
        },
        redirect: 'if_required',
      });

      if (error) {
        this.errorMessage = error.message ?? 'Error al procesar la donación';
        console.error('Error de Stripe:', error);

        Swal.fire({
          icon: 'error',
          title: 'Error en la donación',
          text: this.errorMessage,
          confirmButtonText: 'Reintentar',
          confirmButtonColor: '#5a96ae',
          allowOutsideClick: false,
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        this.exitoso = true;

        Swal.fire({
          icon: 'success',
          title: '¡Donación exitosa!',
          text: `¡Gracias por donar €${this.montoSeleccionado}! Tu generosidad ayudará a muchos animales.`,
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#5a96ae',
          allowOutsideClick: false,
        }).then(() => {
          window.location.href = '/home';
        });
      } else {
        const estado = paymentIntent?.status || 'desconocido';
        this.errorMessage = `Estado de pago: ${estado}. Por favor, espera un momento.`;
        console.log('Estado del pago:', estado);

        Swal.fire({
          icon: 'info',
          title: 'Pago en proceso',
          text: 'Tu pago está siendo procesado. Por favor, espera...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      this.errorMessage = `Error al procesar el pago: ${errorMsg}`;
      console.error('Error en donar:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error de sistema',
        text: this.errorMessage,
        confirmButtonText: 'Reintentar',
        confirmButtonColor: '#5a96ae',
        allowOutsideClick: false,
      });
    }
  }
}
