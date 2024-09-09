import { Component, OnInit } from '@angular/core';
import { IUnidadMedida } from '../Interfaces/iunidadmedida';
import { RouterLink } from '@angular/router';
import { SharedModule } from '../theme/shared/shared.module';
import { UnidadmedidaService } from '../Services/unidadmedida.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-unidadmedida',
  standalone: true,
  imports: [RouterLink, SharedModule],
  templateUrl: './unidadmedida.component.html',
  styleUrl: './unidadmedida.component.scss'
})
export class UnidadmedidaComponent implements OnInit {
  listaunidades: IUnidadMedida[] = [];

  constructor(private unidadServicio: UnidadmedidaService) {}
  ngOnInit(): void {
    this.listarUnidades();
  }

  listarUnidades() {
    this.unidadServicio.todos().subscribe(data => {
      this.listaunidades = data;
      console.log(data);
    })
  }
  trackByFn() {}

  eliminar(idUnidad_Medida: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la unidad de medida',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then( result => {
      if(result.isConfirmed) {
        this.unidadServicio.eliminar(idUnidad_Medida).subscribe(data => {
          this.listarUnidades();
        });
        Swal.fire('Eliminado', 'La unidad de medida ha sido eliminada', 'success');
      } else {
        Swal.fire('Error', 'Ocurrio un error', 'error');
      }
    })
  }
}