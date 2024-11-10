export interface Estacionamiento{
    patente: string;
    id: number,
    horaIngreso: string;
    horaEgreso: string|null;
    costo:number|null;
    idUsuarioIngreso:string;
    idUsuarioEgreso:string|null;
    idCochera: number;
    eliminado:null;
    
}