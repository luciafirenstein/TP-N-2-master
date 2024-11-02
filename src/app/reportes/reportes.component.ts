// reportes.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-reporte',
  standalone: true,
  imports: [],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss'
})
export class ReporteComponent {
    header: { nro:string, mes: string, usos:string, cobranza: string} = {
       nro: 'N°',
       mes: 'MES',
       usos: 'USOS',
       cobranza: 'COBRANZA',
    };
}