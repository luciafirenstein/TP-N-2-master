import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';




@Component({
  selector: 'app-reporte',
  standalone: true,
  imports: [RouterLink, CommonModule],
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