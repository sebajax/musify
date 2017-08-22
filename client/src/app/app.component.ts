import { Component, OnInit } from '@angular/core';
import { User } from './models/user';
import {UserService} from './services/user.service';
import { GLOBAL } from './services/global';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [UserService]
})

export class AppComponent implements OnInit {
  title = 'MUSIFY';
  public user: User;
  public user_register: User;
  public identity;
  public token;
  public errorMessage;
  public alertRegister: string;
  public url: string;
  
  constructor(private _userService:UserService) {
      this.user = new User('', '', '', '', '', 'ROLE_USER', '');
      this.user_register = new User('', '', '', '', '', 'ROLE_USER', '');
      this.url = GLOBAL.url;
  }
  
  ngOnInit() {
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
  }
  
  public onSubmit() {
      console.log(this.user);
      
      // Conseguir los datos del usuarios identificado
      this._userService.signup(this.user).subscribe(
        response => {
            let identity = response.user;
            this.identity = identity;
            
            if(!this.identity._id) {
                alert("El usuario no esta correctamente identificado");
            }else {
                // Crear elemento en el localstorage para tener al usuario en session
                localStorage.setItem('identity', JSON.stringify(identity));
                
                // Conseguir el token para enviarselo a cada peticion http
                this._userService.signup(this.user, true).subscribe(
                  response => {
                      let token = response.token;
                      this.token = token;

                      if(this.token.length <= 0) {
                          alert("El token no se ha generado correctamente.");
                      }else {
                          // Crear elemento en el localstorage para tener el token disponible
                          localStorage.setItem('token', token);
                          this.user = new User('', '', '', '', '', 'ROLE_USER', '');
                      }
                  },
                  error => {
                      var errorMessage = <any>error;
                      if(errorMessage != null) {
                          var body = JSON.parse(error._body);
                          this.errorMessage = body.message;
                          console.log(errorMessage);
                      }
                  }
                );            
            }
            
        },
        error => {
            var errorMessage = <any>error;
            if(errorMessage != null) {
                var body = JSON.parse(error._body);
                this.errorMessage = body.message;
                console.log(errorMessage);
            }
        }
      );
  }
  
  public onSubmitRegister() {
      console.log(this.user_register);
      
    this._userService.register(this.user_register).subscribe(
        response => {    
            let user = response.user;
            this.user_register = user;
            
            if(!user._id) {
                this.alertRegister = "Error al registrarse";
            }else {
                this.alertRegister = "El registro se ha realizado correctamente, identificate con " + this.user_register.email;
                this.user_register = new User('', '', '', '', '', 'ROLE_USER', '');
            }
        },
        error => {
            var errorMessage = <any>error;
            if(errorMessage != null) {
                var body = JSON.parse(error._body);
                this.alertRegister = body.message;
                console.log(errorMessage);
            }            
        }
    );
  }
  
  public logout() {
      localStorage.removeItem('identity');
      localStorage.removeItem('token');
      localStorage.clear(); //elimina todo
      this.user = new User('', '', '', '', '', 'ROLE_USER', '');
      this.identity = null;
      this.token = null;
  }
  
}