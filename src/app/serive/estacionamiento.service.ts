import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Estacionamiento } from '../interfaces/estacionamiento';

@Injectable({
  providedIn: 'root'
})
export class EstacionamientoService {
  private auth = inject(AuthService);

  estacionamientos(): Promise<Estacionamiento[]> {
    return fetch('http://localhost:4000/estacionamiento', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.auth.getToken() || ''}`,
      },
    }).then(response => response.json());
  }

  buscarEstacionamientoActivo(cocheraId: number): Promise<Estacionamiento | null> {
    return this.estacionamientos().then(estacionamientos => {
      return estacionamientos.find(estacionamiento =>
        estacionamiento.idCochera === cocheraId && estacionamiento.horaEgreso === null
      ) || null;
    });
  }

  estacionarAuto(patenteAuto: string, idCochera: number): Promise<any> {
    return fetch('http://localhost:4000/estacionamientos/abrir', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.auth.getToken() || ''}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        patente: patenteAuto,
        idCochera: idCochera,
        idUsuarioIngreso: 'admin'
      })
    }).then(response => response.json());
  }
}