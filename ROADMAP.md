# Food Management Roadmap

## Branch Strategy

```
feature/food-filters (preview PR #497 on fork, awaiting feedback)
├── feat/model-list-models  ✅ complete (preview PR #496 on fork)
├── feat/search-refactor            → PR to upstream (independent)
│   └── feat/search-inventory       → PR after search-refactor merges
│       └── feat/ingredient-context → PR after search-inventory merges
```

## Track A: Model List Enhancements

### A1. Extend model list to keywords, units, automations (`feat/model-list-models`) ✅

**Status:** Complete — preview PR #496 on fork, upstream PR after food-filters merges
**Branch:** `feat/model-list-models`

Wire up the existing generic list framework (filters, actions, tree view, mobile, settings) for additional models:

- **Keywords**: tree view, filters (has_recipe, has_children), merge/move/delete actions
- **Units**: filters (has_recipe), merge/delete actions
- **Automations**: type filter, enable/disable toggle, edit/delete actions

Each model needs:
- `[Model]List.ts` config file (filter defs, action defs, sort options, list settings)
- Model definition updates in `Models.ts` (tableHeaders with types, actionDefs, listSettings)
- Backend filter/ordering support where missing

---

## Track B: Search & Ingredient UX

### B1. Refactor search helper (`feat/search-refactor`)

**Depends on:** food-filters merged
**Branch:** `feat/search-refactor`

Simplify `RecipeSearch` for maintainability and performance:

- Break monolithic `get_queryset` into composable filter methods
- Reduce query count — consolidate annotations, eliminate redundant subqueries
- Simplify rating/cooking log filter logic
- Make filter composition explicit and testable in isolation
- Add comprehensive tests for each filter dimension

### B2. Inventory-aware recipe search (`feat/search-inventory`)

**Depends on:** B1 merged
**Branch:** `feat/search-inventory` (create off `feat/search-refactor`)

Add "cook now" filtering using inventory data:

- Filter recipes where all (or N%) ingredients are in inventory
- Consider food substitutes when checking availability
- Surface missing ingredient count as a sortable annotation
- Integrate with existing search page UI (filter toggle or sort option)

### B3. Ingredient context menu (`feat/ingredient-context`)

**Depends on:** B2 merged
**Branch:** `feat/ingredient-context` (create off `feat/search-inventory`)

Add contextual actions to ingredients within recipe view:

- Toggle shopping list status per ingredient/food
- Toggle inventory status (add/remove from pantry)
- Show substitute foods with availability indicators
- Visual stock status (in stock, substitute available, out of stock)
- Works on both desktop (right-click/hover menu) and mobile (tap/long-press)

---

## Active: Household Sharing Cleanup

**Branch:** `fix/household-sharing-cleanup`
**Status:** Open upstream PR [#4484](https://github.com/TandoorRecipes/recipes/pull/4484)

---

## Submission Order

| Order | Branch | Status | Next Action |
|-------|--------|--------|-------------|
| 1 | `feature/food-filters` | Preview PR on fork (#497) | Awaiting feedback → upstream PR |
| 2a | `feat/model-list-models` | ✅ Complete, preview PR (#496) | Upstream PR after food-filters merges |
| 2b | `feat/search-refactor` | Local branch | Development after food-filters merges |
| 3 | `feat/search-inventory` | Not started | After search-refactor merges |
| 4 | `feat/ingredient-context` | Not started | After search-inventory merges |
| — | `fix/household-sharing-cleanup` | Upstream PR #4484 | Awaiting review |

2a and 2b are independent and can be developed and reviewed in parallel.
