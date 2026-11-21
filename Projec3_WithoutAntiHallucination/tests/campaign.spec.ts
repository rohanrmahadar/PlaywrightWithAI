import { backlog, test } from '../src/fixtures';

test.describe('Campaign / A/B test', () => {
  backlog(
    [
      ['TC_CAMP_001', 'create an A/B test with a valid name and URL'],
      ['TC_CAMP_003', 'add a primary page-visit goal'],
      ['TC_CAMP_004', 'start a fully configured campaign'],
      ['TC_CAMP_005', 'pause a running campaign'],
      ['TC_CAMP_006', 'stop a campaign'],
      ['TC_CAMP_007', 'delete a campaign'],
      ['TC_CAMP_008', 'cancel campaign deletion'],
      ['TC_CAMP_009', 'empty campaign name is rejected'],
      ['TC_CAMP_010', 'invalid URLs are rejected'],
      ['TC_CAMP_011', 'start without a goal is blocked'],
      ['TC_CAMP_012', 'start without a variation is blocked'],
      ['TC_CAMP_013', 'campaign name length boundaries'],
      ['TC_CAMP_014', 'traffic allocation and split boundaries'],
      ['TC_CAMP_015', 'Unicode campaign name is preserved'],
      ['TC_CAMP_016', 'stored XSS in campaign name is not executed'],
      ['TC_CAMP_019', 'create wizard works across browsers'],
    ],
    'Needs a test account with SmartCode on a demo site and locators for the create-test wizard',
  );
});
