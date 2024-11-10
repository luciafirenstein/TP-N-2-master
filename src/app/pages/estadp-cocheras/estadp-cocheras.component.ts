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
eliminarFila(index: number, event: Event) {
  event.stopPropagation(); // Evita que el evento se propague al resto de la aplicación

  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      // Eliminar la fila del array de filas
      this.filas.splice(index, 1);
    }
  });
}
   


abrirModalPago(idCochera: number, patente: string) {
  console.log('idCochera:', idCochera);
  console.log('patente:', patente);

  if (!patente) return;  // Asegúrate de que la patente esté presente

  // Aquí puedes hacer una llamada al servicio para obtener el monto a pagar de esta patente
  this.estacionamientos.obtenerMontoAPagar(patente).then(monto => {
    // Muestra el modal con el monto a pagar
    Swal.fire({
      title: 'Monto a Pagar',
      text: `El monto a pagar es: $${monto}`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Liberar Cochera',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Si el usuario confirma, libera la cochera
        this.estacionamientos.liberarCochera(idCochera, patente).then(() => {
          Swal.fire('Cochera Liberada', 'La cochera ha sido liberada', 'success');
          this.traerCocheras();  // Refresca las cocheras
        });
      }
    });
  }).catch(error => {
    Swal.fire('Error', 'No se pudo obtener el monto', 'error');
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

    