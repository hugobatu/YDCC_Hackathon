import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartDemo } from './chart-demo';

describe('ChartDemo', () => {
  let component: ChartDemo;
  let fixture: ComponentFixture<ChartDemo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartDemo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartDemo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
