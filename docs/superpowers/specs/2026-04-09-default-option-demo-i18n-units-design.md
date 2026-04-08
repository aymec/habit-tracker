# Design: Default Option Rename, Demo i18n, Target Units

**Date:** 2026-04-09
**Status:** Approved

## Overview

Three related improvements to the habit tracker:

1. Rename the default option label from "One Unit" to "Customize Me" (internationalized)
2. Internationalize the demo data so it uses the active language
3. Add optional unit support to habit targets (e.g., "2L per day")

---

## Feature 1: Rename Default Option Label

### Change

In `src/context/HabitContext.tsx`, the default option created for new habits changes from `label: 'One Unit'` to use a translated string via a new key `habits.defaultOptionLabel` with value `"Customize Me"` in English.

### Files Changed

- `src/context/HabitContext.tsx` — use `i18next.t()` (direct import, since this is outside a component) to get the translated label
- All 12 locale files in `src/i18n/locales/` — add `habits.defaultOptionLabel` key

---

## Feature 2: Internationalize Demo Data

### Approach

The `populateTestData()` function in `src/services/storage.ts` accepts a translation function `t` as a parameter. All hardcoded English strings are replaced with translation keys.

### Translation Keys

Under the `data.demo` namespace:

**Habit names:**
- `data.demo.fruitsVeg` — "Fruits & Vegetables"
- `data.demo.drinkWater` — "Drink Water"
- `data.demo.reading` — "Reading"

**Option labels:**
- `data.demo.options.greenApple` — "Green Apple" (displayed with emoji, but label is translated)
- `data.demo.options.banana` — "Banana"
- `data.demo.options.avocado` — "Avocado"
- `data.demo.options.tomato` — "Tomato"
- `data.demo.options.kiwi` — "Kiwi"
- `data.demo.options.glassS` — "Glass S"
- `data.demo.options.glassL` — "Glass L"
- `data.demo.options.bottle` — "Bottle"
- `data.demo.options.oneBook` — "One book"

**Emojis remain unchanged** — they are universal.

### Caller Change

In `app/(tabs)/(home)/index.tsx`, the component that calls `populateTestData()` passes its `t` function from `useTranslation()`.

### Files Changed

- `src/services/storage.ts` — `populateTestData(t)` signature, all strings use `t()`
- `app/(tabs)/(home)/index.tsx` — pass `t` to `populateTestData`
- All 12 locale files — add `data.demo.*` keys

---

## Feature 3: Optional Unit on Targets

### Data Model

```typescript
// src/models/types.ts
export interface HabitTarget {
  value: number;
  period: TargetPeriod;
  unit?: string;       // Full name, e.g., "liters"
  unitShort?: string;  // Abbreviation, e.g., "L"
}
```

No migration needed — existing targets without `unit`/`unitShort` continue to work since both fields are optional.

### Common Units

Defined as a constant (in `target.tsx` or a shared constants file). Each unit has a translation key for the full name and short form.

| Category | Full Name (en) | Short (en) |
|----------|---------------|------------|
| **Volume** | liters | L |
| | milliliters | mL |
| | cups | cups |
| | fluid ounces | fl oz |
| | gallons | gal |
| **Weight** | kilograms | kg |
| | grams | g |
| | pounds | lbs |
| | ounces | oz |
| **Distance** | kilometers | km |
| | miles | mi |
| | meters | m |
| **Time** | minutes | min |
| | hours | hr |
| **Other** | calories | cal |
| | steps | steps |
| | pages | pages |
| | reps | reps |

Translation keys follow the pattern:
- `units.<key>.name` — full name (e.g., `units.liters.name` = "liters")
- `units.<key>.short` — abbreviation (e.g., `units.liters.short` = "L")
- `units.categories.<cat>` — category headers (e.g., `units.categories.volume` = "Volume")
- `units.custom` — "Custom" pill label
- `units.customName` — placeholder for custom unit name input
- `units.customShort` — placeholder for custom unit abbreviation input
- `units.optional` — "Unit (optional)" section label

### Target Screen UI (`target.tsx`)

Below the existing value input and period picker:

1. **Section label:** "Unit (optional)"
2. **Horizontal scrollable pill list**, grouped by category:
   - Small category header text (e.g., "Volume", "Weight")
   - Tappable pills showing the short form (e.g., "L", "mL", "kg")
   - Selected pill is highlighted with the theme accent color
   - Tapping a selected pill deselects it (unit becomes unset)
   - Last pill: "Custom" — when selected, reveals two text inputs:
     - "Unit name" (e.g., "glasses") — saved as `unit`
     - "Abbreviation" (e.g., "gl") — saved as `unitShort`
3. Unit selection is preserved when navigating back/forward on the target screen

### Display Format

Targets with units display the short form inline:

- **With unit:** `"2L per day"`, `"50 pages per year"`
- **Without unit:** `"2 per day"` (unchanged)

Translation keys updated:

- `habits.targetDisplay` — `"{{value}}{{unit}} per {{period}}"` (unit includes leading space or is empty)
- `habits.vsTarget` — `"vs. {{value}}{{unit}} per {{period}}"` (same pattern)

The `unit` interpolation variable is set to `unitShort` value when present, empty string when not. This keeps the translation simple — languages that need different word order can rearrange freely.

### Display Locations

| Screen | Current | With Unit |
|--------|---------|-----------|
| Goal (`goal.tsx`) | "vs. 2 per day" | "vs. 2L per day" |
| Edit (`edit.tsx`) | "Goal: 2 per day" | "Goal: 2L per day" |
| Target creation (`target.tsx`) | Preview shows "2 per day" | Preview shows "2L per day" |

### Edit Screen (`edit.tsx`)

When editing a target, the unit picker shows the current unit pre-selected. The user can change or remove the unit.

### Demo Data

"Drink Water" demo habit target becomes:
```typescript
{
  value: 2,
  period: 'day',
  unit: 'liters',      // translated via t('units.liters.name')
  unitShort: 'L'        // translated via t('units.liters.short')
}
```

---

## Files Changed Summary

| File | Changes |
|------|---------|
| `src/models/types.ts` | Add `unit?` and `unitShort?` to `HabitTarget` |
| `src/context/HabitContext.tsx` | Use i18n for default option label |
| `src/services/storage.ts` | Accept `t` param, translate demo data, add unit to water target |
| `app/(tabs)/(home)/index.tsx` | Pass `t` to `populateTestData` |
| `app/(tabs)/(home)/target.tsx` | Add unit picker UI (pills + custom input) |
| `app/(tabs)/(home)/goal.tsx` | Display unit in target label |
| `app/(tabs)/(home)/edit.tsx` | Display unit in target row, pass unit when editing |
| 12 locale files | Add keys: `habits.defaultOptionLabel`, `data.demo.*`, `units.*`, update `habits.vsTarget`/`habits.targetDisplay` |

## Out of Scope

- Unit conversion (e.g., converting between mL and L)
- Unit validation against target values
- Historical migration of existing targets to add units
