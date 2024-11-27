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
  this.cocheras.precio();
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
    this.cocheras.crearCochera().then(()=>this.traerCocheras());
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
        // Use the fetch method you already have to delete the cochera
        fetch('http://localhost:4000/cocheras/' + cocheraId, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer ' + this.auth.getToken(),
          },
        }).then(() => {
          // Refresh the cocheras list after deletion
          this.traerCocheras().then(() => {
            this.sortCocheras();
            
            Swal.fire({
              title: "Listo!",
              text: "La cochera fue eliminada con éxito.",
              icon: "success"
            });
          });
        }).catch(error => {
          console.error('Error al eliminar cochera:', error);
          Swal.fire({
            title: "Error",
            text: "No se pudo eliminar la cochera.",
            icon: "error"
          });
        });
      }
    });
  }

  cambiarDisponibilidadCochera(cocheraId: number, event: Event) {
    event.stopPropagation();
    const cochera = this.filas.find(c => c.id === cocheraId);
    if (cochera) {
      cochera.deshabilitada = !cochera.deshabilitada;
    } else {
      console.error(`Cochera con ID ${cocheraId} no encontrada.`);
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
    
    Swal.fire({
      title: "Cerrar Estacionamiento",
      text: "¿Está seguro que desea cerrar este estacionamiento?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar",
      cancelButtonText: "Cancelar"
    }).then((closeConfirmation) => {
      if (closeConfirmation.isConfirmed) {
        return this.estacionamientos.obtenerMontoAPagar(idCochera)
          .then((res) => {
            const costo = res.costo ?? 0; // Si `res.costo` es null, asignar 0 como valor predeterminado.
            return Swal.fire({
              title: "Cobro cochera",
              text: `El precio a cobrar por el tiempo estacionado de la cochera ${idCochera} es $${res.costo}`,
              icon: "info",
              confirmButtonText: "Cobrar"
            });
          })
          .then((result) => {
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
              });
    
              Toast.fire({
                icon: 'success',
                title: 'Cobro realizado exitosamente'
              });
    
              return this.estacionamientos.cerrarEstacionamiento(fila.activo?.patente!)
                .then(() => this.traerCocheras())
                .then(() => {
                  this.siguienteNumero += 1;
                });
            }
            return Promise.resolve(); // Manejar el caso en que no se confirme
          })
          .catch((error) => {
            Swal.fire({
              title: "Error",
              text: "No se pudo procesar el cobro",
              icon: "error"
            });
            console.error("Error al procesar el cobro:", error);
            return Promise.resolve(); // Asegurar un valor de retorno en el bloque catch
          });
      }
      return Promise.resolve(); // Manejar el caso en que no se confirme
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

    