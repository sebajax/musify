import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { GLOBAL } from './global'

@Injectable()
export class UploadService {
    public url: string;
    
    constructor(private _http: Http) {
        this.url = GLOBAL.url;
    }
    
    uploadImage(url, params: Array<string>, files: Array<File>, token: string, name: string) {
        var formData:any = new FormData();
        
        for(var i = 0; i < files.length; i++) {
            formData.append(name, files[i], files[i].name);
        }        
        
        let headers = new Headers({
            'Authorization': token
        });
          
        return this._http.post(url, formData, {headers: headers})
            .map(res => res.json());        
    }    
}
