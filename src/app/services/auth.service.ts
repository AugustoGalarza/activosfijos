import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {AngularFireDatabase} from 'angularfire2/database';
import { Registry } from '../models/registry';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public admin = [
     'augustomarcelo1984@gmail.com', 'augustomarce10050@gmail.com', 'robertoalmendras2011@gmail.com', 'augustomarcelo84@hotmail.com' 
  ];

  public User: firebase.User;
  private _isLoggued: boolean;

  set isLoggued(value: boolean) {
    this._isLoggued = value;
  }

  constructor(
    private afAuth: AngularFireAuth,
    private route: Router,
    private afd: AngularFireDatabase
  ){
    this._isLoggued = false;
    // Compruebo si estoy subscrito
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this._isLoggued = true;
        this.route.navigate(['/resume']);
      }
      })
    }
  /**
   * Compruebo si estoy logueado
   */
  isAuthenticated() {
    return this._isLoggued;
  }

  /**
   * Me logueo dado un email y contraseña, devuelve una promesa
   * @param email email del usuario
   * @param pass pass del usuario
   */
  login(email: string, pass: string) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, pass);
  }

  /**
   * Nos desploguea de la aplicacion
   */
  logout() {
    this.afAuth.auth.signOut();
    this._isLoggued = false;
    this.route.navigate(['/login']);
  }

  /**
   * Comprueba si el usuario existe, dado un email
   * @param email email del usuario a comprobar
   */
  checkAccount(email) {
    return this.afAuth.auth.isSignInWithEmailLink(email);
  }

  /**
   * Devuelve el usuario actual
   */
  /**
   * Devuelve el usuario actual
   */
   currentUser() {
    if (this.afAuth.auth.currentUser) {
      this.afAuth.auth.currentUser.email
      console.log(this.afAuth.auth.currentUser.email) 
     
    return '';
  }

}
  /**
   * Crea una cuenta dado un email y un pass. Devuelve una promesa
   * @param email email del usuario a crear
   * @param pass pass del usuario a crear
   */
  createAccount(email: string, pass: string) {

    // Chequeo si la cuenta existe
    // Chequeo si la cuenta existe
    if(this.checkAccount(email)){
      return new Promise((resolve, reject) => {
        reject('el usuario ya existe')
    
          })
        } else {
          // Creo la cuenta y devuelvo una promesa con el estado
          return this.afAuth.auth.createUserWithEmailAndPassword(email, pass).then(authState => {
            return authState;
          }).catch(error => {
            throw error;
          })
        }
    
      }
  
  async resetPassword(email: string): Promise<void> {
    try {
      return this.afAuth.auth.sendPasswordResetEmail(email);
    } catch (error) {
      console.log(error);
    }
  }
}