import { Component } from '@angular/core';

@Component({
  selector: 'app-simple-page',
  templateUrl: './simple-page.component.html',
  styleUrls: ['./simple-page.component.scss']
})
export class SimplePageComponent {
  title = 'About HomeTown Cafe';
  body = 'A full-stack restaurant management system for admins, staff, and customers.';
}
