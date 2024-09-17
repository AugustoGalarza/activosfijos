import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ForgotPasswordRoutingModule } from './forgot-password-routing.module';
import { ForgotPasswordComponent } from './forgot-password.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LenguageService } from '../../services/lenguage.service';
import { translateFactory } from '../../app.module';
import { AppComponent } from '../../app.component';



@NgModule({
  declarations: [ForgotPasswordComponent],
  imports: [

    CommonModule,
    ForgotPasswordRoutingModule,
    ReactiveFormsModule
  ],
  providers: [
    LenguageService,
    {
      provide: APP_INITIALIZER,
      useFactory: translateFactory,
      deps: [LenguageService],
      multi: true
    },
  ],
 
})
export class ForgotPasswordModule { }
