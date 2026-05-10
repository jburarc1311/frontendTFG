import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sexo',
})
export class SexoPipe implements PipeTransform {
  transform(value: string): string {
    switch (value.toLowerCase()) {
      case 'hembra': return '<i class="fa-solid fa-venus"></i>';
      case 'macho':  return '<i class="fa-solid fa-mars"></i>';
      default:       return '?';
    }
  }
}
