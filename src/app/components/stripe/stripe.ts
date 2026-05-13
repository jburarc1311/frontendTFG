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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-stripe',
  imports: [TranslateModule],
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
  private translate = inject(TranslateService);

  async ngOnInit() {
    try {
      this.stripe = await this.stripeService.getStripe();
      if (this.montoSeleccionado <= 0) {
        throw new Error(this.translate.instant('donation.errors.amount'));
      }
      await this.crearNuevoPaymentIntent();
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : this.translate.instant('donation.errors.unknown');
      this.errorMessage = this.translate.instant('donation.errors.loadForm', { error: errorMsg });
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
      console.warn('createPaymentIntent ya esta en progreso');
      return;
    }

    this.crearPaymentIntentInProgress = true;

    try {
      const { clientSecret } = await this.stripeService.crearPaymentIntent(this.montoSeleccionado);
      this.currentClientSecret = clientSecret;

      if (this.elements) {
        this.paymentElementMounted = false;
      }

      if (!this.stripe) throw new Error('Stripe is not initialized');

      console.warn('El clientSecret expira en 24 horas. Si esperas mucho, recarga la pagina.');

      this.elements = this.stripe.elements({ clientSecret, locale: 'es' });
      this.errorMessage = '';

      this.montarPaymentElement();
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : this.translate.instant('donation.errors.unknown');
      this.errorMessage = this.translate.instant('donation.errors.createPayment', {
        error: errorMsg,
      });
      console.error('Error en crearNuevoPaymentIntent:', error);
    } finally {
      this.crearPaymentIntentInProgress = false;
    }
  }

  private montarPaymentElement(): void {
    setTimeout(() => {
      if (this.elements && this.paymentElementRef?.nativeElement) {
        try {
          if (this.paymentElementMounted) {
            this.paymentElementRef.nativeElement.innerHTML = '';
          }

          const paymentElement = this.elements.create('payment');
          paymentElement.mount(this.paymentElementRef.nativeElement);

          this.paymentElementMounted = true;
          console.log('PaymentElement montado correctamente');
        } catch (mountError) {
          console.error('Error montando paymentElement:', mountError);
          this.errorMessage = this.translate.instant('donation.errors.mount');
        }
      } else {
        console.warn('Elements o paymentElementRef no estan disponibles');
      }
    }, 0);
  }

  async seleccionarMonto(monto: number) {
    if (monto <= 0) {
      this.errorMessage = this.translate.instant('donation.errors.amount');
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
        this.errorMessage = error.message ?? this.translate.instant('donation.errors.process');
        console.error('Error de Stripe:', error);

        Swal.fire({
          icon: 'error',
          title: this.translate.instant('donation.alerts.donationError'),
          text: this.errorMessage,
          confirmButtonText: this.translate.instant('donation.alerts.retry'),
          confirmButtonColor: '#5a96ae',
          allowOutsideClick: false,
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        this.exitoso = true;

        Swal.fire({
          icon: 'success',
          title: this.translate.instant('donation.alerts.successTitle'),
          text: this.translate.instant('donation.alerts.successText', {
            amount: this.montoSeleccionado,
          }),
          confirmButtonText: this.translate.instant('common.accept'),
          confirmButtonColor: '#5a96ae',
          allowOutsideClick: false,
        }).then(() => {
          window.location.href = '/home';
        });
      } else {
        const estado = paymentIntent?.status || this.translate.instant('common.unknown');
        this.errorMessage = this.translate.instant('donation.alerts.paymentStatus', {
          status: estado,
        });
        console.log('Estado del pago:', estado);

        Swal.fire({
          icon: 'info',
          title: this.translate.instant('donation.alerts.processingTitle'),
          text: this.translate.instant('donation.alerts.processingText'),
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : this.translate.instant('donation.errors.unknown');
      this.errorMessage = this.translate.instant('donation.errors.processPayment', {
        error: errorMsg,
      });
      console.error('Error en donar:', error);

      Swal.fire({
        icon: 'error',
        title: this.translate.instant('donation.errors.systemTitle'),
        text: this.errorMessage,
        confirmButtonText: this.translate.instant('donation.alerts.retry'),
        confirmButtonColor: '#5a96ae',
        allowOutsideClick: false,
      });
    }
  }
}
