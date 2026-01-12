import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageSlider } from './image-slider';

describe('ImageSlider', () => {
  let component: ImageSlider;
  let fixture: ComponentFixture<ImageSlider>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageSlider]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageSlider);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
