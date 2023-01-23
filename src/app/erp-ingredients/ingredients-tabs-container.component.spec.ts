import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngredientsTabsContainerComponent } from './ingredients-tabs-container.component';

describe('IngredientsTabsContainerComponent', () => {
  let component: IngredientsTabsContainerComponent;
  let fixture: ComponentFixture<IngredientsTabsContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IngredientsTabsContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngredientsTabsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
