import { Component, inject, OnInit } from '@angular/core';
import { EstacionamientoService } from '../serive/estacionamiento.service';
import { ReporteMensual } from '../interfaces/reportes';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CocherasService } from '../serive/cocheras.service';


@Component({
  selector: 'app-reporte',
  standalone: true,
  imports:[CommonModule, RouterModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss'
})
export class ReportesComponent implements OnInit {
    titulo: string = "Estado de la cochera";
    header: {mes: string, usos: string, cobrado: string } = {
      mes: "Mes",
      usos: 'Usos',
      cobrado: 'Cobrado',
    };
  
    reportes: ReporteMensual[] = [];
    cochera = inject(CocherasService);
    estacionamientos = inject(EstacionamientoService);

    ngOnInit(){
      this.traerEstacionamientos().then(res => {
        this.reportes = res;
        console.log(res)
      })
  
    };
  
    traerCocherasById(id: number){
      this.cochera.getCocherasById(id).then(cochera => {
        console.log(cochera)
      })
    };
  
    //<Estacionamiento[]>//
    async traerEstacionamientos(){
       const estacionamientos = await this.estacionamientos.estacionamientos();
      let reportes: ReporteMensual[] = [];

      for (let estacionamiento of estacionamientos) {
        if (estacionamiento.horaEgreso !== null) {
          let fecha = new Date(estacionamiento.horaEgreso);
          let mes = fecha.toLocaleDateString("es-Cl", {
            month: "numeric",
            year: "numeric",
          });
          const indiceMes = reportes.findIndex((res) => res.mes === mes);
          const costo = estacionamiento.costo ?? 0; // Manejo de valor nulo
          if (indiceMes === -1) {
            reportes.push({
              mes: mes,
              usos: 1,
              cobrados: costo,
            });
          } else {
            reportes[indiceMes].usos = +1;
            reportes[indiceMes].cobrados += costo;
          }
        }
      }
      return reportes;
      };
    }
  
  
