import { Component, OnInit, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import {  Router, ActivatedRoute } from '@angular/router';
import { LoadingBarService } from '@ngx-loading-bar/core';

import { GlobalsService } from './../../providers/globals-service';
import { UserService } from './../../providers/user-service';
import { AuthService } from './../../providers/auth-service';

@Component({
  selector: 'app-top-deals',
  templateUrl: './top-deals.component.html',
  styleUrls: ['./top-deals.component.scss']
})
export class TopDealsComponent implements OnInit {


  targetCatId;
  category;
  parentCategory;
  products;

  skeletonLoading:boolean = true;
  isLoaded:boolean = false;
  reachedToTop:boolean = false;

  addedToWishlist = false;
  public publicSorting = '';
  


  constructor(private globals: GlobalsService, public userService: UserService, public loader: LoadingBarService, public router: Router, public auth: AuthService, public location: Location, public activatedRoute: ActivatedRoute) {

    this.getProducts();
    
  }

  


  getProducts(){
    this.skeletonLoading = true;
    let params = {
      offer:'true',
      perpage:100,
      page:1,
      sort:this.publicSorting,
    }
    // if(this.searchString){
    //   this.showingSuggestedKeyword = true; // if input has value then only showing text would show
    // } else {
    //   this.showingSuggestedKeyword = false;
    // }
    this.loader.start();
    this.isLoaded = false;
    this.userService.productListing(params).then(function(data){
      if(data){
        this.products = data;
        this.products.forEach(element => {
          if(element.wishitem &&element.wishitem.length){
            element.addedToWishlist = true;
          } else {
            element.addedToWishlist = false;
          }
        });
        this.loader.complete();
        this.skeletonLoading = false;
        this.isLoaded = true;
      }
    }.bind(this), function(err) {
      this.loader.complete();
      this.skeletonLoading = false;
      this.isLoaded = true;
    }.bind(this));
  }

  goToProductDetailsPage(productID,productSlug){
    this.router.navigate(['/product/'+productSlug+'/'+productID]); 
  }


  addToWishlist(productid, index){
    let userParams = {
      eid : productid,
      type: 'Product'
    };
    this.loader.start();
    this.userService.wishlist(userParams).then(function(data){
      if(data) {
        this.products[index].addedToWishlist = true;
        this.globals.showSuccessAlert(this.products[index].name+' has been added to your wishlist');
        console.log('success');
      } else {
        this.products[index].addedToWishlist = false;
        this.globals.showSuccessAlert(this.products[index].name+' has been removed from your wishlist');
        console.log('failed');
      }
      this.loader.complete();
    }.bind(this), function(err) {
      this.loader.complete();
    }.bind(this));
  }


  ngOnInit() {
    
  }

 

  

 


}
