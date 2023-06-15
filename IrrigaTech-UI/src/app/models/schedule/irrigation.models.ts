import { Time } from "@angular/common";

export class Irrigation {
    constructor(    
        public id: string,
        public applicationUserId: number,
        public startTime: Time,
        public duration: string,
        public daysOfWeek?: number[],
        public deleteConfirm: boolean = false,
        public specificDate?: string | null, 
    ){}
    
}