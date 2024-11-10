// reportes.service.ts

import { Injectable } from '@angular/core';
import { ReporteMensual } from '../interfaces/reportes'; 

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private apiUrl = 'http://localhost:4000/reportes';

  constructor() {}

  async actualizarReporteMensual(mes: string, monto: number, usos: number): Promise<any> {
    const url = `${this.apiUrl}/${mes}`; // Construir la URL para el mes específico

    const body = JSON.stringify({ monto, usos }); // Crear el cuerpo de la solicitud

    try {
      const response = await fetch(url, {
        method: 'PATCH', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token'), 
        },
        body: body 
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el reporte mensual');
      }

      const data = await response.json();
      return data; // Devolver la respuesta en formato JSON
    } catch (error: any) {
      console.error('Error al actualizar reporte mensual:', error);
      throw error; 
    }
  }

  // Método para obtener los reportes mensuales
  async obtenerReportesMensuales(): Promise<ReporteMensual[]> {
    const response = await fetch(this.apiUrl, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
  
    if (!response.ok) {
      throw new Error('Error al obtener reportes mensuales');
    }
  
    const reportes = await response.json();
    return reportes;
  
  }
}
