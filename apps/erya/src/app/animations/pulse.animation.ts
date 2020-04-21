import { animate, style, animation, keyframes } from '@angular/animations';

export const pulseAnimation = animation([
  animate(
    '{{ timings }}',
    keyframes([
      style({ transform: 'scale({{ startScale }})', offset: 0 }),
      style({
        transform: 'scale({{ middleScale }}) rotate({{ rotate }})',
        offset: 0.3
      }),
      style({ transform: 'scale({{ endScale }})', offset: 0.5 })
    ])
  )
]);
