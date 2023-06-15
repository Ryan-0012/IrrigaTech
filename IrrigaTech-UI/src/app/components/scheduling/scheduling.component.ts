import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IrrigationDialogComponent } from '../irrigation-dialog/irrigation-dialog.component';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import { IrrigationCreate } from 'src/app/models/schedule/irrigation-create.models';
import { Time } from '@angular/common';
import { SchedulingService } from 'src/app/services/scheduling.service';
import { AccountService } from 'src/app/services/account.service';
import { ApplicationUserCreate } from 'src/app/models/account/application-user-create.models';
import { ApplicationUserLogin } from 'src/app/models/account/application-user-login.models';
import { Irrigation } from 'src/app/models/schedule/irrigation.models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-scheduling',
  templateUrl: './scheduling.component.html',
  styleUrls: ['./scheduling.component.css']
})
export class SchedulingComponent implements OnInit {

  userIrrigations!: Irrigation[];

  applicationUserId!: number;

  startTime!: string;
  duration!: string;
  daysOfWeek!: number[] | null | undefined;
  specificDate!: string | null | undefined;

  startTimeEdit!: string;
  durationEdit!: string;
  daysOfWeekEdit!: number[] | null | undefined;
  specificDateEdit!: string | null | undefined;

  constructor(
    public dialog: MatDialog, 
    private schedulingService: SchedulingService, 
    private accountService: AccountService, 
    private router: Router, 
    private toastr: ToastrService
  ){ }
  ngOnInit(): void {
    this.userIrrigations = [];

    let currentApplicationUserId = this.accountService.currentUserValue?.applicationUserId;
    
    if(currentApplicationUserId) this.applicationUserId = currentApplicationUserId;

    if(currentApplicationUserId != null){
      this.schedulingService.getByApplicationUserId(currentApplicationUserId).subscribe(userIrrigations => {
        this.userIrrigations = userIrrigations;
      }); 
    }
  }

  openDialog() {
    let formattedDate: string | null = null;
    const dialogRef = this.dialog.open(IrrigationDialogComponent, {
      data: {
        startTime: this.startTime,
        duration: this.duration,
        daysOfWeek: this.daysOfWeek,
        specificDate: this.specificDate
      },
      width: '500px',
      height: '500px'
    });
    dialogRef.afterClosed().subscribe((result) => {
      
      
      if(result.specificDate){ 
        
        const day = result.specificDate.getDate().toString().padStart(2, '0');
        const month = (result.specificDate.getMonth() + 1).toString().padStart(2, '0');
        const year = result.specificDate.getFullYear().toString();
        formattedDate = `${year}-${month}-${day}`;
        console.log(formattedDate);
      }
      
      if (result)  {
        console.log('teste de envio 1');
        result.startTime = result.startTime + ":00"
        const irrigationData: IrrigationCreate = {
          id: "",
          applicationUserId: this.applicationUserId,
          startTime: result.startTime,
          duration: result.duration,
          daysOfWeek: result.daysOfWeek,
          specificDate: formattedDate
        };
        console.log(irrigationData.applicationUserId);
        console.log(irrigationData.startTime);
        console.log(irrigationData.duration);
        console.log(irrigationData.daysOfWeek);
        console.log(irrigationData.specificDate);

        // Use irrigationData conforme necessário
        this.schedulingService.scheduler(irrigationData).subscribe();
        console.log("teste de envio 2");
        console.log(this.applicationUserId);
  
      }
    });
  }

  confirmDelete(irrigation: Irrigation) {
    irrigation.deleteConfirm = true;
  }

  cancelDeleteConfirm(irrigation: Irrigation) {
    irrigation.deleteConfirm = false;
  }

  deleteConfirmed(irrigation: Irrigation, irrigations: Irrigation[]) {
    console.log(irrigation.id);
    this.schedulingService.delete(irrigation.id).subscribe(() => {
      let index = 0;

      for (let i=0; i<irrigations.length; i++) {
        if (irrigations[i].id === irrigation.id) {
          index = i;
        }
      }

      if (index > -1) {
        irrigations.splice(index, 1);
      }

      this.toastr.info("Irrigation deleted.");
    });
  }

  editIrrigation(irrigationId: string) {
    
        if (!!irrigationId && irrigationId !== '00000000-0000-0000-0000-000000000000') {
          this.schedulingService.get(irrigationId).subscribe(irrigation => {
          const daysOfWeekEdit = irrigation.daysOfWeek;
          const durationEdit = irrigation.duration;
          const specificDateEdit = irrigation.specificDate;
          const startTimeEdit = irrigation.startTime.toString().slice(0, -3);
          
        console.log(this.daysOfWeekEdit);
        console.log(startTimeEdit);
        console.log(specificDateEdit);


        let formattedDate: string | null = null;

        const dialogRef = this.dialog.open(IrrigationDialogComponent, {
          data: {
            startTime: startTimeEdit,
            duration: durationEdit,
            daysOfWeek: daysOfWeekEdit,
            specificDate: specificDateEdit 
          },
          width: '500px',
          height: '500px'
        });
        dialogRef.afterClosed().subscribe((result) => {
          console.log(result.specificDate);
          if (result)  {
            if(result.specificDate ){ 
              
              if(result.specificDate !== specificDateEdit){
                const day = result.specificDate.getDate().toString().padStart(2, '0');
                const month = (result.specificDate.getMonth() + 1).toString().padStart(2, '0');
                const year = result.specificDate.getFullYear().toString();
                formattedDate = `${year}-${month}-${day}`;
                console.log(formattedDate);
              }
              else{
                const dateTime = result.specificDate;
                formattedDate = dateTime.substring(0, 10);
              }
            }
            
            console.log('teste de envio 1');
            result.startTime = result.startTime + ":00"
            const irrigationData: IrrigationCreate = {
              id: irrigationId,
              applicationUserId: this.applicationUserId,
              startTime: result.startTime,
              duration: result.duration,
              daysOfWeek: result.daysOfWeek,
              specificDate: formattedDate
            };
            
            console.log(irrigationData.applicationUserId);
            console.log(irrigationData.startTime);
            console.log(irrigationData.duration);
            console.log(irrigationData.daysOfWeek);
            console.log(irrigationData.specificDate);

            // Use irrigationData conforme necessário
            this.schedulingService.scheduler(irrigationData).subscribe();
            console.log("teste de envio 2");
            console.log(this.applicationUserId);
      
          }
        });
      });
    }
  }
}
