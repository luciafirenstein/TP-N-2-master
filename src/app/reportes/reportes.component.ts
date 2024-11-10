
import { Component, inject } from '@angular/core';
import { HeaderComponentComponent } from '../components/header-component/header-component.component';
import { EstacionamientoService } from '../serive/estacionamiento.service';
import { ReporteMensual } from '../interfaces/reportes';
import { Estacionamiento } from '../interfaces/estacionamiento';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-reporte',
  standalone: true,
  imports: [RouterLink, CommonModule, HeaderComponentComponent],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss'
})

export class ReportesComponent {

  estacionamientos = inject(EstacionamientoService);
  historialEstacionamientos: Estacionamiento[] = [];
  reporteEstacionamientos: ReporteMensual[] = [];
reporte: any;

  ngOnInit() {
    this.estacionamientoTraerlo();
  }

  estacionamientoTraerlo() {
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

      let mesesTrabajo: string[] = [];
      let meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

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
}