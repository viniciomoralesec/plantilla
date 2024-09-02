import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ClientesService } from 'src/app/Services/clientes.service';
import { ICliente } from 'src/app/Interfaces/icliente';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-nuevocliente',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './nuevocliente.component.html',
  styleUrls: ['./nuevocliente.component.scss']
})
export class NuevoclienteComponent implements OnInit {
  frm_Cliente = new FormGroup({
    Nombres: new FormControl('', Validators.required),
    Direccion: new FormControl('', Validators.required),
    Telefono: new FormControl('', Validators.required),
    Cedula: new FormControl('', [Validators.required, this.validadorCedulaEcuador]),
    Correo: new FormControl('', [Validators.required, Validators.email])
  });

  idClientes = 0;
  titulo = 'Nuevo Cliente';

  constructor(
    private clienteServicio: ClientesService,
    private navegacion: Router,
    private ruta: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Obtener el idCliente de la ruta para determinar si se está editando o creando un nuevo cliente
    this.idClientes = parseInt(this.ruta.snapshot.paramMap.get('idCliente') || '0', 10);

    if (this.idClientes > 0) {
      // Si idClientes es mayor a 0, estamos en modo de edición
      this.clienteServicio.uno(this.idClientes).subscribe({
        next: (uncliente) => {
          // Setear los valores del formulario con los datos del cliente obtenido
          this.frm_Cliente.setValue({
            Nombres: uncliente.Nombres,
            Direccion: uncliente.Direccion,
            Telefono: uncliente.Telefono,
            Cedula: uncliente.Cedula,
            Correo: uncliente.Correo
          });
          // Cambiar el título a "Editar Cliente"
          this.titulo = 'Editar Cliente';
        },
        error: () => {
          // Manejo de errores al obtener el cliente
          Swal.fire({
            title: 'Error',
            text: 'No se pudo cargar la información del cliente.',
            icon: 'error'
          });
        }
      });
    }
  }

  grabar() {
    // Crear un objeto cliente con los datos del formulario
    const cliente: ICliente = {
      idClientes: this.idClientes,
      Nombres: this.frm_Cliente.get('Nombres')?.value,
      Direccion: this.frm_Cliente.get('Direccion')?.value,
      Telefono: this.frm_Cliente.get('Telefono')?.value,
      Cedula: this.frm_Cliente.get('Cedula')?.value,
      Correo: this.frm_Cliente.get('Correo')?.value
    };

    // Mostrar un mensaje de confirmación
    Swal.fire({
      title: 'Clientes',
      text: `Desea guardar al Cliente ${cliente.Nombres}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f00',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Grabar!'
    }).then((result) => {
      if (result.isConfirmed) {
        // Determinar si se inserta o actualiza el cliente según su ID
        const accion = this.idClientes > 0 ? this.clienteServicio.actualizar(cliente) : this.clienteServicio.insertar(cliente);

        accion.subscribe({
          next: (res: any) => {
            // Mostrar mensaje de éxito y navegar a la lista de clientes
            Swal.fire({
              title: 'Clientes',
              text: res.mensaje,
              icon: 'success'
            });
            this.navegacion.navigate(['/clientes']);
          },
          error: () => {
            // Manejo de errores al guardar el cliente
            Swal.fire({
              title: 'Error',
              text: 'No se pudo guardar la información del cliente.',
              icon: 'error'
            });
          }
        });
      }
    });
  }

  // Validador para la cédula ecuatoriana
  validadorCedulaEcuador(control: AbstractControl): ValidationErrors | null {
    const cedula = control.value;
    if (!cedula) return null;
    if (cedula.length !== 10) return { cedulaInvalida: true };

    const provincia = parseInt(cedula.substring(0, 2), 10);
    if (provincia < 1 || provincia > 24) return { provincia: true };

    const tercerDigito = parseInt(cedula.substring(2, 3), 10);
    if (tercerDigito < 0 || tercerDigito > 5) return { cedulaInvalida: true };

    const digitoVerificador = parseInt(cedula.substring(9, 10), 10);
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    const suma = coeficientes.reduce((acc, coef, i) => {
      const valor = parseInt(cedula[i], 10) * coef;
      return acc + (valor > 9 ? valor - 9 : valor);
    }, 0);

    const resultado = suma % 10 === 0 ? 0 : 10 - (suma % 10);
    return resultado === digitoVerificador ? null : { cedulaInvalida: true };
  }
}