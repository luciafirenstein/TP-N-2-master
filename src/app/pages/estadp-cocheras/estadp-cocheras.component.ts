import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Cochera } from '../../interfaces/cocheras';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../serive/auth.service';
import Swal from 'sweetalert2';
import { EstacionamientoService } from '../../serive/estacionamiento.service';
import { CocherasService } from '../../serive/cocheras.service';
import { ReporteMensual } from '../../interfaces/reportes';

@Component({
  selector: 'app-estadp-cocheras',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './estadp-cocheras.component.html',
  styleUrl: './estadp-cocheras.component.scss'
})


export class EstadoCocherasComponent implements OnInit{

reportes: ReporteMensual[]=[];



titulo: string = 'Estado de la cochera';
header:{nro: string, disponibilidad: string, ingreso:string, acciones: string } = {
  nro: 'Nro',
  disponibilidad: 'Disponibilidad',
  ingreso: 'Ingreso',
  acciones: 'Acciones',
};
filas: Cochera[]=[];


  

ngOnInit(): void {
  this.traerCocheras();
}

auth=inject(AuthService);
estacionamientos=inject(EstacionamientoService);
cocheras=inject(CocherasService);

siguienteNumero: number = 1;
datosEstado={
  descripcion: "ABC123"
}

  async traerCocheras() {
  const cocheras = await this.cocheras['cocheras']();
  this.filas = [];
  for (let cochera of cocheras) {
    this.estacionamientos.buscarEstacionamientoActivo(cochera.id).then(estacionamiento => {
      this.filas.push({
        ...cochera,
        activo: estacionamiento,
      });
    });
  }
}
agregarFila() {
  return fetch('http://localhost:4000/cocheras/', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ${this.auth.getToken()}',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(this.datosEstado),
  }).then(() => {
    this.traerCocheras();
  });
}
  async eliminarFila(cocheraId: number) {
    await fetch(`http://localhost:4000/cocheras/${cocheraId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + this.auth.getToken(),
      },
    }).then(() => {
      this.traerCocheras();
    });
  }
  showModal(indice: number, event:Event) {
    event.stopPropagation();
    Swal.fire({
      title: "Seguro que quieres borrar la cochera?",
      text: "Una vez hecho no hay vuelta atrás!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, borrar!"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Listo!",
          text: "La cochera fue eliminada con éxito.",
          icon: "success"
        });
        this.eliminarFila(indice);
      }
    });
  }

  cambiarDisponibilidadCochera(cocheraId:number, event: Event){
    fetch ('http://localhost:4000/cocheras/'+cocheraId+'/disable', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + this.auth.getToken(),
      },
    }).then(()=>{
      this.traerCocheras();
    });
  }

  



  abrirModalNuevoEstacionamiento(idCochera: number) {
    Swal.fire({
      title: "Ingrese la patente del vehiculo",
      input: "text",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "Ingrese una patente valida";
        }
        return;
      }
    }).then(res => {
      if (res.isConfirmed) {
        this.estacionamientos.estacionarAuto(res.value, idCochera).then(() => {
          //actualizar cocheras
          this.traerCocheras();
    });
  }
})
}
  
    abrirModalEliminarEstacionamiento(idCochera: number, patente?: string) {
      if (!patente) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No hay un estacionamiento activo en esta cochera'
        });
        return;
      }
      Swal.fire({
        title: '¿Deseas cerrar el estacionamiento?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Cerrar'
      }).then((res) => {
        if (res.isConfirmed) {
          this.estacionamientos.cerrarEstacionamiento(patente, idCochera)
            .then((r) => {
              if (!r.ok) throw new Error("Error en la respuesta del servidor"); // Maneja respuestas no OK
              return r.json(); // Convertimos a JSON
            })
            .then((rJson) => {
              const costo = rJson.costo;
              this.traerCocheras();
              Swal.fire({
                title: 'La cochera ha sido cerrada',
                text: `El precio a cobrar es ${costo}`,
                icon: 'info'
              });
            });
          } else if (res.dismiss) {
            Swal.fire({
              title: 'Cancelado',
              text: 'La cochera no ha sido cerrada.',
              icon: 'info'
            });
          }
        });
      }
      
    
    
sortCocheras(){
  this.filas.sort((a,b)=> a.id > b.id ? 1 : -1)
}
getCocheras(){
fetch("https://localhost:4000/cocheras",{
headers:{
  authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiZXNBZG1pbiI6MSwiaWF0IjoxNzI2NjcxMTg3LCJleHAiOjE3MjcyNzU5ODd9.1EEQcqsXQc-nBUR8M-ZokVbn550mls6HLHgjmEJBkxE'
  },
  });
  }
}

    