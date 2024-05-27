import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, ViewChild, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { Location } from '@angular/common';
import {  Router, ActivatedRoute } from '@angular/router';
import { trigger, style, animate, transition } from '@angular/animations';
import { LoadingBarService } from '@ngx-loading-bar/core';
import * as moment from 'moment';

import { GlobalsService } from './../../providers/globals-service';
import { UserService } from './../../providers/user-service';
import { AuthService } from './../../providers/auth-service';

@Component({
  selector: 'app-designing',
  templateUrl: './designing.component.html',
  animations: [
    trigger(
      'leaveAnimation', [
        transition(':leave', [
          style({
            transform: 'none',
          }),
          animate('300ms', style({transform: 'translate3d(-100%, 0, 0)'}))
        ])
      ]
    ),
  ],
  styleUrls: ['./designing.component.scss']
})
export class DesigningComponent implements OnInit {

  @Input() startDesigningProductID; 
  @Input() startDesigningVariationID; 
  @Input() startDesigningProductCustomDesignCharge;
  @Input() startDesigningPriceID; 
  @Output() startDesigningProductIDChange = new EventEmitter<boolean>();
  @ViewChild('designInput') designInput: ElementRef;
  @ViewChildren('fileInput') fileInput: QueryList<ElementRef>;

  skeletonLoading:boolean = true;
  openedTab = 'browse';
  openedDesigningTab = 'Text';
  browseTemplate = true;
  startDesigning = false;
  templates;
  selectedTemplate = null;
  imageIndex = 0;
  selectedDesign;
  selectedDesignData;
  templateFormValidated = false;
  uploadFormValidated = false;
  addingToCart = false;

  constructor(private globals: GlobalsService, public userService: UserService, public loader: LoadingBarService, public router: Router, public auth: AuthService, public location: Location, public activatedRoute: ActivatedRoute) {

    // setTimeout(() => {
    //   console.log(this.startDesigningProductCustomDesignCharge);
    // }, 500);
    

    

  }

  async fetchTemplates() {
    this.loader.start();
    this.skeletonLoading = true;
    try {
      console.log(this.startDesigningProductID);
      this.templates = await this.userService.templatetListing({pid:this.startDesigningProductID});
    } catch(err) {

    }
    this.skeletonLoading = false;
    this.loader.complete();
  }

  isTemplateFormValidated() {
    if(this.selectedTemplate) { 
      if(this.selectedTemplate.fields && this.selectedTemplate.fields.length) { 
        for(var i = 0; i < this.selectedTemplate.fields.length; i++) {
          if(!this.selectedTemplate.fields[i].value && !this.selectedTemplate.fields[i].selectedFile) {
            return false;
          }
        }
      }
      return true;
    }
    return false;
  }

  setTemplateFormValidated() {
    this.templateFormValidated = this.isTemplateFormValidated();
  }

  ngOnInit() {

    // console.log(this.startDesigningProductID);  
    this.fetchTemplates(); 
  }



  closeModal() {
    this.startDesigningProductIDChange.emit(false);
  }

  openTab(tabName){
    this.openedTab = tabName;
  }

  openDesigningTab(tabName){
    this.openedDesigningTab = tabName;
  }

  setImage(index){
    this.imageIndex = index;
  }

  onDesignSelected(event){
    if (event.target.files && event.target.files.length) {
      
      // if(!(event.target.files[0].type == 'image/png' || event.target.files[0].type == 'image/jpeg')) {
      //   this.globals.showErrorAlert('Invalid File type');
      //   return false;
      // }

      this.selectedDesign = event.target.files[0];  
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = e => this.selectedDesignData = reader.result;
      reader.readAsDataURL(file);
      this.uploadFormValidated = true;
    }
  }

  removeDesign(){
    this.designInput.nativeElement.value = "";
    this.selectedDesign = null;
    this.selectedDesignData = null;
    this.uploadFormValidated = false;
  }

  // FIELD IMAGE SELECT
  selectFile(id) {
    let selectedField = this.selectedTemplate.fields.findIndex(field => field._id == id);
    if(selectedField == -1) return false;

    let imageFields = this.selectedTemplate.fields.filter(field => field.type == 'Image');
    let selectImageFieldIndex = imageFields.findIndex(field => field._id == id);
    this.fileInput.get(selectImageFieldIndex).nativeElement.click();
  }

