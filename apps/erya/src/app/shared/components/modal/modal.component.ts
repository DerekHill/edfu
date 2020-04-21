import {
  Component, Input, OnDestroy,
  OnInit
} from '@angular/core';
import { ElementRef } from '@angular/core';
import { ModalService } from './modal.service';

@Component({
  selector: 'edfu-modal',
  templateUrl: './modal.component.html'
})
export class ModalComponent implements OnInit, OnDestroy {


  @Input() id: string;
  private element: any;

  constructor(private modalService: ModalService, private el: ElementRef) {
    this.element = el.nativeElement;
  }

  ngOnInit(): void {
    if (!this.id) {
      console.error('modal must have an id');
      return;
    }

    document.body.appendChild(this.element);

    this.element.addEventListener('click', el => {
      console.log(el.target.className);
      if (el.target.className === 'modal-background' || el.target.className === 'modal-close is-large') {
        this.close();
      }
    });

    this.modalService.add(this);
  }

  ngOnDestroy(): void {
    this.modalService.remove(this.id);
    this.element.remove();
  }

  open(): void {
    this.element.firstChild.classList.add('is-active');
    console.log(this.element.firstChild);
  }

  close(): void {
    this.element.firstChild.classList.remove('is-active');
  }
}
