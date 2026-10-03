export function buildRecipeRoute(id, share = undefined) {
  const route = {
    name: 'RecipeViewPage',
    params: { id },
  };

  if (share && typeof share === 'string' && share.trim() !== '') {
    route.query = { share };
  }

  return route;
}
