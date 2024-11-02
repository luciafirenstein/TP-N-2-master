import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../serive/auth.service';

@Component({
  selector: 'app-header-component',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header-component.component.html',
  styleUrl: './header-component.component.scss'
})
export class HeaderComponentComponent {
  esAdmin:boolean= false;
  auth= inject(AuthService)
  
  resultadoInput: string=";"

  abrirModal(){
    Swal.fire({
      title: "Enter your IP address",
      input: "text",
      inputLabel: "Your IP address",
      inputValue:"",
      showCancelButton: true,
    }).then((result)=>{
      this.resultadoInput=result.value;
    });
  }
}
