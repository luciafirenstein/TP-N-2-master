export interface Estacionamiento{
    patente: string;
    estacionamiento:string;
    id: number,
    horaIngreso: string;
    horaEgreso: string|null;
    costo:number;
    idUsuarioIngreso:string;
    idUsuarioEgreso:string|null;
    idCochera: number;
    eliminado:null;
    
}