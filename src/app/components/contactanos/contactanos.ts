import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { Contacto } from '../../services/contacto';

@Component({
  selector: 'app-contactanos',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  templateUrl: './contactanos.html',
  styleUrl: './contactanos.css',
})
export class Contactanos {
  form!: FormGroup;
  private fb = inject(FormBuilder);
  private contactoService = inject(Contacto);
  private translate = inject(TranslateService);

  ngOnInit() {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      motivo: ['', Validators.required],
      mensaje: ['', Validators.required],
    });
  }

  async enviarMensaje() {
    if (this.form.invalid) return;

    const resultado = await Swal.fire({
      icon: 'question',
      title: this.translate.instant('contact.confirmTitle'),
      text: this.translate.instant('contact.confirmText'),
      showCancelButton: true,
      confirmButtonText: this.translate.instant('contact.confirmButton'),
      cancelButtonText: this.translate.instant('contact.cancelButton'),
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#6b7280',
      allowOutsideClick: false,
    });

    if (!resultado.isConfirmed) return;

    this.contactoService.enviarContacto(this.form.value).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: this.translate.instant('contact.successTitle'),
          text: this.translate.instant('contact.successText'),
          confirmButtonText: this.translate.instant('contact.acceptButton'),
          confirmButtonColor: '#16a34a',
          allowOutsideClick: false,
        });
        this.form.reset();
      },
      error: (err) => {
        console.error('Error:', err);
        Swal.fire({
          icon: 'error',
          title: this.translate.instant('contact.errorTitle'),
          text: this.translate.instant('contact.errorText'),
          confirmButtonText: this.translate.instant('contact.acceptButton'),
          confirmButtonColor: '#16a34a',
          allowOutsideClick: false,
        });
      },
    });
  }
}
