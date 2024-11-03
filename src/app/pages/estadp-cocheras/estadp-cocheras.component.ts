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

export class EstadoCocherasComponent {
   header: { nro:string, disponibilidad: string, ingreso:string, acciones: string} = {
      nro: 'N°',
      disponibilidad: 'DISPONIBILIDAD',
      ingreso: 'INGRESO',
      acciones: 'ACCIONES',
   };
   filas:(Cochera & {activo: Estacionamiento|null}) []=[];
   ngOnInit(){
    this.traerCocheras();
   }
   auth = inject(AuthService);
   cocheras = inject(CocherasService);
   estacionamientos = inject(EstacionamientoService)
   traerCocheras(){
      return this.cocheras.cocheras().then(cocheras => {
        this.filas = [];
        for (let cochera of cocheras) {
          this.estacionamientos.buscarEstacionamientoActivo(cochera.id).then(estacionamiento => {
            this.filas.push({
              ...cochera,
              activo: estacionamiento,
            });
          })
        }})
      }
   siguienteNumero: number = 1;
   agregarFila(){
    this.filas.push({
      id: this.siguienteNumero,
      descripcion: '',
      deshabilitada: false,
      eliminada: false,
      activo: null
    });
    this.siguienteNumero +=1;
   }; 
   eliminarFila(index:number,event:Event){
    event.stopPropagation
   this.filas.splice(index,1);
   }
   cambiarDisponibilidad(numeroFila:number,event:Event){
    event.stopPropagation()
    if(this.filas[numeroFila].deshabilitada === true){
      this.filas[numeroFila].deshabilitada = false;
    } else {
      this.filas[numeroFila].deshabilitada = true;
    }

  }
   getCocheras(){
    fetch("http://localhost:4000/cocheras "),{
      headers:{
        authorization: ' Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZ…5Mjl9.4tZ5YuPXudY4LUmDeEvqqPSXjXhD1VO2AF3CAaEDq7Q'
      },
    }
   }
   abrirModalNuevoEstacionamiento(idCochera:number){
    console.log("Abriendo modal cochera",idCochera);
    Swal.fire({
      title: "Ingrese la patente del vehiculo",
      input: "text",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "Ingrese una patente valida";
        }
        return
      }
    }).then(res=>{
      if(res.isConfirmed){
        console.log("Tengo que estacionar la patente",res.value);
        this.estacionamientos.estacionarAuto(res.value,idCochera);
        this.estacionamientos.estacionarAuto(res.value,idCochera).then(()=>{
          //actualizar cocheras
          this.traerCocheras()
        })
    }})
    
  }
}

        