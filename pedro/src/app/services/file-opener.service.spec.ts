import { TestBed } from '@angular/core/testing';

import { FileOpenerService } from './file-opener.service';

describe('FileOpenerService', () => {
  let service: FileOpenerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileOpenerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
