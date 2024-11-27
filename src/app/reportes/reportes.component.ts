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
    this.traerCobros();
  }
  traerCobros() {
    this.filas = [];
    this.cocheras.cocheras().then(cocheras => {
        this.estacionamientos.estacionamientos().then(estacionamientos => {
            const actividadPorMes: { [mes: number]: { usos: number, cobranza: number } } = {};

            // Iterar sobre cada cochera y estacionamiento
            for (const cochera of cocheras) {
                for (const estacionamiento of estacionamientos) {
                    // Filtrar por idCochera y estacionamientos con hora de egreso
                    if (estacionamiento.idCochera === cochera.id && estacionamiento.horaEgreso) {
                        const mes = new Date(estacionamiento.horaEgreso).getMonth() + 1; // Mes basado en 1

                        // Inicializar actividad para el mes si no existe
                        if (!actividadPorMes[mes]) {
                            actividadPorMes[mes] = { usos: 0, cobranza: 0 };
                        }

                        // Validar que costo sea un número antes de sumarlo
                        const costo = estacionamiento.costo ? +estacionamiento.costo : 0;

                        // Sumar uso y cobro
                        actividadPorMes[mes].usos++;
                        actividadPorMes[mes].cobranza += costo;
                    }
                }
            }

            // Convertir actividadPorMes en filas
            Object.keys(actividadPorMes)
                .sort((a, b) => +a - +b) // Ordenar meses numéricamente
                .forEach(mes => {
                    const { usos, cobranza } = actividadPorMes[+mes];
                    this.filas.push({
                        mes: mes.toString(), // Mes como string
                        usos,
                        cobrados: cobranza,
                    });
                });
        });
    });
}

   esMes(fecha:string, mes:number):boolean
   {
    console.log('check', fecha);
    if(fecha != null )
      {
        console.log(fecha, mes);
        var f = new Date(fecha);
        return f.getMonth() == mes;
      }
    return false;
   };


}