import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Estacionamiento } from '../interfaces/estacionamiento';

@Injectable({
  providedIn: 'root'
})
export class EstacionamientoService {
    auth= inject(AuthService);
    estacionamientos():Promise<Estacionamiento[]> {
      return fetch ('https://localhost:4200/estacionamiento',{
        method: 'GET',
        headers:{
          authorization: "Bearer "+(this.auth.getToken()??''),
        },
      }).then(r=>r.json());
    }
    buscarEstacionamientoActivo(cocheraId:number){
      return this.estacionamientos().then(estacionamientos=>{
        let buscado= null;
        for (let estacionamiento of estacionamientos){
          if (estacionamiento.idCochera=== cocheraId &&
              estacionamiento.horaEgreso===null){
          buscado= estacionamientos;
          }
        }
        return buscado;
      });
    }
  }