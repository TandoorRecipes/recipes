import test from 'node:test';
import assert from 'node:assert/strict';

import { buildRecipeRoute } from './recipe_route.js';

test('buildRecipeRoute preserves the share token for nested recipes in shared views', () => {
  assert.deepEqual(buildRecipeRoute(42, 'share-uuid'), {
    name: 'RecipeViewPage',
    params: { id: 42 },
    query: { share: 'share-uuid' },
  });
});

test('buildRecipeRoute omits the share token when no share link is active', () => {
  assert.deepEqual(buildRecipeRoute(42), {
    name: 'RecipeViewPage',
    params: { id: 42 },
  });
});
