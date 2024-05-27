import { Component, OnInit, ViewChild  } from '@angular/core';
import { trigger, state, style, transition, animate, group } from '@angular/animations';
import { Location } from '@angular/common';
import {  Router } from '@angular/router';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { NgbCarousel } from '@ng-bootstrap/ng-bootstrap';

import { GlobalsService } from './../../providers/globals-service';
import { UserService } from './../../providers/user-service';
import { AuthService } from './../../providers/auth-service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('simpleFadeAnimation', [
      state('false', style({opacity: 0})),
      transition('*=>false', [
        style({opacity: 1}),
        animate(600 )
      ]),
      transition('false=>*',
        animate(600, style({opacity: 1})))
    ])
  ],
})
export class HomeComponent implements OnInit {


  CatId1 = '60768f8d79e2051bbf24c355'; 
  CatId2 = '60bf036e38d3b362436f7323'; 
  categories = [];
  products;
  testimonials = [];
  images = [];
  banners;
  highlightedCategories = [];

  @ViewChild('TestimonialCarousel', { static: true }) testimonialCarousel: NgbCarousel;

  constructor(public globals: GlobalsService, public userService: UserService, public loader: LoadingBarService, public router: Router, public auth: AuthService, public location: Location) {

    this.getBanners();
    this.getProducts();
    this.getCategories();
    this.getTestimonials();

    setTimeout(() => {
      this.images = [1, 2, 3];

    }, 5000);
    
   }

  ngOnInit() {
    
  }

  goToCategoryDetailsPage(catID,catSlug){
    this.router.navigate(['/category/'+catSlug+'/'+catID]); 
  }

  getBanners(){
    this.userService.bannerListing().then(function(data){
      if(data){
        this.banners = data;
      }
    }.bind(this), function(err) {
    }.bind(this));
  }

  getCategories(){
    this.userService.categoryListing({page:1}).then(function(data){
      if(data){
        this.categories = data;
        this.categories.forEach(cat => {
          if(cat.show_in_home){
            this.highlightedCategories.push(cat);
          }
          cat.child.forEach(subCat => {
            if(subCat.show_in_home){
              this.highlightedCategories.push(subCat);
            }
          });
        });
      }
    }.bind(this), function(err) {
    }.bind(this));
  }

  getProducts(){
    let params1 = {
      cid:this.CatId1,
      perpage:10,
      page:1,
    }
    this.userService.productListing(params1).then(function(data){
      if(data){
        this.products = data;
        this.products.forEach(element => {
          if(element.wishitem &&element.wishitem.length){
            element.addedToWishlist = true;
          } else {
            element.addedToWishlist = false;
          }
        });
      }
    }.bind(this), function(err) {
    }.bind(this));
  }
  
  async getTestimonials(){

    try {
      let testimonials = await this.userService.testimonialsListing();
      this.testimonials = testimonials.concat(testimonials);
      setTimeout(() => {
        this.testimonialCarousel.cycle();
      }, 250);
      
    } catch(err) {

    }
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
 
  goToProductDetailsPage(productID,productSlug){
    this.router.navigate(['/product/'+productSlug+'/'+productID]); 
  }

}
