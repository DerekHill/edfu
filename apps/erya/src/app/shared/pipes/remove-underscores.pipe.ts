import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'removeUnderscores' })
export class RemoveUnderscoresPipe implements PipeTransform {
  transform(string: string): string {
    return string.replace('_', ' ');
  }
}
