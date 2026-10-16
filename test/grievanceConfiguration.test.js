import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  GRIEVANCE_CONFIGURATION_RIGHTS,
  holdsGrievanceConfigurationRights,
  shouldFetchGrievanceConfiguration,
  // eslint-disable-next-line import/extensions
} from '../src/utils/grievanceConfiguration.js';

// fe-core passes state.core.user.i_user.rights, or [] before login.
const BEFORE_LOGIN = [];
const TICKET_RIGHTS = [...GRIEVANCE_CONFIGURATION_RIGHTS];

test('the configuration is not fetched before login', () => {
  assert.equal(shouldFetchGrievanceConfiguration(BEFORE_LOGIN, false), false);
});

test('the configuration is not fetched without every ticket right', () => {
  assert.equal(shouldFetchGrievanceConfiguration([127000], false), false);
  assert.equal(shouldFetchGrievanceConfiguration(undefined, false), false);
});

test('the configuration is fetched once the user holds the ticket rights', () => {
  assert.equal(shouldFetchGrievanceConfiguration(TICKET_RIGHTS, false), true);
  assert.equal(shouldFetchGrievanceConfiguration([...TICKET_RIGHTS, 160001], undefined), true);
});

test('a fetched configuration is not fetched again', () => {
  assert.equal(shouldFetchGrievanceConfiguration(TICKET_RIGHTS, true), false);
});

test('the rights are the five ticket rights the dialog checks', () => {
  assert.deepEqual([...new Set(GRIEVANCE_CONFIGURATION_RIGHTS)].sort(), [127000, 127001, 127002, 127003]);
  assert.equal(holdsGrievanceConfigurationRights([127000, 127001, 127002]), false);
  assert.equal(holdsGrievanceConfigurationRights([127000, 127001, 127002, 127003]), true);
});
