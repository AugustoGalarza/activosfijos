import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LenguageService {

  private _data: any;

  constructor(private http: HttpClient) {
  }

  /**
   * Obtengo las traducciones, depende del lenguaje del navegador
   */
  public getData() {
    return new Promise((resolve, reject) => {
      this.http.get('assets/lenguage/' + navigator.language.split("-")[0] + '.json')
        .subscribe(data => {
          this._data = data;
          resolve(true);
        }, error => {
          console.log('Error al recuperar las traducciones: ' + error);
          reject(true);
        });
    })


  }

  /**
   * Obtengo una traduccion en concreto
   */
  public getTranslate(phrase: string) {
    return this._data[phrase];
  }


}
