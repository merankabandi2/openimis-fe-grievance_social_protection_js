import { test } from 'node:test';
import assert from 'node:assert/strict';
// eslint-disable-next-line import/extensions
import { buildCategoryOptions, isSelectableOption } from '../src/utils/categoryOptions.js';

// Shape of grievanceConfig.grievanceCategoriesJson: a restricted category the user may view
// but not create in, a parent that is not creatable with one creatable child, and an open category.
const hierarchy = [
  {
    name: 'restricted',
    full_name: 'restricted',
    can_create: false,
    children: [
      {
        name: 'assault', full_name: 'restricted > assault', can_create: false, children: [],
      },
      {
        name: 'other', full_name: 'restricted > other', can_create: false, children: [],
      },
    ],
  },
  {
    name: 'mixed',
    full_name: 'mixed',
    can_create: false,
    children: [{
      name: 'open_child', full_name: 'mixed > open_child', can_create: true, children: [],
    }],
  },
  {
    name: 'payment', full_name: 'payment', can_create: true, children: [],
  },
];

const values = (options) => options.flatMap((o) => [o.value, ...values(o.children ?? [])]);

test('without creatableOnly every viewable category is offered and selectable', () => {
  const options = buildCategoryOptions(hierarchy);
  assert.deepEqual(values(options), [
    'restricted', 'restricted > assault', 'restricted > other', 'mixed', 'mixed > open_child', 'payment',
  ]);
  assert.ok(options.every((o) => o.selectable));
});

test('creatableOnly drops a category whose subtree has no creatable node', () => {
  const options = buildCategoryOptions(hierarchy, { creatableOnly: true });
  assert.deepEqual(values(options), ['mixed', 'mixed > open_child', 'payment']);
});

test('creatableOnly keeps a non-creatable parent of a creatable child, unselectable', () => {
  const [mixed] = buildCategoryOptions(hierarchy, { creatableOnly: true });
  assert.equal(mixed.value, 'mixed');
  assert.equal(mixed.selectable, false);
  assert.equal(isSelectableOption(mixed), false);
  assert.equal(mixed.children[0].selectable, true);
  assert.equal(isSelectableOption(mixed.children[0]), true);
});

test('a node without can_create stays selectable (server without the flag)', () => {
  const legacy = { name: 'legacy', full_name: 'legacy', children: [] };
  const options = buildCategoryOptions([legacy], { creatableOnly: true });
  assert.deepEqual(values(options), ['legacy']);
  assert.equal(options[0].selectable, true);
});

test('labels come from translateName; clearing the picker stays allowed', () => {
  const [option] = buildCategoryOptions([hierarchy[2]], { translateName: (n) => `T:${n}` });
  assert.equal(option.label, 'T:payment');
  assert.equal(isSelectableOption(null), true);
});

test('creatableOnly keeps the categories of creatableAlso selectable', () => {
  const options = buildCategoryOptions(hierarchy, {
    creatableOnly: true, creatableAlso: ['restricted', 'restricted > assault'],
  });
  assert.deepEqual(values(options), [
    'restricted', 'restricted > assault', 'mixed', 'mixed > open_child', 'payment',
  ]);
  assert.equal(options[0].selectable, true);
  assert.equal(options[0].children[0].selectable, true);
});
