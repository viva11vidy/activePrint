import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
@Pipe({
    name: 'minuteSeconds'
})
export class MinuteSecondsPipe implements PipeTransform {

    transform(value: number, args?: any): string {

        const hours: number = Math.floor(value / 60);
        const minutes: number = (value - hours * 60);
    
        if (hours < 10 && minutes < 10) {
            return '0' + hours + ' : 0' + (value - hours * 60);
        }
        if (hours > 10 && minutes > 10) {
            return '0' + hours + ' : ' + (value - hours * 60);
        }
        if (hours > 10 && minutes < 10) {
            return hours + ' : 0' + (value - hours * 60);
        }
        if (minutes > 10) {
            return '0' + hours + ' : ' + (value - hours * 60);
        }
    }

}