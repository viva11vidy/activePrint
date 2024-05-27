import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { AuthService } from './auth-service';
import { Observable, BehaviorSubject, throwError, from as fromPromise } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  private localToken: String = '';

  private getTokenInProgress = false;

  private getTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
      null
  );

  constructor(public auth: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    return next.handle(this.addAuthenticationToken(request));

    // return next.handle(this.addAuthenticationToken(request)).pipe(catchError(error => {
    //   console.log("error in http call", error);
    //   if (error.status !== 403) {
    //     return throwError(error);
    //   }

    //   if(this.getTokenInProgress) {
    //     console.log("token getting in progress..");
    //     return this.getTokenSubject.pipe(
    //       filter(result => result !== null),
    //       take(1),
    //       switchMap(() => next.handle(this.addAuthenticationToken(request)))
    //     );
    //   } else {
    //     console.log("token getting started..");
    //     this.getTokenInProgress = true;
    //     this.getTokenSubject.next(null);
        
    //     return fromPromise(this.auth.getToken()).pipe(
    //       switchMap((token: any) => {
    //         console.log("token getting completed successfully");
    //         this.getTokenInProgress = false;
    //         this.getTokenSubject.next(token);
    //         return next.handle(this.addAuthenticationToken(request));

    //       }),
    //       catchError((error: any) => {
    //           console.log("error in token get");
    //           this.getTokenInProgress = false;
    //           this.auth.unsetUser();
    //           return Observable.throw(error);
    //       })
    //     );

    //   }

    // })) as Observable<HttpEvent<any>>;

  }

  addAuthenticationToken(request: HttpRequest<any>) {

    this.localToken = this.auth.getLocalToken();
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${this.localToken}`
      }
    });
    return request;
  }

}