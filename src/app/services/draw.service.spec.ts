import { TestBed, inject } from '@angular/core/testing';

import { DrawService } from './draw.service';

describe('DrawService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DrawService]
    });
  });

  it('should be created', inject([DrawService], (service: DrawService) => {
    expect(service).toBeTruthy();
  }));
});
