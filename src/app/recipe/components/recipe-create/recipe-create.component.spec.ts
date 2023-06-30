import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeCreateComponent } from './recipe-create.component';

describe('RecipeCreateComponent', () => {
  let component: RecipeCreateComponent;
  let fixture: ComponentFixture<RecipeCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RecipeCreateComponent]
    });
    fixture = TestBed.createComponent(RecipeCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
