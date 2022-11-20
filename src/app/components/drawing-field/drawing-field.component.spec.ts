import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawingFieldComponent } from './drawing-field.component';

describe('DrawingFieldComponent', () => {
  let component: DrawingFieldComponent;
  let fixture: ComponentFixture<DrawingFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DrawingFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrawingFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
