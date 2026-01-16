import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiAgent } from './ai-agent';

describe('AiAgent', () => {
  let component: AiAgent;
  let fixture: ComponentFixture<AiAgent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiAgent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiAgent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
