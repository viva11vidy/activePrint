import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DesigningComponent } from './designing.component';

describe('DesigningComponent', () => {
  let component: DesigningComponent;
  let fixture: ComponentFixture<DesigningComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DesigningComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesigningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
