import { Component, OnInit } from '@angular/core';

import { GlobalsService } from './../../providers/globals-service';
import { UserService } from './../../providers/user-service';

@Component({
  selector: 'app-view-design',
  templateUrl: './view-design.component.html',
  styleUrls: ['./view-design.component.scss']
})
export class ViewDesignComponent implements OnInit {

  imageIndex = 0;

  constructor(public globals: GlobalsService, public userService: UserService) { 

    if(this.globals.viewingDesign.custom && this.globals.viewingDesign.custom.id) {
      this.globals.viewingDesign.custom.imageSrc = this.globals.get('appConfig').apiUrl+'files/get/'+this.globals.viewingDesign.custom.id;
    }
  }

  ngOnInit(): void {
  }

  closeModal() {
    this.globals.viewingDesign = null;
  }

  setImage(index){
    this.imageIndex = index;
  }

}
