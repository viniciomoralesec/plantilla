import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { IFactura } from '../Interfaces/factura';
import { Router, RouterLink } from '@angular/router';
import { FacturaService } from '../Services/factura.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-facturas',
  standalone: true,
  imports: [SharedModule, RouterLink],
  templateUrl: './facturas.component.html',
  styleUrl: './facturas.component.scss'
})
export class FacturasComponent implements OnInit {
  listafacturas: IFactura[] = [];
  constructor(private facturaServicio: FacturaService) {}
  ngOnInit(): void {
    this.facturaServicio.todos().subscribe((data: IFactura[]) => {
      this.listafacturas = data;
    });
  }

  eliminar(idFactura: number): void {
    Swal.fire({
      title: 'Eliminar Factura',
      text: '¿Está seguro de eliminar esta factura?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f00',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.facturaServicio.eliminar(idFactura).subscribe(() => {
          Swal.fire({
            title: 'Factura eliminada',
            text: 'La factura ha sido eliminada correctamente.',
            icon: 'success'
          });
          this.facturaServicio.todos().subscribe((data: IFactura[]) => {
            this.listafacturas = data;
          });;
        });
      }
    });
  }

  actualizar(idFactura: number): void {
    // this.navegacion.navigate(['/facturas/editar', idFactura]);
  }
}