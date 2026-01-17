import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPages } from './dashboard-pages';

describe('DashboardPages', () => {
  let component: DashboardPages;
  let fixture: ComponentFixture<DashboardPages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPages]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardPages);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
