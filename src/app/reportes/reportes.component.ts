import { Component, inject,} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReportesService } from '../serive/reportes.service';
import { AuthService } from '../serive/auth.service';
import { ReporteMensual } from '../interfaces/reportes';
import { CocherasService } from '../serive/cocheras.service';
import { EstacionamientoService } from '../serive/estacionamiento.service';
@Component({
  selector: 'app-reporte',
  standalone: true,
  imports:[CommonModule, RouterModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss'
})

export class ReporteComponent {
  reporteService = inject(ReportesService);
  auth = inject(AuthService);
  router = inject(Router)
  cocheras = inject(CocherasService);
  estacionamientos = inject(EstacionamientoService);
  
  header: {nro:string,mes:string, usos:string,cobranza:string } = {
    nro: 'N°',
    mes: 'MES',
    usos: 'USO',
    cobranza: 'COBRO',
  };
  
  filas: ReporteMensual[] = [];
  ngOnInit(){
    this.traerCobros().sort(c => c.nro);
   }
   traerCobros(){
      let usos = 0;
      let cobro =0 ;
      this.filas = [];
      this.cocheras.cocheras().then(cocheras => {
          for (let cochera of cocheras ) {//por cada cochera que tengo guardada
            usos = 0;
            cobro = 0;
          this.estacionamientos.estacionamientos().then(est=> {
              let cobro = 0;
              let c = 0;
              for (var i=1;i<13;i++){ //Por cada mes voy y busco
                for (let estacionamiento of est){//por cada estacionamiento veo si cumple con la condicion y sumo.
                  if (estacionamiento.idCochera === cochera.id &&  this.esMes(estacionamiento.horaEgreso!,i)){  //estacionamiento.horaEgreso != null && estacionamiento.horaEgreso){
                    cobro += estacionamiento?.costo!;
                    c++;
                  }
                }
              if(c >0){
                this.filas.push({
                  nro: cochera.id, 
                  mes: i.toString(), //mes 
                  usos: c, // cantidad de veces que use
                  cobrados: cobro, 
                });
              }
             }
            });
          }
      });
    return this.filas.sort( c => c.nro);
   };

   esMes(fecha:string, mes:number):boolean
   {
    if(fecha != null )
      {
        var f = new Date(fecha);
        return f.getMonth() == mes;
      }
    return false;
   };


}