import { test } from 'node:test';
import assert from 'node:assert/strict';
// eslint-disable-next-line import/extensions
import { DEFAULT_SYSTEM_COMMENTER, formatCommenterName } from '../src/utils/commenter.js';

// The comments query returns `commenter` as a double-encoded JSON string, or null when
// the comment has no commenter row (commenter_id NULL); commenterFirstName/LastName are
// resolved separately by the backend.
const encode = (value) => JSON.stringify(JSON.stringify(value));
const SYSTEM_LABEL = 'translated system label';

test('user commenter keeps its username', () => {
  assert.equal(
    formatCommenterName({ commenterTypeName: 'user', commenter: encode({ username: 'field_officer' }) }),
    'User: field_officer',
  );
});

test('individual commenter keeps its first and last name', () => {
  assert.equal(
    formatCommenterName({
      commenterTypeName: 'individual',
      commenter: encode({ firstName: 'Ada', lastName: 'Lovelace' }),
    }),
    'Individual: Ada Lovelace',
  );
});

test('no commenter type stays anonymous', () => {
  assert.equal(formatCommenterName({ commenterTypeName: null, commenter: null }), 'Anonymous User');
});

test('user comment with a null commenter falls back to commenterFirstName/LastName', () => {
  assert.equal(
    formatCommenterName({
      commenterTypeName: 'user', commenter: null, commenterFirstName: 'Grace', commenterLastName: 'Hopper',
    }),
    'User: Grace Hopper',
  );
});

test('user comment with a null commenter and no name gets the system label', () => {
  assert.equal(
    formatCommenterName({
      commenterTypeName: 'user', commenter: null, commenterFirstName: null, commenterLastName: null,
    }, SYSTEM_LABEL),
    SYSTEM_LABEL,
  );
});

test('individual comment with a null commenter and no name gets the system label', () => {
  assert.equal(formatCommenterName({ commenterTypeName: 'individual', commenter: null }, SYSTEM_LABEL), SYSTEM_LABEL);
});

test('without a system label the default one is used', () => {
  assert.equal(formatCommenterName({ commenterTypeName: 'user', commenter: null }), DEFAULT_SYSTEM_COMMENTER);
});

test('a "null" JSON string and an already parsed object are both accepted', () => {
  assert.equal(formatCommenterName({ commenterTypeName: 'user', commenter: '"null"' }, SYSTEM_LABEL), SYSTEM_LABEL);
  assert.equal(
    formatCommenterName({ commenterTypeName: 'user', commenter: { username: 'admin' } }),
    'User: admin',
  );
});

test('a user commenter without username uses the resolved names', () => {
  assert.equal(
    formatCommenterName({
      commenterTypeName: 'user', commenter: encode({}), commenterFirstName: 'Alan', commenterLastName: null,
    }),
    'User: Alan',
  );
});

test('a commenter string that is not JSON does not throw', () => {
  assert.equal(
    formatCommenterName({ commenterTypeName: 'user', commenter: 'not json', commenterFirstName: 'Edsger' }),
    'User: Edsger',
  );
});
