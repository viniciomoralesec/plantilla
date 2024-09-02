import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IFactura } from 'src/app/Interfaces/factura';
import { ICliente } from 'src/app/Interfaces/icliente';
import { ClientesService } from 'src/app/Services/clientes.service';
import { FacturaService } from 'src/app/Services/factura.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nuevafactura',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './nuevafactura.component.html',
  styleUrl: './nuevafactura.component.scss'
})
export class NuevafacturaComponent implements OnInit {
  titulo = 'Nueva Factura';
  listaClientes: ICliente[] = [];
  listaClientesFiltrada: ICliente[] = [];
  totalapagar: number = 0;
  frm_factura: FormGroup;
  idFactura: number = 0;

  constructor(
    private clientesServicios: ClientesService,
    private facturaService: FacturaService,
    private navegacion: Router,
    private ruta: ActivatedRoute
  ) {}

  ngOnInit(): void {
   
    this.frm_factura = new FormGroup({
      Fecha: new FormControl('', Validators.required),
      Sub_total: new FormControl('', Validators.required),
      Sub_total_iva: new FormControl('', Validators.required),
      Valor_IVA: new FormControl('0.15', Validators.required),
      Clientes_idClientes: new FormControl('', Validators.required)
    });


    this.clientesServicios.todos().subscribe({
      next: (data) => {
        this.listaClientes = data;
        this.listaClientesFiltrada = data;
      },
      error: (e) => {
        console.log(e);
      }
    });

    
    this.idFactura = parseInt(this.ruta.snapshot.paramMap.get('id') || '0');

    if (this.idFactura > 0) {
      this.cargarFactura();
    }
  }

  cargarFactura() {
    
    this.facturaService.uno(this.idFactura).subscribe((factura) => {
      this.frm_factura.patchValue({
        Fecha: factura.Fecha.split(" ")[0],
        Sub_total: factura.Sub_total,
        Sub_total_iva: factura.Sub_total_iva,
        Valor_IVA: factura.Valor_IVA,
        Clientes_idClientes: factura.Clientes_idClientes,
      });
      this.calculos();
      this.titulo = 'Editar Factura';
    });
  }

  grabar() {
    let factura: IFactura = {
      idFactura: this.idFactura,
      Fecha: this.frm_factura.get('Fecha')?.value,
      Sub_total: this.frm_factura.get('Sub_total')?.value,
      Sub_total_iva: this.frm_factura.get('Sub_total_iva')?.value,
      Valor_IVA: this.frm_factura.get('Valor_IVA')?.value,
      Clientes_idClientes: this.frm_factura.get('Clientes_idClientes')?.value
    };

    if (this.idFactura > 0) {
    
      this.facturaService.actualizar(factura).subscribe((respuesta) => {
        Swal.fire({
          title: 'Factura Actualizada',
          text: 'La factura ha sido actualizada correctamente.',
          icon: 'success'
        }).then(() => {
          this.navegacion.navigate(['/facturas']);
        });
      });
    } else {
      

      this.facturaService.insertar(factura).subscribe((respuesta) => {
        if (parseInt(respuesta) > 0) {
          Swal.fire({
            title: 'Factura Grabada',
            text: 'La factura ha sido grabada correctamente.',
            icon: 'success'
          }).then(() => {
            this.navegacion.navigate(['/facturas']);
          });
        }
      });
    }
  }

  calculos() {
    let sub_total = this.frm_factura.get('Sub_total')?.value;
    let iva = this.frm_factura.get('Valor_IVA')?.value;
    let sub_total_iva = sub_total * iva;
    this.frm_factura.get('Sub_total_iva')?.setValue(sub_total_iva);
    this.totalapagar = parseFloat(sub_total) + sub_total_iva;
  }

  cambio(objetoSelect: any) {
    let idCliente = objetoSelect.target.value;
    this.frm_factura.get('Clientes_idClientes')?.setValue(idCliente);
  }
}