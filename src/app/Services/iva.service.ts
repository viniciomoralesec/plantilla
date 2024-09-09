import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IUnidadMedida } from '../Interfaces/iunidadmedida';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IvaService {
  apiurl = 'http://localhost/MVC/controllers/iva.controller.php?op=';

  constructor(private lector: HttpClient) {}

  todos(): Observable<IUnidadMedida[]> {
    return this.lector.get<IUnidadMedida[]>(this.apiurl + 'todos');
  }

}