import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Animalesadmin } from './animalesadmin';

describe('Animalesadmin', () => {
  let component: Animalesadmin;
  let fixture: ComponentFixture<Animalesadmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Animalesadmin],
    }).compileComponents();

    fixture = TestBed.createComponent(Animalesadmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
