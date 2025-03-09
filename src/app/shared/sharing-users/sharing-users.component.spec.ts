import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharingUsersComponent } from './sharing-users.component';

describe('SharingUsersComponent', () => {
  let component: SharingUsersComponent;
  let fixture: ComponentFixture<SharingUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharingUsersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharingUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
