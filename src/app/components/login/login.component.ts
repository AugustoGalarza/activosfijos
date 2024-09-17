import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ConfigService } from '../../services/config.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { ReCaptcha2Component } from 'ngx-captcha';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  protected aFormGroup: FormGroup;
  @ViewChild('captchaElem') captchaElem: ReCaptcha2Component;
  @ViewChild('langInput') langInput: ElementRef;
 
  public captchaIsLoaded = false;
  public captchaSuccess = false;
  public captchaIsExpired = false;
  public captchaResponse?: string;
 public validCaptcha: boolean= true;
  public theme: 'light' | 'dark' = 'dark';
  public size: 'compact' | 'normal' = 'normal';
  public lang = 'en';
  public type: 'image' | 'audio';
  public formLogin: FormGroup;
  public showLoginError: boolean;
  public fieldTextType: boolean;
  public repeatFieldTextType: boolean;
  constructor(
    private afAuth: AngularFireAuth,
    private formBuilder: FormBuilder,
    public config: ConfigService,
    private authService: AuthService,
    private route: Router
  ) {
    // Creo el formgroup

    this.formLogin = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      pass: new FormControl('', Validators.required)
    })
    this.showLoginError = false;
  }

  ngOnInit() {
    this.aFormGroup = this.formBuilder.group({
      recaptcha: ['', Validators.required]
    });
  }
 
 
  /**
   * Compruebo si el login es correcto
   */
   handleSuccess(data) {
    console.log(data);
  }
  handleError(data){
console.log(data)
  }

  checkLogin() {

    // Cojo el email y el pass
    let email = this.formLogin.get('email').value
    let pass = this.formLogin.get('pass').value

    // Nos logueamos
    this.authService.login(email, pass).then(state => {

      console.log(state);

      this.route.navigate(['/resume'])

    }, error => {
      console.error(error);
      this.showLoginError = true;
    })

  }
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  toggleRepeatFieldTextType() {
    this.repeatFieldTextType = !this.repeatFieldTextType;
  }
}


