# Food Management Enhancement — Architecture Plan

> **This is the implementation plan.** For canonical requirements and specifications, see [`data/FOOD_REQUIREMENTS.md`](../data/FOOD_REQUIREMENTS.md). For mockup coverage analysis, see [`data/food-mockup-review.md`](../data/food-mockup-review.md).

**Branch:** `feat/food-filters` (Phase 1), future phases in separate branches
**Status:** Phase 1 — Complete

---

## Core Approach: Enhance ModelListPage

Extend `ModelListPage.vue` and the `Model` type in `Models.ts` so enhanced capabilities (configurable columns, filters, tree view, action menus, settings panel) activate automatically when a model provides the necessary configuration. Food is the first model to provide this config, but the system works for any model.

### Key Decisions
- **No new page**: `ModelListPage.vue` gains capabilities driven by model config
- **Model type drives everything**: Extended `Model` type in `Models.ts` has optional `columnDefs`, `filterDefs`, `actionDefs`, `listSettings` fields
- **Filter state in URL**: via `useRouteQuery` (existing pattern from SearchPage)
- **hasSubstitute filter**: Means "has substitutes configured"
- **Backend filters**: Custom `get_queryset()` additions to FoodViewSet (Tandoor pattern — no django-filter)
- **Settings in DeviceSettings**: `food_*` prefixed settings in `settings.ts`
- **Generic types from start**: Column/filter/action interfaces are model-agnostic

---

## Phased Implementation

### Phase 1: Backend Filters + Types Foundation
**Branch:** `feat/food-filters`

- [x] Write backend filter tests (TDD) — 17 tests in `test_api_food.py` (merged into main food test file per project convention)
- [x] Add filter params to `FoodViewSet.get_queryset()` — 7 filters implemented
- [x] Add OpenAPI parameter docs — `@extend_schema_view` on FoodViewSet (includes TreeMixin params)
- [x] Create generic type interfaces — `vue3/src/composables/modellist/types.ts`
- [x] Create Food list config — `vue3/src/composables/modellist/FoodList.ts`
- [x] Extend `Model` type in `Models.ts` with optional enhanced fields
- [x] Update `TFood` to include enhanced tableHeaders + config references
- [x] Add food device settings to `settings.ts` and defaults
- [x] Extend `GenericListRequestParameter` for filter passthrough
- [x] Bug fix: `.distinct()` on onhand M2M filter to prevent duplicate rows
- [x] Bug fix: `try/except ValueError` on supermarket_category for non-integer input
- [x] Bug fix: correct toggleField, tableHeader key, and mobileSubtitle defaults

### Phase 2: Column System + Filter System
- [ ] Create column composable (`useModelListColumns.ts`)
- [ ] Create filter composable (`useModelListFilters.ts` with `useRouteQuery` sync)
- [ ] Create cell renderer component (`ModelListColumnCell.vue`)
- [ ] Create filter UI components (`TriStateToggle.vue`, `ModelListFilterBar.vue`, `ModelListFilterPanel.vue`)
- [ ] Integrate into `ModelListPage.vue`

### Phase 3: Action System + Settings Panel
- [ ] Create action composable (`useModelListActions.ts`)
- [ ] Create action menu component (`ModelListActionMenu.vue`)
- [ ] Create settings drawer (`ModelListSettingsDrawer.vue`)
- [ ] Wire settings to DeviceSettings persistence

### Phase 4: Tree View
- [ ] Create tree composable (`useModelListTree.ts`)
- [ ] Add tree indent + chevron rendering to name column
- [ ] Wire tree toggle to settings panel

### Phase 5: Mobile Layout
- [ ] Create mobile list component (`ModelListMobile.vue`)
- [ ] Conditional rendering in ModelListPage

### Phase 6: Stats Footer + Polish
- [ ] Create stats footer component (`ModelListStatsFooter.vue`)
- [ ] Wire to settings toggle

---

## API Changes — Phase 1

### New Query Parameters for `/api/food/`

| Parameter | Type | Description |
|-----------|------|-------------|
| `onhand` | bool | Filter by on-hand status |
| `has_substitute` | bool | Has substitutes configured |
| `in_shopping_list` | bool | Currently in shopping list |
| `ignore_shopping` | bool | Ignore shopping flag |
| `has_children` | bool | Has child foods (numchild > 0) |
| `has_recipe` | bool | Has linked recipe |
| `supermarket_category` | int | Filter by category ID |

### Backend Implementation Pattern
```python
# In FoodViewSet.get_queryset(), after existing code:
param = self.request.query_params.get('param_name', None)
if param is not None:
    if str2bool(param):
        self.queryset = self.queryset.filter(...)
    else:
        self.queryset = self.queryset.exclude(...)
```

---

## File Changes Summary

### Backend (Phase 1)
| File | Changes |
|------|---------|
| `cookbook/tests/api/test_api_food.py` | Filter tests merged into main food test file (17 filter tests) |
| `cookbook/views/api.py` | FoodViewSet.get_queryset() filters + @extend_schema_view |

### Frontend Types (Phase 1)
| File | Changes |
|------|---------|
| `vue3/src/composables/modellist/types.ts` | **NEW** — Generic interfaces (ModelFilterDef, ModelActionDef, etc.) |
| `vue3/src/composables/modellist/FoodList.ts` | **NEW** — Food's filter/action/settings config |
| `vue3/src/types/Models.ts` | Extend Model type, update TFood |
| `vue3/src/types/settings.ts` | Add food_* device settings |
| `vue3/src/stores/UserPreferenceStore.ts` | Add food defaults |

### Future Phases
| File | Phase |
|------|-------|
| `vue3/src/composables/modellist/useModelList*.ts` (4 files) | 2-4 |
| `vue3/src/components/model_list/*.vue` (7 files) | 2-6 |
| `vue3/src/pages/ModelListPage.vue` | 2-6 |

---

## References

- Current Food model: `cookbook/models.py`
- Current Food list: `vue3/src/pages/ModelListPage.vue`
- FoodViewSet: `cookbook/views/api.py:953-980`
- TreeMixin: `cookbook/views/api.py:435-477`
- Food table headers: `vue3/src/types/Models.ts:220-225`
- Device settings pattern: `vue3/src/types/settings.ts`
- str2bool: `cookbook/helper/HelperFunctions.py:17-21`
