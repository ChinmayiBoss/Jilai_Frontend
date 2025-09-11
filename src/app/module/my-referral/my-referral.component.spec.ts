import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyReferralComponent } from './my-referral.component';

describe('MyReferralComponent', () => {
  let component: MyReferralComponent;
  let fixture: ComponentFixture<MyReferralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyReferralComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyReferralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
