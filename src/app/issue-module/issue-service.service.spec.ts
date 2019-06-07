import { TestBed } from '@angular/core/testing';

import { IssueServiceService } from './issue-service.service';

describe('IssueServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IssueServiceService = TestBed.get(IssueServiceService);
    expect(service).toBeTruthy();
  });
});
