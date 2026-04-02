import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultDetailsDialog } from './result-details-dialog';

describe('ResultDetailsDialog', () => {
  let component: ResultDetailsDialog;
  let fixture: ComponentFixture<ResultDetailsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultDetailsDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultDetailsDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
