import { Time } from "@angular/common";

export class IrrigationCreate {
    constructor(    
        public id: string,
        public applicationUserId: number,
        public startTime: string,
        public duration: string,
        public daysOfWeek?: number[],
        public specificDate?: string | null
    ){}
    
}