import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ZachlannoscComponent } from './zachlannosc.component';

describe('ZachlannoscComponent', () => {
  let component: ZachlannoscComponent;
  let fixture: ComponentFixture<ZachlannoscComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ZachlannoscComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZachlannoscComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
