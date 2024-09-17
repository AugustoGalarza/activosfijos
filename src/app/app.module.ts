
// Angular
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireModule } from '@angular/fire';
import {NgQrScannerModule} from 'angular2-qrscanner'
// Modules
import { AppRoutingModule } from './app-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from './shared/shared.module';
import { CalendarModule } from 'primeng/calendar';
import {ChartModule} from 'primeng/chart';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';

// Services
import { LenguageService } from './services/lenguage.service';
import { ConfigService } from './services/config.service';

// Components
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { AddAssettypeComponent } from './components/add-assettype/add-assettype.component';
import { AddRegistryComponent } from './components/header/add-registry/add-registry.component';
import { ResumeComponent } from './components/resume/resume.component';
import { GraphicsComponent } from './components/graphics/graphics.component';
import { LoginComponent } from './components/login/login.component';
import { CreateAccountComponent } from './components/create-account/create-account.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {MatTableExporterModule} from 'mat-table-exporter';
import {CdkTableExporterModule} from 'cdk-table-exporter';
import localeEs from '@angular/common/locales/es';
import {registerLocaleData} from '@angular/common';
registerLocaleData(localeEs, 'es');
import { CommonModule, DatePipe } from '@angular/common';
import { NgxCaptchaModule } from 'ngx-captcha';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

export function translateFactory(provider: LenguageService) {
  return () => provider.getData();
}

export function configFactory(provider: ConfigService) {
  return () => provider.getData();
}

export function configDateFactory(provider: ConfigService) {
  return () => provider.getDateConfig();
}

const firebaseConfig = {
  apiKey: "AIzaSyBKMv5V2K9fNjblhjwJvl_AFYb86qMqewU",
  authDomain: "registroactivossanroque.firebaseapp.com",
  databaseURL: "https://registroactivossanroque-default-rtdb.firebaseio.com",
  projectId: "registroactivossanroque",
  storageBucket: "registroactivossanroque.appspot.com",
  messagingSenderId: "15475879739",
  appId: "1:15475879739:web:e19e59bc5e8c8a3760d11e",
  measurementId: "G-PZLEM5710W"
};
@NgModule({
 
  declarations: [

    AppComponent,
    HeaderComponent,
    AddAssettypeComponent,
    AddRegistryComponent,
    ResumeComponent,
    GraphicsComponent,
    LoginComponent,
    CreateAccountComponent,

  ],

  imports: [
   
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,  
    SharedModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    NgxCaptchaModule,
    ScrollingModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    NgbModule,
    NgxPaginationModule,
    CalendarModule,
    ChartModule,
    CommonModule,
    MatTableExporterModule,
    CdkTableExporterModule,
    AngularFirestoreModule, // firestore
    AngularFireAuthModule, // auth
    AngularFireStorageModule, // storage
    ZXingScannerModule,
    NgQrScannerModule,
 
    
    

  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],

  providers: [
    DatePipe,
    LenguageService,
    {provide: LOCALE_ID, useValue:'es'},
    {
      provide: APP_INITIALIZER,
      useFactory: translateFactory,
      deps: [LenguageService],
      multi: true
    },
    ConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: configFactory,
      deps: [ConfigService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: configDateFactory,
      deps: [ConfigService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
