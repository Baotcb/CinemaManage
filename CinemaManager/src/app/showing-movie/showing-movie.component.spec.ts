import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowingMovieComponent } from './showing-movie.component';

describe('ShowingMovieComponent', () => {
  let component: ShowingMovieComponent;
  let fixture: ComponentFixture<ShowingMovieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowingMovieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowingMovieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
