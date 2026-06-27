import { Directive, HostListener } from '@angular/core';

@Directive({ selector: '[appFocusNext]' })
export class FocusNextDirective {
  @HostListener('keydown.enter', ['$event'])
  onEnter(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'textarea') return;

    const form = target.closest('form');
    if (!form) return;

    const fields = Array.from(form.querySelectorAll<HTMLElement>('input, select, textarea, button'))
      .filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1 && el.offsetParent !== null);
    const index = fields.indexOf(target);
    const next = fields[index + 1];

    if (next) {
      event.preventDefault();
      next.focus();
    }
  }
}
