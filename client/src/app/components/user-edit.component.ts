import { Component, OnInit } from '@angular/core';
import { User } from '../models/user';
import {UserService} from '../services/user.service';
import { GLOBAL } from '../services/global';
import * as $ from "jquery";

@Component({
  selector: 'user-edit',
  templateUrl: '../views/user-edit.html',
  providers: [UserService]
})

export class UserEditComponent implements OnInit {
    public titulo: string;
    public user: User;
    public identity;
    public token;
    public alertMessage;
    public filesToUpload: Array<File>;
    public url: string;
    
    constructor(
        private _userService: UserService,
    ) {
        this.titulo = "Actualizar mis datos";
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();         
        this.user = this.identity;
        this.url = GLOBAL.url;
    }
    
    ngOnInit() {
        console.log('user-edit.component.ts cargado con exito');
    }
    
    public onSubmit() {
        this._userService.userUpdate(this.user).subscribe(
            response => {
                if(!response.user) {
                    this.alertMessage = "El usuario no se ha actualizado";
                }else {
                    localStorage.setItem('identity', JSON.stringify(this.user));
                    $("#identity_name").html(this.user.name);
                                    
                    if(!this.filesToUpload) {
                        //reedireccion
                    }else {
                        this._userService.uploadImage(this.url+'upload-image-user/'+this.user._id, [], this.filesToUpload)
                            .subscribe(
                                response => {
                                    this.user.image = response.image;
                                    localStorage.setItem('identity', JSON.stringify(this.user));
                                    let image_path = this.url+'get-image-user/'+this.user.image;
                                    $("#image_logged").attr("src", image_path);
                                    console.log(this.user);    
                                    this.alertMessage = "Usuario actualizado";                      
                                },
                                error => {
                                    var errorMessage = <any>error;
                                    if(errorMessage != null) {
                                        var body = JSON.parse(error._body);
                                        this.alertMessage = body.message;
                                        console.log(errorMessage);
                                    }                     
                                }
                            );
                    }
                }
            },
            error => {
                var errorMessage = <any>error;
                if(errorMessage != null) {
                    var body = JSON.parse(error._body);
                    this.alertMessage = body.message;
                    console.log(errorMessage);
                }                 
            }
        );
    }
    
    fileChangeEvent(fileInput: any) {
        this.filesToUpload = <Array<File>>fileInput.target.files;
    }
}