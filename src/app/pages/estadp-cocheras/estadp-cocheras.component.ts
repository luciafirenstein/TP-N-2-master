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


async traerCocheras() {
  const cocheras = await this.cocheras['cocheras']();
  
  // Utilizar Promise.all para esperar a que todas las promesas se resuelvan
  const filasConEstacionamientos = await Promise.all(
    cocheras.map(async (cochera: { id: number; }) => {
      const estacionamiento = await this.estacionamientos.buscarEstacionamientoActivo(cochera.id);
      return {
        ...cochera,
        activo: estacionamiento,
      };
    })
  );
  
  // Actualizar filas con los datos completos
  this.filas = filasConEstacionamientos;
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
    Swal.fire({
      title: '¿Estás seguro que quieres borrar la cochera?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Listo!",
          text: "La cochera fue eliminada con éxito.",
          icon: "success"
        });
        this.cocheras.eliminarCochera(cocheraId).then(() => {
          this.traerCocheras();
        });
      }
    });
  }

  cambiarDisponibilidadCochera(cocheraId: number, event: Event) {
    const cochera = this.filas.find(c => c.id === cocheraId);
    if (cochera?.activo) {
      this.abrirModalNuevoEstacionamiento(cocheraId);
    } else {
      this.cocheras.cambiarDisponibilidadCochera(cocheraId).then(() => {
        this.traerCocheras();
      });
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
        this.estacionamientos.estacionarAuto(res.value, idCochera).then(() => {
          this.traerCocheras();
        });
      }
    });
  }

cerrarModalEstacionamiento(idCochera: number, patente: string) {
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
          if (!r.ok) throw new Error("Error en la respuesta del servidor");
          return r.json();
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

    