import { inject, Injectable } from '@angular/core';
import { Cochera } from '../interfaces/cocheras';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CocherasService {
  [x: string]: any;
  constructor() { }
  
  auth = inject(AuthService)

  cargar():Promise<Cochera[]>{
    return fetch("http://localhost:4000/cocheras",{
      method: "GET",
      headers:{
        authorization : "Bearer " + (this.auth.getToken() ?? "")
      },
    }).then(res => res.json());
  }

  get(cocheraId:number): Promise<Cochera>{
    return fetch(`http://localhost:4000/cocheras/${cocheraId}`, {
      method: "GET",
    }).then(res => res.json());
  }

  habilitar(cochera:Cochera){
    return fetch(`http://localhost:4000/cocheras/${cochera.id}/enable`,{
      method: "POST",
      headers:{
        'Authorization' : `Bearer ${this.auth.getToken()}`
      }
    }).then(res => res.json());
  }

  deshabilitar(cochera:Cochera){
    return fetch (`http://localhost:4000/cocheras/${cochera.id}/disable`, {
      method:"POST",
      headers:{
        'Authorization' : `Bearer ${this.auth.getToken()}`
      }
    }).then(res => res.json());
  }

  eliminar(cochera: Cochera){
    return fetch(`http://localhost:4000/cocheras/${cochera.id}`, {
      method: "DELETE",
      headers:{
        'Authorization' : `Bearer ${this.auth.getToken()}`
      }
    }).then(res => res.json());
  }

  agregar(){
    return fetch("http://localhost:4000/cocheras",{
      method: "POST",
      headers:{
        authorization : "Bearer " + (this.auth.getToken() ?? ""),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ descripcion: "Agregada por api" })
    }).then(res => res.json());
  }


}
