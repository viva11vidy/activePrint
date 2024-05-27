import { Injectable, Component, EventEmitter } from '@angular/core';

@Injectable()
export class EventsService {
 
    private subjects = {};
    private hasOwnProp = {}.hasOwnProperty;

    constructor(){
  
    }

    createName (name) {
        return `$ ${name}`;
    }

    emit = (name, data) => {
        var fnName = this.createName(name);
        this.subjects[fnName] || (this.subjects[fnName] = new EventEmitter());
        this.subjects[fnName].emit(data);
    };

    listen = (name, handler) => {
        var fnName = this.createName(name);
        this.subjects[fnName] || (this.subjects[fnName] = new EventEmitter());
        return this.subjects[fnName].subscribe(handler);
    };

    dispose = () => {
        var subjects = this.subjects;
        for (var prop in subjects) {    
            if (this.hasOwnProp.call(subjects, prop)) {
                subjects[prop].dispose();
            }
        }

        this.subjects = {};
    };

}
    
