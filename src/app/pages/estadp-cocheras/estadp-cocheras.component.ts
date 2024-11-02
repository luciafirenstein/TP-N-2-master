import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Cochera } from '../../interfaces/cocheras';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../serive/auth.service';
import { CocherasService } from '../../serive/cocheras.service';
import { Estacionamiento } from '../../interfaces/estacionamiento';
import Swal from 'sweetalert2';
import { EstacionamientoService } from '../../serive/estacionamiento.service';

@Component({
  selector: 'app-estadp-cocheras',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './estadp-cocheras.component.html',
  styleUrl: './estadp-cocheras.component.scss'
})
export class EstadpCocherasComponent {
fila: any;
cambiarDisponibilidadCochera(arg0: number,$event: MouseEvent) {
throw new Error('Method not implemented.');
}
  titulo: string="Parking App";
  header:{ nro:string, disponibilidad: string, ingreso: string, acciones: string}={
    nro: "Nro",
    disponibilidad: "Disponibilidad",
    ingreso: "Ingreso",
    acciones: "Acciones",
  };
  
  auth= inject(AuthService);
  cocheras=inject(CocherasService);
  filas: Cochera[] = [];
  siguienteNumero: number = 1;
  estacionamientos = inject(EstacionamientoService)
 


  ngOnInit(){
    this.traerCocheras().then(filas=>{
      this.filas= filas;
    })
  }

  traerCocheras(){
    return this.cocheras.cocheras();
  }

  agregarFila() {
    Swal.fire({
      title: "Ingresa la descripción de la cochera",
      input: "text",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "Ingresa la descripción de la cochera";
        }
        return null;
      }
    }).then((res) => {
      if (res.isConfirmed && res.value) { // Aseguramos que haya una descripción ingresada
        fetch('http://localhost:4000/cocheras/', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + (localStorage.getItem("token") ?? "")
          },
          body: JSON.stringify({ descripcion: res.value })
        }).then(() => this.traerCocheras());
      }
    });
  }

  eliminarFila(cocheraId: number, event: Event) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(()=>{
      this.traerCocheras().then((filas)=>{
        this.filas=filas;
      });
    });
    fetch('http://localhost:4000/cocheras/' + cocheraId,{
      method: 'DELETE',
      headers:{
        Autorization:'Bearer '+ this.auth.getToken(),
      },
    })
  }

  CambiarDisponibilidadCochera(cocheraId:number, deshabilitada: boolean, event:Event){
    if (deshabilitada) {
    fetch('http://localhost:4000/cocheras/' + cocheraId + '/disable', {
      method: 'POST',
      headers:{
        Autorization:'Bearer '+ this.auth.getToken(),
      },
    }).then(()=> this.traerCocheras());

    } else {
      fetch('http://localhost:4000/cocheras/' + cocheraId + '/disable', {
        method: "POST",
        headers: {
          Authorization: "Bearer " + (this.auth.getToken() ?? ''),
        },
      }).then(() => this.traerCocheras());
    }
    event.stopPropagation();
  }

  
  getCocheras(){
    fetch("http://localhost:4000/estado-cocheras",{
      headers:{
        authorization: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiZXNBZG1pbiI6MSwiaWF0IjoxNzI2Njc0MDQ5LCJleHAiOjE3MjcyNzg4NDl9.HvpH2jjP5Sjl_HVQM9aF6OWCzir61elZsGjLx5BZGUU"
      }
    })
  }

  abrirModalNuevoEstacionamiento(idCochera: number) {
    console.log("Abriendo modal cochera")
    Swal.fire({
      title: "Ingrese la patente del vehiculo ",
      input: "text",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "Ingrese una patente valida";
        }
        return
      },
    }).then(res => {
      if (res.isConfirmed) {
        console.log("Tengo que estacionar la patente", res.value);
        this.estacionamientos.estacionarAuto(res.value, idCochera).then(() => {
          this.traerCocheras()
        })
      }
    }

    )
  }


}

        