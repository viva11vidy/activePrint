import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CategoryListingComponent } from './category-listing.component';

describe('CategoryListingComponent', () => {
  let component: CategoryListingComponent;
  let fixture: ComponentFixture<CategoryListingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CategoryListingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
