import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoMessage } from './info-message';

describe('InfoMessage', () => {
  let component: InfoMessage;
  let fixture: ComponentFixture<InfoMessage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoMessage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoMessage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
