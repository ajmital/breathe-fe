import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostRegisterComponent } from './post-register.component';

describe('PostRegisterComponent', () => {
  let component: PostRegisterComponent;
  let fixture: ComponentFixture<PostRegisterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostRegisterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
