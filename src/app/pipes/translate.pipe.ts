import { Pipe, PipeTransform } from '@angular/core';
import { LenguageService } from '../services/lenguage.service';

@Pipe({
  name: 'translate'
})
export class TranslatePipe implements PipeTransform {

  constructor(
    private translate: LenguageService
  ){

  }

  transform(value: any): any {
    return this.translate.getTranslate(value) ? this.translate.getTranslate(value) : '';
  }

}
