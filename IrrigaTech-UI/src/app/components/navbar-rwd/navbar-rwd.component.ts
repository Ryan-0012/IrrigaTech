import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar-rwd',
  templateUrl: './navbar-rwd.component.html',
  styleUrls: ['./navbar-rwd.component.css']
})
export class NavbarRwdComponent {

  window!: Window;
  ngOnInit(): void {
    this.window = window;
  }
  
  setActiveLink(event: Event) {
    event.preventDefault();
    const list = document.querySelectorAll('.list');
    list.forEach((item) => item.classList.remove('active'));
    const target = event.currentTarget as HTMLElement;
    target.classList.add('active');
  }

}
