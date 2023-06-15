import { Time } from "@angular/common";

export class IrrigationHistory {
    constructor(    
        public id: number,
        public applicationUserId: number,
        public irrigationId: string,
        public startTime: Time,
        public endTime: Time,
        public duration: string,
        public date: string, 
    ){}
    
}