import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import {  Router, ActivatedRoute } from '@angular/router';
import { trigger, style, animate, transition } from '@angular/animations';
import { LoadingBarService } from '@ngx-loading-bar/core';

import { GlobalsService } from './../../providers/globals-service';
import { UserService } from './../../providers/user-service';
import { AuthService } from './../../providers/auth-service';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
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
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit {


  showBillingAddress:boolean = false;
  paymentMode = '';
  orderId;
  order;
  checkoutUrl = this.globals.get('appConfig').apiUrl+'payments/checkout/';

  constructor(private globals: GlobalsService, public userService: UserService, public loader: LoadingBarService, public router: Router, public auth: AuthService, public location: Location, public activatedRoute: ActivatedRoute) {

    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.activatedRoute.params.subscribe(params => {
      this.orderId = params['orderId'];
      if(this.orderId == 'all') {
        this.orderId = false; 
      } else {
        this.getSpecificOrder();
      }
    });
  }

  ngOnInit() {}

  getSpecificOrder(){
    this.loader.start();
    this.userService.orderDetails(this.orderId).then(function(data){
      if(data){

        let total_delivery_charge = 0;
        let total_custom_design_charge = 0;


        data.order_items.forEach(orderItem => {

      
          orderItem.final_price = orderItem.final_price - orderItem.delivery_charge - orderItem.custom_design_charge;
          orderItem.unitPrice = orderItem.final_price / orderItem.qty;

          total_delivery_charge += orderItem.delivery_charge;
          total_custom_design_charge += orderItem.custom_design_charge;

        });

        if(data.order_items.length){
          data.order_master.total_delivery_charge = total_delivery_charge;
          data.order_master.total_custom_design_charge = total_custom_design_charge;
        }



        this.order = data;
        this.loader.complete();
        // console.log(this.order);
      }
    }.bind(this), function(err) {
      this.loader.complete();
    }.bind(this));

  }

  onItemChange(value){
    if(value == 'different') {
      this.showBillingAddress = true;
    } else {
      this.showBillingAddress = false;
    }
  }

  setPaymentMode(type){
    this.paymentMode = type;
  }

  goToProfile(url){
    this.router.navigate(['/my-account/'+url]); 
  }

  goToPaymentPage(){
    let redirectUrl = location.origin+'/success/'+ this.orderId;
    let paymentUrl = this.checkoutUrl + this.orderId  + '?succredir=' + encodeURI(redirectUrl) + '&failedredir=' + encodeURI(redirectUrl);
    location.href = paymentUrl;
  }

  goToProductDetailsPage(productID,productSlug){
    this.router.navigate(['/product/'+productSlug+'/'+productID]); 
  }

}
