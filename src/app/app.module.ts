import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import {FormsModule} from '@angular/forms'
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { LoadingBarModule } from '@ngx-loading-bar/core';
import { AlertModule } from '@full-fledged/alerts';
import {DpDatePickerModule} from 'ng2-date-picker';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import 'hammerjs';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ClickOutsideModule } from 'ng-click-outside';
import { PinchZoomModule } from 'ngx-pinch-zoom';


// Services
import { GlobalsService } from './../providers/globals-service';
import { PreviousRouteService } from './../providers/previous-route-service';
import { UserService } from './../providers/user-service';
import { AuthService } from './../providers/auth-service';
import { TokenInterceptor } from './../providers/token-interceptor-service';
import { EventsService } from './../providers/events-service';

// Pipe
import { FilterPipeModule } from 'ngx-filter-pipe';
import { AgePipe } from './../pipes/age-pipe';
import { MinuteSecondsPipe } from './../pipes/minute-second.pipe';
import { EscapeHtmlPipe } from './../pipes/keep-html.pipe';
import { ShortNumberPipe } from './../pipes/short-number.pipe';
import { SafePipeModule } from 'safe-pipe';

import { HomeComponent } from './home/home.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { SuccessComponent } from './success/success.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { ProductListingComponent } from './product-listing/product-listing.component';
import { TopDealsComponent } from './top-deals/top-deals.component';
import { CategoryListingComponent } from './category-listing/category-listing.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { MyAddressComponent } from './my-address/my-address.component';
import { ReviewComponent } from './review/review.component';
import { PagesComponent } from './page/page.component';
import { DesigningComponent } from './designing/designing.component';
import { ViewDesignComponent } from './view-design/view-design.component';
import { SupportChatComponent } from './support-chat/support-chat.component';
import { FaqComponent } from './faq/faq.component';




@NgModule({
  declarations: [
    AgePipe,
    MinuteSecondsPipe,
    EscapeHtmlPipe,
    ShortNumberPipe,
    AppComponent,
    MyAccountComponent,
    HomeComponent,
    CartComponent,
    CheckoutComponent,
    SuccessComponent,
    ProductListingComponent,
    TopDealsComponent,
    CategoryListingComponent,
    ProductDetailsComponent,
    MyAddressComponent,
    ReviewComponent,
    PagesComponent,
    DesigningComponent,
    ViewDesignComponent,
    SupportChatComponent,
    FaqComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    LoadingBarModule,
    FormsModule,
    FilterPipeModule,
    DpDatePickerModule,
    BrowserAnimationsModule,
    AlertModule.forRoot({maxMessages: 5, timeout: 5000, positionX: 'right'}),
    InfiniteScrollModule,
    ImageCropperModule,
    NgApexchartsModule,
    SafePipeModule,
    ClickOutsideModule,
    NgbModule,
    PinchZoomModule,
  ],
  providers: [
    AuthService,
    GlobalsService,
    UserService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    PreviousRouteService,
    EventsService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
