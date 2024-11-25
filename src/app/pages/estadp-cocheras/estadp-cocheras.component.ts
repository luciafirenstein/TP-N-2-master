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
siguienteNumero: number = 1;

auth=inject(AuthService);
estacionamientos=inject(EstacionamientoService);
cocheras=inject(CocherasService);

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

agregarFila() {
  Swal.fire({
    title: '¿Deseas agregar una nueva cochera?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, agregar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      const nuevaCochera = {
        id: this.siguienteNumero,
        descripcion: `Cochera ${this.siguienteNumero}`,
        deshabilitada: false,
        eliminada: false,
        activo: null
      };
      
      this.filas.push(nuevaCochera);
      this.siguienteNumero += 1;
      this.sortCocheras();
      Swal.fire('¡Listo!', 'La cochera ha sido agregada', 'success');
    }
  });
}

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
    const cochera = this.filas.find(c => c.id === cocheraId);
    if (cochera?.activo) {
      this.cerrarModalEstacionamiento(cocheraId, cochera.activo.patente);
    } else {
      this.abrirModalNuevoEstacionamiento(cocheraId);
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

    