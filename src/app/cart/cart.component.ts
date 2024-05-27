import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import {  Router } from '@angular/router';
import { LoadingBarService } from '@ngx-loading-bar/core';

import { GlobalsService } from './../../providers/globals-service';
import { UserService } from './../../providers/user-service';
import { AuthService } from './../../providers/auth-service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  // cart = [];

  constructor(private globals: GlobalsService, public userService: UserService, public loader: LoadingBarService, public router: Router, public auth: AuthService, public location: Location) {

   console.log(this.auth.cart);
  //  this.getCartData();
    
   }

  ngOnInit() {

    
    
  }

  updateCart(e, cartItemIndex) {
    let selectedQtyIndex = e.target.selectedIndex;
    let data = {
      cartid: this.auth.cart[cartItemIndex]._id,
      item: this.auth.cart[cartItemIndex].product._id,
      pvid: this.auth.cart[cartItemIndex].variation_selcted._id,
      prcid: this.auth.cart[cartItemIndex].variation_selcted.pricing[selectedQtyIndex]._id,
    };
    this.loader.start();
    this.auth.updateCart(data).then(function(data){
      console.log(data);
      this.loader.complete();
    }.bind(this), function(err) {
      this.loader.complete();
    }.bind(this));

    // console.log(data);

  }
 
  removeItemFromCart(cartid) {
    let data = {
      cartid: cartid
    };
    this.loader.start();
    this.auth.removeItemFromCart(data).then(function(data){
      console.log(data);
      this.loader.complete();
    }.bind(this), function(err) {
      this.loader.complete();
    }.bind(this));
  }
  
  // getCartData(){
  //   this.loader.start();
  //   this.auth.getCart().then(function(data){
  //     this.cart = data;
  //     // console.log(data);
  //     this.loader.complete();
  //   }.bind(this), function(err) {
  //     this.loader.complete();
  //   }.bind(this));
  // }

  goToChekout(){
    this.router.navigate(['/checkout']); 
  }
 
  goToProductDetailsPage(productID,productSlug){
    this.router.navigate(['/product/'+productSlug+'/'+productID]); 
  }

}
