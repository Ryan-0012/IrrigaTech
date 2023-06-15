import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { SchedulingService } from 'src/app/services/scheduling.service';

@Component({
  selector: 'app-humidity-status',
  templateUrl: './humidity-status.component.html',
  styleUrls: ['./humidity-status.component.css']
})
export class HumidityStatusComponent implements OnInit {

  porcentagem1 = 100;
  valor = 0;
  statusValue: number = 0;
  private socket: Socket;

  constructor(private renderer: Renderer2, private schedulingService: SchedulingService,) {
    this.socket = io('http://localhost:9000');

    this.socket.on('valorRecebido', (valor: string) => {
      console.log('Valor recebido do servidor Node:', valor);
      this.statusValue = parseInt(valor);
      this.updateProgressBar();
    });

    this.updateProgressBar(); // Atualiza o valor inicial da barra de progresso
  }

  ngOnInit(): void {
    this.schedulingService.getStatus();
    const root = document.documentElement;
    root.style.setProperty('--meu-valor', `${this.valor}px`);
  }

  updateProgressBar() {
    const root = document.documentElement;
    const progress = this.statusValue / 100;
    this.valor = 260 - progress * 260;
    root.style.setProperty('--meu-valor', `${this.valor}px`);
  }
  

  restartAnimation() {
    const progressBar = document.querySelector('.progress .fill') as SVGPathElement | null;
    if (progressBar) {
      progressBar.style.animation = 'none';
      progressBar.getBoundingClientRect();
      progressBar.style.animation = '';
    }
  }

}
