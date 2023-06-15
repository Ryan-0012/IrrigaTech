import { Component } from '@angular/core';
import { AccountService } from './services/account.service';
import { JsonPipe, ViewportScroller } from '@angular/common';
import { SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'IrrigaTech-UI';
  screenWidth!: number;

  readonly VAPID_PUBLIC_KEY = 'BLg5XlFaotXLBDWqoWAWzwxEikcdUuHWGrQ2cKhCl1_hVNIN3vZ5iA8-ofqgJSMX98wh3myTXIojUPkSWaFDk_M';

  constructor(public accountService: AccountService, private viewportScroller: ViewportScroller, 
    private swPush: SwPush, private http: HttpClient) {
      this.swPush.requestSubscription( {
        serverPublicKey: this.VAPID_PUBLIC_KEY
      }).then(sub => {
      const token = JSON.parse(JSON.stringify(sub));
      console.log('****** OJOOO ********', token);
        this.http.post('http://localhost:9000/add-subscription', sub)
          .subscribe();
      }).catch(err => {
        console.error('Usuário recusou ou Navegador não suporta', err);
      });
    }
  ngOnInit() {
    this.screenWidth = window.innerWidth;
    window.addEventListener('resize', () => {
      this.screenWidth = window.innerWidth;
    });
  }
}
