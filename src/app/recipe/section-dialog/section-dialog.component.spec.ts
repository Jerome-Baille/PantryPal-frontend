import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionDialogComponent } from './section-dialog.component';

describe('SectionDialogComponent', () => {
  let component: SectionDialogComponent;
  let fixture: ComponentFixture<SectionDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SectionDialogComponent]
    });
    fixture = TestBed.createComponent(SectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
