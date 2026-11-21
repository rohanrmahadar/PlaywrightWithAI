import { backlog, test } from '../src/fixtures';

test.describe('Reports', () => {
  backlog(
    [
      ['TC_RPT_001', 'report of a running campaign shows per-variation metrics'],
      ['TC_RPT_002', 'date range filter refreshes the report'],
      ['TC_RPT_003', 'switching goals updates conversions'],
      ['TC_RPT_005', 'empty state for a campaign with no data'],
      ['TC_RPT_006', 'invalid custom date range cannot be applied'],
      ['TC_RPT_009', 'report renders within 5 s'],
    ],
    'Needs a seeded running campaign and locators for the report page',
  );
});
