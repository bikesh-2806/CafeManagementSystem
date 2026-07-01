import { Component } from '@angular/core';
import { ConfirmRequest, UiService } from '.././ui.service';

@Component({
  selector: 'app-ui-shell',
  templateUrl: './ui-shell.component.html',
  styleUrls: ['./ui-shell.component.scss']
})
export class UiShellComponent {
  confirmRequest: ConfirmRequest | null = null;

  constructor(public ui: UiService) {
    this.ui.confirm$.subscribe(request => this.confirmRequest = request);
  }

  answer(confirmed: boolean) {
    this.confirmRequest?.resolve(confirmed);
    this.confirmRequest = null;
  }
}
