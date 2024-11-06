import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Estacionamiento } from '../interfaces/estacionamiento';

@Injectable({
  providedIn: 'root'
})
export class EstacionamientoService {
    auth= inject(AuthService);
    estacionamientos():Promise<Estacionamiento[]> {
      return fetch ('https://localhost:4000/estacionamiento',{
        method: 'GET',
        headers:{
          authorization: "Bearer "+(this.auth.getToken()??''),
        },
      }).then(r=>r.json());
    }
  
    buscarEstacionamientoActivo(cocheraId:number){
      return this.estacionamientos().then(estacionamientos=> {
        let buscado = null;
        for (let estacionamiento of estacionamientos){
          if (estacionamiento.idCochera===cocheraId &&
              estacionamiento.horaEgreso===null){
            buscado = estacionamiento;
          }
        }
        return buscado;
      });
     }
      /**abre un estacionamiento con una patente sobre una cochera en particular */
   estacionarAuto(patenteAuto:string, idCochera:number){
    return fetch('http://localhost:4000/estacionamientos/abrir',{
      method: 'POST',
      headers:{
        Authorization: "Bearer " + (this.auth.getToken()??''),
        "content-type": "application/json"
      },
      body: JSON.stringify({
        patente: patenteAuto,
        idCochera: idCochera,
        idUsuarioIngreso: "admin"
      })
    }).then(r=> r.json());
   }
  }