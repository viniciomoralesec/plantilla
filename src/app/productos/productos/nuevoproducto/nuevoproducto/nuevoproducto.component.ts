import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IProducto } from 'src/app/Interfaces/iproducto';
import { Iproveedor } from 'src/app/Interfaces/iproveedor';
import { IIva } from 'src/app/Interfaces/iva';
import { IUnidadMedida } from 'src/app/Interfaces/iunidadmedida';
import { ProveedorService } from 'src/app/Services/proveedores.service';
import { UnidadmedidaService } from 'src/app/Services/unidadmedida.service';
import { IvaService } from './../../Services/iva.service';
import { ProductoService } from 'src/app/Services/productos.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nuevoproducto',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './nuevoproducto.component.html',
  styleUrls: ['./nuevoproducto.component.scss']
})
export class NuevoproductoComponent implements OnInit {
  listaUnidadMedida: IUnidadMedida[] = [];
  listaProveedores: Iproveedor[] = [];
  ivas: IIva[] = [];
  titulo = 'Insertar Producto';
  frm_Producto: FormGroup;
  idProductos = 0;

  constructor(
    private unidadServicio: UnidadmedidaService,
    private fb: FormBuilder,
    private proveedorServicio: ProveedorService,
    private ivaService: IvaService,
    private productoServicio: ProductoService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.crearFormulario();

    // Cargar las listas primero
    this.unidadServicio.todos().subscribe((data) => this.listaUnidadMedida = data);
    this.proveedorServicio.todos().subscribe((data) => this.listaProveedores = data);
    this.ivaService.todos().subscribe((data) => this.ivas = data);

    // Cargar datos si es edición
    this.idProductos = parseInt(this.route.snapshot.paramMap.get('id'), 10);
    if (this.idProductos > 0) {
      this.titulo = 'Actualizar Producto';
      this.productoServicio.uno(this.idProductos).subscribe((producto) => {
        this.frm_Producto.patchValue({
          Codigo_Barras: producto.Codigo_Barras,
          Nombre_Producto: producto.Nombre_Producto,
          Graba_IVA: producto.Graba_IVA,
          Unidad_Medida_idUnidad_Medida: producto.Unidad_Medida_idUnidad_Medida,
          IVA_idIVA: producto.IVA_idIVA,
          Cantidad: producto.Cantidad,
          Valor_Compra: producto.Valor_Compra,
          Valor_Venta: producto.Valor_Venta,
          Proveedores_idProveedores: producto.Proveedores_idProveedores
        });

        // Seleccionar las opciones correctas en las listas desplegables
        this.seleccionarValoresRelacionados(producto);
      });
    }
  }

  crearFormulario() {
    this.frm_Producto = this.fb.group({
      Codigo_Barras: ['', Validators.required],
      Nombre_Producto: ['', Validators.required],
      Graba_IVA: ['', Validators.required],
      Unidad_Medida_idUnidad_Medida: ['', Validators.required],
      IVA_idIVA: ['', Validators.required],
      Cantidad: ['', [Validators.required, Validators.min(1)]],
      Valor_Compra: ['', [Validators.required, Validators.min(0)]],
      Valor_Venta: ['', [Validators.required, Validators.min(0)]],
      Proveedores_idProveedores: ['', Validators.required]
    });
  }

  seleccionarValoresRelacionados(producto: IProducto) {
    // Verificar y seleccionar la unidad de medida
    if (this.listaUnidadMedida.length > 0) {
      const unidad = this.listaUnidadMedida.find(u => u.idUnidad_Medida === producto.Unidad_Medida_idUnidad_Medida);
      if (unidad) {
        this.frm_Producto.get('Unidad_Medida_idUnidad_Medida').setValue(unidad.idUnidad_Medida);
      }
    }

    // Verificar y seleccionar el proveedor
    if (this.listaProveedores.length > 0) {
      const proveedor = this.listaProveedores.find(p => p.idProveedores === producto.Proveedores_idProveedores);
      if (proveedor) {
        this.frm_Producto.get('Proveedores_idProveedores').setValue(proveedor.idProveedores);
      }
    }

    // Verificar y seleccionar el IVA
    if (this.ivas.length > 0) {
      const iva = this.ivas.find(i => i.idIVA === producto.IVA_idIVA);
      if (iva) {
        this.frm_Producto.get('IVA_idIVA').setValue(iva.idIVA);
      }
    }
  }

  grabar() {
    const producto: IProducto = this.frm_Producto.value;
    if (this.idProductos === 0 || isNaN(this.idProductos)) {
      // Inserción
      this.productoServicio.insertar(producto).subscribe((respuesta) => {
        if (parseInt(respuesta, 10) > 1) {
          Swal.fire('Éxito', 'Producto grabado con éxito', 'success');
          this.router.navigate(['/productos']);
        } else {
          Swal.fire('Error', 'Error al grabar el producto', 'error');
        }
      });
    } else {
      // Actualización
      producto.idProductos = this.idProductos;
      this.productoServicio.actualizar(producto).subscribe((respuesta) => {
        if (parseInt(respuesta, 10) > 0) {
          Swal.fire('Éxito', 'Producto actualizado con éxito', 'success');
          this.router.navigate(['/productos']);
        } else {
          Swal.fire('Error', 'Error al actualizar el producto', 'error');
        }
      });
    }
  }
}