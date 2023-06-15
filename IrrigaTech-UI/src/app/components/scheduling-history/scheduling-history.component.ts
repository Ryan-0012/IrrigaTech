import { Component } from '@angular/core';
import { IrrigationHistory } from 'src/app/models/schedule/irrigation-history.models';
import { AccountService } from 'src/app/services/account.service';
import { SchedulingService } from 'src/app/services/scheduling.service';

@Component({
  selector: 'app-scheduling-history',
  templateUrl: './scheduling-history.component.html',
  styleUrls: ['./scheduling-history.component.css']
})
export class SchedulingHistoryComponent {
  irrigationsHistorys!: IrrigationHistory[];
  applicationUserId!: number;

  constructor(
    private schedulingService: SchedulingService, 
    private accountService: AccountService,
  ){}

  ngOnInit(): void {
    this.irrigationsHistorys = [];

    let currentApplicationUserId = this.accountService.currentUserValue?.applicationUserId;
    
    if(currentApplicationUserId) this.applicationUserId = currentApplicationUserId;

    if(currentApplicationUserId != null){
      this.schedulingService.getHistoryByApplicationUserId(currentApplicationUserId).subscribe(irrigationHistorys => {
        this.irrigationsHistorys = irrigationHistorys;
      });
      
    }
    console.log(this.irrigationsHistorys);
  }


}
