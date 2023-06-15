import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IrrigationCreate } from 'src/app/models/schedule/irrigation-create.models';
import { SchedulingService } from 'src/app/services/scheduling.service';
import { DateAdapter } from '@angular/material/core';


@Component({
  selector: 'app-irrigation-dialog',
  templateUrl: './irrigation-dialog.component.html',
  styleUrls: ['./irrigation-dialog.component.css']
})
export class IrrigationDialogComponent implements OnInit {
  selectedTime!: Date;
  activeStates: boolean[] = [false, false, false, false, false, false, false];
  time = new Date();
  currentDate:any;
  selectedTime1: Date | null = new Date();
  schedulingForm!: FormGroup;
  applicationUserId: number = 1;

  
  selectedMatDate!: Date;
  ordinaryDateSelected!: Date;

  time2: string = "00:00:00";
  startTime!: string;
  duration!: string;
  daysOfWeek!: number[];
  specificDate!: string | null;

  constructor(public dialogRef: MatDialogRef<IrrigationDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: IrrigationCreate, 
      private formBuilder: FormBuilder, private schedulingService: SchedulingService,
      
    ) 
    {
      this.currentDate = new Date();
      
    }

  ngOnInit(): void {
    this.time.setMilliseconds(0);
    this.time.setSeconds(0);
    this.time.setMinutes(15);
    this.time.setHours(13);
    this.daysOfWeek = [];
    console.log(this.currentDate);
    this.schedulingForm = this.formBuilder.group({
      startTime: [null, [
        Validators.required
      ]],
      duration: [null, [
        Validators.required
      ]],
      daysOfWeek: [null, [
        
      ]],
      specificDate: [null, [
        
      ]]
    });
    if (this.data.daysOfWeek) { 
      this.daysOfWeek = Array.from(this.data.daysOfWeek).map(Number);
    
      // Executar o método toggleActive para cada número em this.daysOfWeek
      this.daysOfWeek.forEach((dayOfWeek: number) => {
        this.toggleActive(dayOfWeek);
      });
    }
    console.log(this.daysOfWeek);
  }


  @ViewChild('numberInput') numberInput!: ElementRef;

  

  cancel(): void {
    this.dialogRef.close();
  }

  save() {
    this.data.daysOfWeek = Array.from(this.daysOfWeek)
    .filter((value: any) => typeof value === 'number' && !isNaN(value))
    .map(Number);
    // this.data.daysOfWeek = this.daysOfWeek;
    this.data.applicationUserId = this.applicationUserId;
    this.dialogRef.close(this.data);
    this.schedulingService.scheduler(this.data);
  }

  toggleActive(index: number) {
    this.activeStates[index] = !this.activeStates[index];
    // if (this.selectedDays.includes(index)) {
    //   console.log('O número está no array');
    
    //   // Remover o número usando splice
    //   const indice = this.selectedDays.indexOf(index);
    //   this.selectedDays.splice(indice, 1);
    //   console.log('Número removido:', index);
    // } else {
    //   console.log('O número não está no array');
    // }
  }

  selectedDays(num: number) {
    if (!Array.isArray(this.daysOfWeek)) {
      this.daysOfWeek = [];
    }
    const index = this.daysOfWeek.indexOf(num);

    console.log(this.daysOfWeek);
  
    if (index !== -1) {
      // Se o dia da semana já está presente no array, remova-o
      this.daysOfWeek.splice(index, 1);
      console.log('Dia da semana removido:', num);
    } else {
      // Caso contrário, adicione-o ao array
      this.daysOfWeek.push(num);
      console.log('Dia da semana adicionado:', num);
    }
  }

  isActive(index: number) {
    console.log(index)
    return this.activeStates[index];
  }

  onTimeChange(event: MatDatepickerInputEvent<Date>) {
    this.selectedTime1 = event.value;
  }

  onSubmit() {
    // let applicationUserLogin: IrrigationCreate = new IrrigationCreate(
    //   this.loginForm.get("username")?.value,
    //   this.loginForm.get("password")?.value
    // );

    // this.accountService.login(applicationUserLogin).subscribe(() => {
    //   this.router.navigate(['/dashboard']);
    // });
  }

}