  onFileSelected(event, id){
    let selectedField = this.selectedTemplate.fields.findIndex(field => field._id == id);
    if(selectedField == -1) return false;
    
    if(event.target.files && event.target.files.length) {
      if(!(event.target.files[0].type == 'image/png' || event.target.files[0].type == 'image/jpeg')) {
        this.globals.showErrorAlert('Invalid File type');
        return false;
      }
      this.selectedTemplate.fields[selectedField].selectedFile = event.target.files[0];
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = e => this.selectedTemplate.fields[selectedField].selectedFileData = reader.result;
      reader.readAsDataURL(file);
      this.setTemplateFormValidated();
    }
  }

  removeFile(id){
    let selectedField = this.selectedTemplate.fields.findIndex(field => field._id == id);
    if(selectedField == -1) return false;

    let imageFields = this.selectedTemplate.fields.filter(field => field.type == 'Image');
    let selectImageFieldIndex = imageFields.findIndex(field => field._id == id);
    this.fileInput.get(selectImageFieldIndex).nativeElement.value = null;

    this.selectedTemplate.fields[selectedField].selectedFile = null;
    this.selectedTemplate.fields[selectedField].selectedFileData = null;
    this.setTemplateFormValidated();
  }

  hideAllSection(){
    this.startDesigning = false;
    this.browseTemplate = false;
  }
  showStartDesigning(){
    this.hideAllSection();
    this.startDesigning = true;
  }
  showBrowseTemplate(){
    this.hideAllSection();
    this.browseTemplate = true;
  }

  async addToCart() {

    if(!this.auth.isLoggedIn) {
      this.globals.openLoginModal();
      return false;
    }

    if(!this.templateFormValidated && !this.uploadFormValidated) {
      return false;
    }

    this.loader.start();
    this.addingToCart = true;
    try {
      let design:any = {};
      if(this.openedTab == "browse" && this.selectedTemplate && this.templateFormValidated) {
        design.template = JSON.parse(JSON.stringify(this.selectedTemplate));
        if(design.template.fields && design.template.fields.length) {
          await this.asyncForEach(design.template.fields, async (field, fieldIndex) => {
            if(field.type == 'Image') {
              const data = new FormData();
              let fileName = this.selectedTemplate.fields[fieldIndex].selectedFile.name;
              let fileNameArr = fileName.split('.');
              if(fileNameArr.length > 1) {
                fileNameArr[fileNameArr.length - 2] += '-' + moment().unix();
              }
              fileName = fileNameArr.join('.');
              data.append('image', this.selectedTemplate.fields[fieldIndex].selectedFile, fileName);
              let uploadedImage = await this.auth.uploadImage(data);
              design.template.fields[fieldIndex].value = uploadedImage;
              delete design.template.fields[fieldIndex].selectedFile;
              delete design.template.fields[fieldIndex].selectedFileData;
            }
          });
        }
      }
      
      if(this.openedTab == "upload" && this.selectedDesign && this.uploadFormValidated) {
        const data = new FormData();
        let fileName = this.selectedDesign.name;
        let fileNameArr = fileName.split('.');
        if(fileNameArr.length > 1) {
          fileNameArr[fileNameArr.length - 2] += '-' + moment().unix();
        }
        fileName = fileNameArr.join('.');
        data.append('file', this.selectedDesign, fileName);
        let uploadedFile = await this.auth.uploadFile(data);
        design.custom = uploadedFile;
      }
      let data = {
        item: this.startDesigningProductID,
        pvid: this.startDesigningVariationID,
        prcid: this.startDesigningPriceID,
        design: design,
      };
      let cartData = await this.auth.addToCart(data);
      this.globals.showSuccessAlert(cartData.product.info.name+' has been added to the cart');  
      // console.log(cartData);
      this.closeModal();
      this.router.navigate(['/cart']);
    } catch(err) {
      console.log(err);
      this.globals.showErrorAlert('Some error occurred. Please try again.');
    }
    this.loader.complete();
    this.addingToCart = false;
  }

  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
  


}
