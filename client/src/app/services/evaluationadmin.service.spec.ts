import { TestBed } from '@angular/core/testing';

import { EvaluationadminService } from './evaluationadmin.service';

describe('EvaluationadminService', () => {
  let service: EvaluationadminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EvaluationadminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
