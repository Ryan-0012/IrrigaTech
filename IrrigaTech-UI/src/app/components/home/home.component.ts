import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AccountService } from 'src/app/services/account.service';


interface Mensagem {
  topic: string;
  message: string;
}

interface Agendamento {
  user_id: number;
  irrigation_id: number;
  day_week: number;
  date: string;
  time: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  mensagem: Mensagem = { topic: 'Teste-IrrigaTech', message: 'on' };
  mensagem2: Mensagem = { topic: 'Teste-IrrigaTech', message: 'off' };
  window!: Window;
  username!: string;
  showNavbar: boolean = true;

  constructor(private http: HttpClient, private accountService: AccountService) {
    
  }

  ngOnInit(): void {
    if(this.accountService.currentUserValue?.username)
      this.username = this.accountService.currentUserValue?.username
  }

  enviarMensagem() {
    this.http.post('http://localhost:9000/api/mqtt', this.mensagem)
      .subscribe(
        (response) => {
          console.log('Mensagem enviada com sucesso!');
        },
        (error) => {
          console.error('Erro ao enviar mensagem:', error);
        }
      );
  }

  enviarAgendamento() {
    const agendamento: Agendamento = {
      user_id: 1,
      irrigation_id: 1,
      day_week: 2,
      date: '2023-05-10',
      time: '10:30:00'
    };
  
    const mensagem: Mensagem = {
      topic: 'Schedule-Irrigation',
      message: JSON.stringify(agendamento)
    };
  
    this.http.post('http://localhost:9000/api/mqtt', mensagem)
      .subscribe(
        (response) => {
          console.log('Agendamento enviado com sucesso!');
        },
        (error) => {
          console.error('Erro ao enviar agendamento:', error);
        }
      );
  }

  enviarMensagem2() {
    this.http.post('http://localhost:9000/api/mqtt', this.mensagem2)
      .subscribe(
        (response) => {
          console.log('Mensagem enviada com sucesso!');
        },
        (error) => {
          console.error('Erro ao enviar mensagem:', error);
        }
      );
  }
  
}
