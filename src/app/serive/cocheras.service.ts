import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CocherasService {
  auth= inject(AuthService);
  cocheras(){
    return fetch ('https://localhost:4200/cocheras',{
      method: 'GET',
      headers:{
        authorization: "Bearer "+(this.auth.getToken()??''),
      },
    }).then(r=>r.json());
  }
}
