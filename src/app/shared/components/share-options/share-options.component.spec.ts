import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareOptionsComponent } from './share-options.component';

describe('ShareOptionsComponent', () => {
  let component: ShareOptionsComponent;
  let fixture: ComponentFixture<ShareOptionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShareOptionsComponent]
    });
    fixture = TestBed.createComponent(ShareOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
