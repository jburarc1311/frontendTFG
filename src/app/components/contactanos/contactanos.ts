import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
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
  ],
  templateUrl: './contactanos.html',
  styleUrl: './contactanos.css',
})
export class Contactanos {
  form!: FormGroup;
  private fb = inject(FormBuilder);
  private contactoService = inject(Contacto);

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
      title: '¿Enviar mensaje?',
      text: 'Revisa los datos antes de enviarlo.',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#6b7280',
      allowOutsideClick: false,
    });

    if (!resultado.isConfirmed) return;

    this.contactoService.enviarContacto(this.form.value).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Mensaje enviado',
          text: 'Tu mensaje se ha enviado correctamente.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#16a34a',
          allowOutsideClick: false,
        });
        this.form.reset();
      },
      error: (err) => {
        console.error('Error:', err);
        Swal.fire({
          icon: 'error',
          title: 'No se pudo enviar',
          text: 'Hubo un problema al enviar el mensaje.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#16a34a',
          allowOutsideClick: false,
        });
      },
    });
  }
}
