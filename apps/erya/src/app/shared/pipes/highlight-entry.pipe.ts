import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'highlightEntry' })
export class HighlightEntryPipe implements PipeTransform {
  transform(text: string, sign: string): string {
    const highlighted = text
      .split(sign)
      .join(`<span class="has-text-weight-bold">${sign}</span>`);
    return `‘${highlighted}’`;
  }
}
