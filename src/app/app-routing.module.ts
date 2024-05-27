import { NgModule } from '@angular/core';
import { Router, Routes, RouterModule, Scroll, Event } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { filter } from 'rxjs/operators';

import { PreviousRouteService } from './../providers/previous-route-service';

import { HomeComponent } from './home/home.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { SuccessComponent } from './success/success.component';
import { ProductListingComponent } from './product-listing/product-listing.component';
import { TopDealsComponent } from './top-deals/top-deals.component';
import { CategoryListingComponent } from './category-listing/category-listing.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { DesigningComponent } from './designing/designing.component';
import { FaqComponent } from './faq/faq.component';
import { PagesComponent } from './page/page.component';


const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'category/all', component: CategoryListingComponent },
  { path: 'category/:catName/:catId', component: CategoryListingComponent },
  { path: 'category/products/:catName/:catId', component: ProductListingComponent },
  { path: 'products/top-deals', component: TopDealsComponent },
  { path: 'product/:productName/:productId', component: ProductDetailsComponent },
  { path: 'product/:productName/:productId/start-designing', component: DesigningComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'success/:orderId', component: SuccessComponent },
  { path: 'my-account', component: MyAccountComponent },
  { path: 'my-account/:url', component: MyAccountComponent },
  { path: 'my-account/:url/:orderID', component: MyAccountComponent },
  { path: 'faqs', component: FaqComponent },
  { path: ':pageUrl', component: PagesComponent },

  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**',   redirectTo: '/home'}, // if error page or no route
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'disabled',
    relativeLinkResolution: 'legacy'
})],
  exports: [RouterModule]
})
export class AppRoutingModule { 
  constructor(router: Router, viewportScroller: ViewportScroller, private previousRouteService: PreviousRouteService) {
    router.events.pipe(
      filter((e: Event): e is Scroll => e instanceof Scroll)
    ).subscribe(e => {
      let previousUrl = this.previousRouteService.getPreviousUrl();
      console.log(e.routerEvent.url.startsWith('/my-account'));
      console.log(previousUrl.startsWith('/my-account'));
      if(e.routerEvent.url.startsWith('/my-account') && previousUrl.startsWith('/my-account')) {
        console.log('match');
        // viewportScroller.scrollToPosition([0, 100]);
      } else {
        if (e.position) {
          // backward navigation
          viewportScroller.scrollToPosition(e.position);
        } else if (e.anchor) {
          // anchor navigation
          viewportScroller.scrollToAnchor(e.anchor);
        } else {
          // forward navigation
          viewportScroller.scrollToPosition([0, 0]);
        }
      }
      
    });
  }
}
