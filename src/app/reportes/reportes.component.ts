
import { Component, inject, OnInit } from '@angular/core';
import { EstacionamientoService } from '../serive/estacionamiento.service';
import { ReporteMensual } from '../interfaces/reportes';
import { Estacionamiento } from '../interfaces/estacionamiento';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../serive/auth.service';


@Component({
  selector: 'app-reporte',
  standalone: true,
  imports:[CommonModule, RouterModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss'
})

export class ReportesComponent implements OnInit {

  estacionamientos = inject(EstacionamientoService);
  auth=inject(AuthService)
  reporteEstacionamientos: ReporteMensual[] = [];

  ngOnInit() {
    this.estacionamientoTraerlo();
  }
  
  estacionamientoTraerlo() {
    
    this.estacionamientos.estacionamientos().then(estacionadas => {
      const historialEstacionamientos = estacionadas.filter(estacionada => estacionada.horaEgreso != null);
  
      let mesesTrabajo: string[] = [];
      let meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

      
      for (let estacionada of historialEstacionamientos) {
        const estacionadaConDate = { ...estacionada, horaIngreso: new Date(estacionada.horaIngreso) };
        const periodo = meses[estacionadaConDate.horaIngreso.getMonth()] + " " + estacionadaConDate.horaIngreso.getFullYear();
        if (!mesesTrabajo.includes(periodo)) {
          mesesTrabajo.push(periodo);
          this.reporteEstacionamientos.push({
            nro: this.reporteEstacionamientos.length + 1,
            mes: periodo,
            usos: 1,
            cobrado: estacionada.costo ?? 0
          });
        } else {
          const reporte = this.reporteEstacionamientos.find(r => r.mes === periodo)!;
          reporte.usos++;
          reporte.cobrado += estacionada.costo ?? 0;
        }
      }

    })
  }
  
}






  