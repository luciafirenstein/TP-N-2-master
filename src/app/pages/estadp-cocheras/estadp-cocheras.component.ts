import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
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
siguienteNumero: number = 1;

auth=inject(AuthService);
estacionamientos=inject(EstacionamientoService);
cocheras=inject(CocherasService);
router= inject(Router);


ngOnInit(): void {
  this.traerCocheras();
}

async traerCocheras() {
  try {
    const cocheras = await this.cocheras['cocheras']();
    
    const filasConEstacionamientos = await Promise.all(
      cocheras.map(async (cochera: { id: number }) => {
        const estacionamiento = await this.estacionamientos.buscarEstacionamientoActivo(cochera.id);
        return {
          ...cochera,
          activo: estacionamiento,
        };
      })
    );
    
    this.filas = filasConEstacionamientos.sort((a, b) => a.id - b.id);
  } catch (error) {
    console.error('Error al cargar cocheras:', error);
    Swal.fire('Error', 'No se pudieron cargar las cocheras', 'error');
  }
}

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


  /** Elimina la fila de la cochera seleccionada */
  eliminarFilaModal(cocheraId: number, event: Event) {
    event.stopPropagation();
    const cochera = this.filas.find(c => c.id === cocheraId);
    
    if (cochera?.activo) {
      Swal.fire('Advertencia', 'No se puede eliminar una cochera ocupada', 'warning');
      return;
    }
    Swal.fire({
      title: '¿Estás seguro que quieres borrar la cochera?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cocheras.eliminarCochera(cocheraId).then(() => {
          this.traerCocheras();
          Swal.fire({
            title: "Listo!",
            text: "La cochera fue eliminada con éxito.",
            icon: "success"
          });
        });
      }
    });
  }

  cambiarDisponibilidadCochera(cocheraId: number, event: Event) {
    event.stopPropagation();
    if(this.filas[cocheraId].deshabilitada === true){
      this.filas[cocheraId].deshabilitada = false;
    } else {
      this.filas[cocheraId].deshabilitada = true;
    }

  }

  abrirModalNuevoEstacionamiento(idCochera: number) {
    Swal.fire({
      title: "Ingrese la patente del vehículo",
      input: "text",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "Ingrese una patente válida";
        }
        return;
      }
    }).then(res => {
      if (res.isConfirmed) {
        try {
          this.estacionamientos.estacionarAuto(res.value.toUpperCase(), idCochera);
          this.traerCocheras();
          Swal.fire('¡Listo!', 'Vehículo estacionado correctamente', 'success');
        } catch (error) {
          console.error('Error al estacionar:', error);
          Swal.fire('Error', 'No se pudo estacionar el vehículo', 'error');
        }
      }
    });
  }
  cerrarModalEstacionamiento(idCochera: number) {
    const fila = this.filas.find((fila) => fila.id === idCochera)!;
    this.estacionamientos.cerrarEstacionamiento(fila.activo?.patente!).then((res) => {
      return Swal.fire({
        title: "Cobro cochera",
        text: `El precio a cobrar por el tiempo estacionado de la cochera ${idCochera} es $${res.costo}`,
        icon: "info",
        confirmButtonText: "Cobrar"
      }).then((result) => {
        if (result.isConfirmed) {
          const Toast = Swal.mixin({
            toast: true,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.onmouseenter = Swal.stopTimer;
              toast.onmouseleave = Swal.resumeTimer;
            }
          })
        }
      }).then(() => this.traerCocheras()).then(()=> this.siguienteNumero+=1);
    })
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

    