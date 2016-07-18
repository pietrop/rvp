import { Directive, Input, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[scrollContainer], [scroll], [zoom]'
})
export class ScrollZoom implements OnInit {
  @Input('scrollContainer') containerSelector;

  // set width of content element: [px]
  // content element is the first child
  @Input() set zoom(value:number) {
    // log.debug('setting zoom', value);
    if (value > 0) {
      this._zoom = value;
      if (this.content) {
        this.content.style.width = this._zoom + "px";
      }
    }
  }

  // set scroll position of container: 0..100 [%]
  // TODO: need to take into account the width of the container
  @Input() set scroll(value:number) {
    // log.debug('setting scroll', value);
    if (value >= 0 && value <= 100) {
      this._scroll = value;
      if (this.container) {
        this.container.scrollLeft = this._zoom * this._scroll / 100;
      }
    }
  }


  private _zoom;
  private _scroll;
  private host:HTMLElement;
  private container:HTMLElement;
  private content:HTMLElement;

  constructor(hostElement:ElementRef) {
    this.host = hostElement.nativeElement;
  }

  ngOnInit() {
    setTimeout(() => {
      if (this.containerSelector) {
        this.container = this.host.querySelector(this.containerSelector) as HTMLElement;
      } else {
        this.container = this.host;
      }
      this.container.style.overflow = 'hidden';

      this.content = this.container.firstElementChild as HTMLElement;
      // trigger setting zoom and scroll, when this.content is available
      if (this._zoom) this.zoom = this._zoom;
      if (this._scroll) this.scroll = this._scroll;

      // log.debug('scrollzoom', this.container, this.content);
    }, 0);
  }
}