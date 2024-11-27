import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Cochera } from '../interfaces/cocheras';

@Injectable({
  providedIn: 'root'
})
export class CocherasService {

  auth= inject(AuthService);
  eliminarCochera: any;
  cambiarDisponibilidadCochera: any;

  async cocheras(){
    const r = await fetch('http://localhost:4000/cocheras', {
      method: 'GET',
      headers: {
        authorization: "Bearer " + (this.auth.getToken() ?? ''),
      },
    });
    return await r.json();
  }

crearCochera(){
  return fetch('http://localhost:4000/cocheras/', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + this.auth.getToken(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ descripcion: "Agregada por API" })
})}

precio(){
  return fetch('http://localhost:4000/tarifas/',{
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + this.auth.getToken(),
      'Content-Type': 'application/json',
  },
})}


  habilitar(cochera: Cochera) {
    if (!cochera.deshabilitada) return Promise.resolve();

    return fetch(`http://localhost:4000/cocheras/${cochera.id}/enable`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${this.auth.getToken()}`
        }
    })
  }
  deshabilitar(cochera: Cochera) {
    if (cochera.deshabilitada) return Promise.resolve();

    return fetch(`http://localhost:4000/cocheras/${cochera.id}/disable`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${this.auth.getToken()}`
        }
    })
}
  async getCocherasById(id: number){
    const r = await fetch(`http://localhost:4000/cocheras/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${this.auth.getToken()}`
    }
  });
  return await r.json();
}

}