import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Estacionamiento } from '../interfaces/estacionamiento';

@Injectable({
  providedIn: 'root'
})
export class EstacionamientoService {
    private auth= inject(AuthService);
    async estacionamientos():Promise<Estacionamiento[]> {
      const r = await fetch('http://localhost:4000/estacionamientos', {
        method: 'GET',
        headers: {
          authorization: "Bearer " + (this.auth.getToken() ?? ''),
        },
      });
      return await r.json();
    }
  
    async buscarEstacionamientoActivo(cocheraId:number){
      return this.estacionamientos().then(estacionamientos=> {

      let buscado = null;
      for (let estacionamiento of estacionamientos) {
        if (estacionamiento.idCochera === cocheraId &&
          estacionamiento.horaEgreso === null) {
          buscado = estacionamiento;
        }
      }
      return buscado;
     });
    }

     async traerEstacionamientoPorCochera(cocheraId:number){
      return this.estacionamientos().then(estacionamientos=> {
       let buscado = null;
       for (let estacionamiento of estacionamientos) {
         if (estacionamiento.idCochera === cocheraId &&
           estacionamiento.horaEgreso != null) {
           buscado = estacionamiento;
         }
       }
       return buscado;
     });
}


      /**abre un estacionamiento con una patente sobre una cochera en particular */
   async estacionarAuto(patenteAuto:string, idCochera:number){
    const r = await fetch('http://localhost:4000/estacionamientos/abrir', {
       method: 'POST',
       headers: {
         Authorization: "Bearer " + (this.auth.getToken() ?? ''),
         "content-type": "application/json"
       },
       body: JSON.stringify({
         patente: patenteAuto,
         idCochera: idCochera,
         idUsuarioIngreso: "admin"
       })
     });
     return await r.json();
   }
   cerrarEstacionamiento(patenteAuto: string) {
    return fetch("http://localhost:4000/estacionamientos/cerrar", { 
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + (this.auth.getToken() ?? ""),
        "content-type": "application/json"
      },
      body: JSON.stringify({
        patente: patenteAuto,
        idUsuarioEgreso: "admin"
      })
    }).then(res => res.json());
  }
  obtenerMontoAPagar(idCochera: number):
  Promise<Estacionamiento>{
    return fetch(`http://localhost:4000/estacionamientos/${idCochera}`,{
      method: "GET",
      headers: {
        Authorization: "Bearer " + (this.auth.getToken() ?? ""),
        "content-type": "application/json"
      },
    }).then(res => res.json());
    }
    
 
  
  // Liberar cochera
  async liberarCochera(idCochera: number, patente: string) {
    const response = await fetch(`http://localhost:4000/estacionamientos/liberar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idCochera, patente })
    });
    return await response.json();
  }

}
