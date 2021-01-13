import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDragAndDropComponent } from './dialog-drag-and-drop.component';

describe('DialogDragAndDropComponent', () => {
  let component: DialogDragAndDropComponent;
  let fixture: ComponentFixture<DialogDragAndDropComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogDragAndDropComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogDragAndDropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
