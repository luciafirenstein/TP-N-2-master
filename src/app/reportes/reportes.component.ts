
import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponentComponent } from '../components/header-component/header-component.component';
import { EstacionamientoService } from '../serive/estacionamiento.service';
import { ReporteMensual } from '../interfaces/reportes';
import { Estacionamiento } from '../interfaces/estacionamiento';
import { RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../serive/auth.service';


@Component({
  selector: 'app-reporte',
  standalone: true,
  imports: [RouterLink, CommonModule, HeaderComponentComponent, RouterModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss'
})

export class ReportesComponent implements OnInit {

  estacionamientos = inject(EstacionamientoService);
  auth=inject(AuthService)
  historialEstacionamientos: Estacionamiento[] = [];
  reporteEstacionamientos: ReporteMensual[] = [];
reporte: any;

  ngOnInit() {
    this.estacionamientoTraerlo();
  }
  
  estacionamientoTraerlo() {
    fetch('http://localhost:4000/estacionamientos', {
      method: 'GET',
      headers: {
        authorization: 'Bearer ' + this.auth.getToken()
      }
    })
      .then((response) => response.json())
      .then((data: Estacionamiento[]) => { 
        const historialEstacionamientos = data.filter(estacionada => estacionada.horaEgreso != null);

        let mesesTrabajo: string[] = [];
        let meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

    this.estacionamientos.estacionamientos().then(estacionadas => {
      for (let estacionada of estacionadas) {
        if (estacionada.horaEgreso != null) {
          this.historialEstacionamientos.push(estacionada);
        }
      }

      this.historialEstacionamientos.sort((a, b) => {
        if (a.horaIngreso > b.horaIngreso) {
          return 1;
        }
        if (a.horaIngreso < b.horaIngreso) {
          return -1;
        }
        return 0;
      });

      
      for (let estacionada of this.historialEstacionamientos) {
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
)}
}




  