import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Cochera } from '../../interfaces/cocheras';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../serive/auth.service';
import { CocherasService } from '../../serive/cocheras.service';
import { Estacionamiento } from '../../interfaces/estacionamiento';

@Component({
  selector: 'app-estadp-cocheras',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './estadp-cocheras.component.html',
  styleUrl: './estadp-cocheras.component.scss'
})
export class EstadpCocherasComponent {
  titulo: string="Parking App";
  header:{ nro:string, disponibilidad: string, ingreso: string, acciones: string}={
    nro: "Nro",
    disponibilidad: "Disponibilidad",
    ingreso: "Ingreso",
    acciones: "Acciones",
  };
  filas:(Cochera&{activo: Estacionamiento|null})[]=[];
  auth= inject(AuthService);
  cocheras=inject(CocherasService);

  ngOnInit(){
    this.traerCocheras().then(filas=>{
      this.filas= filas;
    })
  }

  traerCocheras(){
    return this.cocheras.cocheras();
  }

  siguienteNumero: number=1;
  agregarFila(){
    this.filas.push({
      id: this.siguienteNumero,
      descripcion: '',
      deshabilitada: false,
      eliminada: false,
      activo: null
    });
    this.siguienteNumero +=1;
  }
  eliminarFila(cocheraId: number) {
    fetch('http://localhost:4000/cocheras/' + cocheraId,{
      method: 'DELETE',
      headers:{
        Autorization:'Bearer '+ this.auth.getToken(),
      },
    }).then(()=>{
      this.traerCocheras().then((filas)=>{
        this.filas=filas;
      });
    });
  }
  CambiarDisponibilidadCochera(cocheraId:number){
    fetch('http://localhost:4000/cocheras/' + cocheraId + '/disable', {
      method: 'POST',
      headers:{
        Autorization:'Bearer '+ this.auth.getToken(),
      },
    }).then(()=>{
      this.traerCocheras().then((filas)=>{
        this.filas=filas;
      });
    });
  }
  getCocheras(){
    fetch("http://localhost:4000/estado-cocheras",{
      headers:{
        authorization: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiZXNBZG1pbiI6MSwiaWF0IjoxNzI2Njc0MDQ5LCJleHAiOjE3MjcyNzg4NDl9.HvpH2jjP5Sjl_HVQM9aF6OWCzir61elZsGjLx5BZGUU"
      }
    })
  }
}