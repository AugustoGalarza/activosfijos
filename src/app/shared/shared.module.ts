import { TranslatePipe } from './../pipes/translate.pipe';

// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Module
import { CalendarModule } from 'primeng/calendar';

// Components

import { DetailComponent } from './components/detail/detail.component';
import { FilterComponent } from './components/filter/filter.component';



@NgModule({
  imports: [
    
    CommonModule,
    FormsModule,
    CalendarModule,
    
  ],
  declarations: [
    
   
    DetailComponent,
    FilterComponent,
    TranslatePipe,
   


    
  ],
  exports: [
   
    DetailComponent,
    FilterComponent,
    TranslatePipe,
    FormsModule,
    
  ]
})
export class SharedModule { }
