# Default Option Rename, Demo i18n, Target Units — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename default option to "Customize Me", internationalize demo data, and add optional unit support to habit targets.

**Architecture:** Three independent features touching shared locale files. Feature 1 (default option rename) and Feature 2 (demo i18n) are small changes. Feature 3 (units) adds optional `unit`/`unitShort` fields to `HabitTarget`, a pill-based unit picker to `target.tsx`, unit display in `goal.tsx` and `edit.tsx`, and unit editing in `edit.tsx`. All features add translation keys to all 12 locale files.

**Tech Stack:** React Native, Expo, TypeScript, i18next, AsyncStorage

---

## Task 1: Update Data Model — Add `unit` and `unitShort` to `HabitTarget`

**Files:**
- Modify: `src/models/types.ts:3-6`

- [ ] **Step 1: Add optional unit fields to HabitTarget**

In `src/models/types.ts`, add two optional fields to `HabitTarget`:

```typescript
export interface HabitTarget {
  value: number;
  period: TargetPeriod;
  unit?: string;       // Full name, e.g., "liters"
  unitShort?: string;  // Abbreviation, e.g., "L"
}
```

- [ ] **Step 2: Commit**

```bash
git add src/models/types.ts
git commit -m "feat: add optional unit and unitShort fields to HabitTarget"
```

---

## Task 2: Add All Translation Keys to All 12 Locale Files

**Files:**
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/es.json`
- Modify: `src/i18n/locales/fr.json`
- Modify: `src/i18n/locales/de.json`
- Modify: `src/i18n/locales/it.json`
- Modify: `src/i18n/locales/pt.json`
- Modify: `src/i18n/locales/nl.json`
- Modify: `src/i18n/locales/ru.json`
- Modify: `src/i18n/locales/ja.json`
- Modify: `src/i18n/locales/zh-CN.json`
- Modify: `src/i18n/locales/zh-TW.json`
- Modify: `src/i18n/locales/hi.json`

This task adds ALL new translation keys for all three features at once to avoid touching locale files multiple times.

### New keys to add:

**Feature 1 — Default option label:**
- `habits.defaultOptionLabel` — "Customize Me"

**Feature 2 — Demo data:**
- `data.demo.fruitsVeg` — "Fruits & Vegetables"
- `data.demo.drinkWater` — "Drink Water"
- `data.demo.reading` — "Reading"
- `data.demo.options.greenApple` — "Green Apple"
- `data.demo.options.banana` — "Banana"
- `data.demo.options.avocado` — "Avocado"
- `data.demo.options.tomato` — "Tomato"
- `data.demo.options.kiwi` — "Kiwi"
- `data.demo.options.glassS` — "Glass S"
- `data.demo.options.glassL` — "Glass L"
- `data.demo.options.bottle` — "Bottle"
- `data.demo.options.oneBook` — "One book"

**Feature 3 — Units:**
- `habits.targetDisplay` — update to `"{{value}}{{unit}} per {{period}}"` (add `{{unit}}`)
- `habits.vsTarget` — update to `"vs. {{value}}{{unit}} per {{period}}"` (add `{{unit}}`)
- `units.optional` — "Unit (optional)"
- `units.custom` — "Custom"
- `units.customName` — "Unit name"
- `units.customShort` — "Abbreviation"
- `units.categories.volume` — "Volume"
- `units.categories.weight` — "Weight"
- `units.categories.distance` — "Distance"
- `units.categories.time` — "Time"
- `units.categories.other` — "Other"
- `units.liters.name` / `units.liters.short` — "liters" / "L"
- `units.milliliters.name` / `units.milliliters.short` — "milliliters" / "mL"
- `units.cups.name` / `units.cups.short` — "cups" / "cups"
- `units.fluidOunces.name` / `units.fluidOunces.short` — "fluid ounces" / "fl oz"
- `units.gallons.name` / `units.gallons.short` — "gallons" / "gal"
- `units.kilograms.name` / `units.kilograms.short` — "kilograms" / "kg"
- `units.grams.name` / `units.grams.short` — "grams" / "g"
- `units.pounds.name` / `units.pounds.short` — "pounds" / "lbs"
- `units.ounces.name` / `units.ounces.short` — "ounces" / "oz"
- `units.kilometers.name` / `units.kilometers.short` — "kilometers" / "km"
- `units.miles.name` / `units.miles.short` — "miles" / "mi"
- `units.meters.name` / `units.meters.short` — "meters" / "m"
- `units.minutes.name` / `units.minutes.short` — "minutes" / "min"
- `units.hours.name` / `units.hours.short` — "hours" / "hr"
- `units.calories.name` / `units.calories.short` — "calories" / "cal"
- `units.steps.name` / `units.steps.short` — "steps" / "steps"
- `units.pages.name` / `units.pages.short` — "pages" / "pages"
- `units.reps.name` / `units.reps.short` — "reps" / "reps"

- [ ] **Step 1: Update `en.json`**

Add to the `habits` section:
```json
"defaultOptionLabel": "Customize Me"
```

Update existing keys in `habits`:
```json
"targetDisplay": "{{value}}{{unit}} per {{period}}",
"vsTarget": "vs. {{value}}{{unit}} per {{period}}"
```

Add to the `data` section (inside `data`):
```json
"demo": {
  "fruitsVeg": "Fruits & Vegetables",
  "drinkWater": "Drink Water",
  "reading": "Reading",
  "options": {
    "greenApple": "Green Apple",
    "banana": "Banana",
    "avocado": "Avocado",
    "tomato": "Tomato",
    "kiwi": "Kiwi",
    "glassS": "Glass S",
    "glassL": "Glass L",
    "bottle": "Bottle",
    "oneBook": "One book"
  }
}
```

Add new top-level `units` section:
```json
"units": {
  "optional": "Unit (optional)",
  "custom": "Custom",
  "customName": "Unit name",
  "customShort": "Abbreviation",
  "categories": {
    "volume": "Volume",
    "weight": "Weight",
    "distance": "Distance",
    "time": "Time",
    "other": "Other"
  },
  "liters": { "name": "liters", "short": "L" },
  "milliliters": { "name": "milliliters", "short": "mL" },
  "cups": { "name": "cups", "short": "cups" },
  "fluidOunces": { "name": "fluid ounces", "short": "fl oz" },
  "gallons": { "name": "gallons", "short": "gal" },
  "kilograms": { "name": "kilograms", "short": "kg" },
  "grams": { "name": "grams", "short": "g" },
  "pounds": { "name": "pounds", "short": "lbs" },
  "ounces": { "name": "ounces", "short": "oz" },
  "kilometers": { "name": "kilometers", "short": "km" },
  "miles": { "name": "miles", "short": "mi" },
  "meters": { "name": "meters", "short": "m" },
  "minutes": { "name": "minutes", "short": "min" },
  "hours": { "name": "hours", "short": "hr" },
  "calories": { "name": "calories", "short": "cal" },
  "steps": { "name": "steps", "short": "steps" },
  "pages": { "name": "pages", "short": "pages" },
  "reps": { "name": "reps", "short": "reps" }
}
```

- [ ] **Step 2: Update `fr.json`**

Add to `habits`:
```json
"defaultOptionLabel": "Personnaliser"
```

Update existing keys in `habits`:
```json
"targetDisplay": "{{value}}{{unit}} par {{period}}",
"vsTarget": "vs. {{value}}{{unit}} par {{period}}"
```

Add to `data`:
```json
"demo": {
  "fruitsVeg": "Fruits & Légumes",
  "drinkWater": "Boire de l'eau",
  "reading": "Lecture",
  "options": {
    "greenApple": "Pomme verte",
    "banana": "Banane",
    "avocado": "Avocat",
    "tomato": "Tomate",
    "kiwi": "Kiwi",
    "glassS": "Verre S",
    "glassL": "Verre L",
    "bottle": "Bouteille",
    "oneBook": "Un livre"
  }
}
```

Add `units`:
```json
"units": {
  "optional": "Unité (optionnel)",
  "custom": "Personnalisé",
  "customName": "Nom de l'unité",
  "customShort": "Abréviation",
  "categories": {
    "volume": "Volume",
    "weight": "Poids",
    "distance": "Distance",
    "time": "Temps",
    "other": "Autre"
  },
  "liters": { "name": "litres", "short": "L" },
  "milliliters": { "name": "millilitres", "short": "mL" },
  "cups": { "name": "tasses", "short": "tasses" },
  "fluidOunces": { "name": "onces liquides", "short": "fl oz" },
  "gallons": { "name": "gallons", "short": "gal" },
  "kilograms": { "name": "kilogrammes", "short": "kg" },
  "grams": { "name": "grammes", "short": "g" },
  "pounds": { "name": "livres", "short": "lbs" },
  "ounces": { "name": "onces", "short": "oz" },
  "kilometers": { "name": "kilomètres", "short": "km" },
  "miles": { "name": "miles", "short": "mi" },
  "meters": { "name": "mètres", "short": "m" },
  "minutes": { "name": "minutes", "short": "min" },
  "hours": { "name": "heures", "short": "h" },
  "calories": { "name": "calories", "short": "cal" },
  "steps": { "name": "pas", "short": "pas" },
  "pages": { "name": "pages", "short": "pages" },
  "reps": { "name": "répétitions", "short": "reps" }
}
```

- [ ] **Step 3: Update `es.json`**

Add to `habits`:
```json
"defaultOptionLabel": "Personalizar"
```

Update:
```json
"targetDisplay": "{{value}}{{unit}} por {{period}}",
"vsTarget": "vs. {{value}}{{unit}} por {{period}}"
```

Add `data.demo`:
```json
"demo": {
  "fruitsVeg": "Frutas y Verduras",
  "drinkWater": "Beber Agua",
  "reading": "Lectura",
  "options": {
    "greenApple": "Manzana verde",
    "banana": "Plátano",
    "avocado": "Aguacate",
    "tomato": "Tomate",
    "kiwi": "Kiwi",
    "glassS": "Vaso S",
    "glassL": "Vaso L",
    "bottle": "Botella",
    "oneBook": "Un libro"
  }
}
```

Add `units`:
```json
"units": {
  "optional": "Unidad (opcional)",
  "custom": "Personalizado",
  "customName": "Nombre de unidad",
  "customShort": "Abreviatura",
  "categories": {
    "volume": "Volumen",
    "weight": "Peso",
    "distance": "Distancia",
    "time": "Tiempo",
    "other": "Otro"
  },
  "liters": { "name": "litros", "short": "L" },
  "milliliters": { "name": "mililitros", "short": "mL" },
  "cups": { "name": "tazas", "short": "tazas" },
  "fluidOunces": { "name": "onzas líquidas", "short": "fl oz" },
  "gallons": { "name": "galones", "short": "gal" },
  "kilograms": { "name": "kilogramos", "short": "kg" },
  "grams": { "name": "gramos", "short": "g" },
  "pounds": { "name": "libras", "short": "lbs" },
  "ounces": { "name": "onzas", "short": "oz" },
  "kilometers": { "name": "kilómetros", "short": "km" },
  "miles": { "name": "millas", "short": "mi" },
  "meters": { "name": "metros", "short": "m" },
  "minutes": { "name": "minutos", "short": "min" },
  "hours": { "name": "horas", "short": "h" },
  "calories": { "name": "calorías", "short": "cal" },
  "steps": { "name": "pasos", "short": "pasos" },
  "pages": { "name": "páginas", "short": "págs" },
  "reps": { "name": "repeticiones", "short": "reps" }
}
```

- [ ] **Step 4: Update `de.json`**

Add to `habits`:
```json
"defaultOptionLabel": "Anpassen"
```

Update:
```json
"targetDisplay": "{{value}}{{unit}} pro {{period}}",
"vsTarget": "vs. {{value}}{{unit}} pro {{period}}"
```

Add `data.demo`:
```json
"demo": {
  "fruitsVeg": "Obst & Gemüse",
  "drinkWater": "Wasser trinken",
  "reading": "Lesen",
  "options": {
    "greenApple": "Grüner Apfel",
    "banana": "Banane",
    "avocado": "Avocado",
    "tomato": "Tomate",
    "kiwi": "Kiwi",
    "glassS": "Glas S",
    "glassL": "Glas L",
    "bottle": "Flasche",
    "oneBook": "Ein Buch"
  }
}
```

Add `units`:
```json
"units": {
  "optional": "Einheit (optional)",
  "custom": "Benutzerdefiniert",
  "customName": "Einheitsname",
  "customShort": "Abkürzung",
  "categories": {
    "volume": "Volumen",
    "weight": "Gewicht",
    "distance": "Entfernung",
    "time": "Zeit",
    "other": "Sonstiges"
  },
  "liters": { "name": "Liter", "short": "L" },
  "milliliters": { "name": "Milliliter", "short": "mL" },
  "cups": { "name": "Tassen", "short": "Tassen" },
  "fluidOunces": { "name": "Flüssigunzen", "short": "fl oz" },
  "gallons": { "name": "Gallonen", "short": "gal" },
  "kilograms": { "name": "Kilogramm", "short": "kg" },
  "grams": { "name": "Gramm", "short": "g" },
  "pounds": { "name": "Pfund", "short": "lbs" },
  "ounces": { "name": "Unzen", "short": "oz" },
  "kilometers": { "name": "Kilometer", "short": "km" },
  "miles": { "name": "Meilen", "short": "mi" },
  "meters": { "name": "Meter", "short": "m" },
  "minutes": { "name": "Minuten", "short": "Min" },
  "hours": { "name": "Stunden", "short": "Std" },
  "calories": { "name": "Kalorien", "short": "kcal" },
  "steps": { "name": "Schritte", "short": "Schritte" },
  "pages": { "name": "Seiten", "short": "Seiten" },
  "reps": { "name": "Wiederholungen", "short": "Wdh" }
}
```

- [ ] **Step 5: Update `it.json`**

Add to `habits`:
```json
"defaultOptionLabel": "Personalizza"
```

Update:
```json
"targetDisplay": "{{value}}{{unit}} al {{period}}",
"vsTarget": "vs. {{value}}{{unit}} al {{period}}"
```

Add `data.demo`:
```json
"demo": {
  "fruitsVeg": "Frutta e Verdura",
  "drinkWater": "Bere Acqua",
  "reading": "Lettura",
  "options": {
    "greenApple": "Mela verde",
    "banana": "Banana",
    "avocado": "Avocado",
    "tomato": "Pomodoro",
    "kiwi": "Kiwi",
    "glassS": "Bicchiere S",
    "glassL": "Bicchiere L",
    "bottle": "Bottiglia",
    "oneBook": "Un libro"
  }
}
```

Add `units`:
```json
"units": {
  "optional": "Unità (opzionale)",
  "custom": "Personalizzato",
  "customName": "Nome unità",
  "customShort": "Abbreviazione",
  "categories": {
    "volume": "Volume",
    "weight": "Peso",
    "distance": "Distanza",
    "time": "Tempo",
    "other": "Altro"
  },
  "liters": { "name": "litri", "short": "L" },
  "milliliters": { "name": "millilitri", "short": "mL" },
  "cups": { "name": "tazze", "short": "tazze" },
  "fluidOunces": { "name": "once liquide", "short": "fl oz" },
  "gallons": { "name": "galloni", "short": "gal" },
  "kilograms": { "name": "chilogrammi", "short": "kg" },
  "grams": { "name": "grammi", "short": "g" },
  "pounds": { "name": "libbre", "short": "lbs" },
  "ounces": { "name": "once", "short": "oz" },
  "kilometers": { "name": "chilometri", "short": "km" },
  "miles": { "name": "miglia", "short": "mi" },
  "meters": { "name": "metri", "short": "m" },
  "minutes": { "name": "minuti", "short": "min" },
  "hours": { "name": "ore", "short": "h" },
  "calories": { "name": "calorie", "short": "cal" },
  "steps": { "name": "passi", "short": "passi" },
  "pages": { "name": "pagine", "short": "pagine" },
  "reps": { "name": "ripetizioni", "short": "reps" }
}
```

- [ ] **Step 6: Update `pt.json`**

Add to `habits`:
```json
"defaultOptionLabel": "Personalizar"
```

Update:
```json
"targetDisplay": "{{value}}{{unit}} por {{period}}",
"vsTarget": "vs. {{value}}{{unit}} por {{period}}"
```

Add `data.demo`:
```json
"demo": {
  "fruitsVeg": "Frutas e Vegetais",
  "drinkWater": "Beber Água",
  "reading": "Leitura",
  "options": {
    "greenApple": "Maçã verde",
    "banana": "Banana",
    "avocado": "Abacate",
    "tomato": "Tomate",
    "kiwi": "Kiwi",
    "glassS": "Copo P",
    "glassL": "Copo G",
    "bottle": "Garrafa",
    "oneBook": "Um livro"
  }
}
```

Add `units`:
```json
"units": {
  "optional": "Unidade (opcional)",
  "custom": "Personalizado",
  "customName": "Nome da unidade",
  "customShort": "Abreviatura",
  "categories": {
    "volume": "Volume",
    "weight": "Peso",
    "distance": "Distância",
    "time": "Tempo",
    "other": "Outro"
  },
  "liters": { "name": "litros", "short": "L" },
  "milliliters": { "name": "mililitros", "short": "mL" },
  "cups": { "name": "xícaras", "short": "xíc" },
  "fluidOunces": { "name": "onças líquidas", "short": "fl oz" },
  "gallons": { "name": "galões", "short": "gal" },
  "kilograms": { "name": "quilogramas", "short": "kg" },
  "grams": { "name": "gramas", "short": "g" },
  "pounds": { "name": "libras", "short": "lbs" },
  "ounces": { "name": "onças", "short": "oz" },
  "kilometers": { "name": "quilômetros", "short": "km" },
  "miles": { "name": "milhas", "short": "mi" },
  "meters": { "name": "metros", "short": "m" },
  "minutes": { "name": "minutos", "short": "min" },
  "hours": { "name": "horas", "short": "h" },
  "calories": { "name": "calorias", "short": "cal" },
  "steps": { "name": "passos", "short": "passos" },
  "pages": { "name": "páginas", "short": "págs" },
  "reps": { "name": "repetições", "short": "reps" }
}
```

- [ ] **Step 7: Update `nl.json`**

Add to `habits`:
```json
"defaultOptionLabel": "Aanpassen"
```

Update:
```json
"targetDisplay": "{{value}}{{unit}} per {{period}}",
"vsTarget": "vs. {{value}}{{unit}} per {{period}}"
```

Add `data.demo`:
```json
"demo": {
  "fruitsVeg": "Groente & Fruit",
  "drinkWater": "Water drinken",
  "reading": "Lezen",
  "options": {
    "greenApple": "Groene appel",
    "banana": "Banaan",
    "avocado": "Avocado",
    "tomato": "Tomaat",
    "kiwi": "Kiwi",
    "glassS": "Glas S",
    "glassL": "Glas L",
    "bottle": "Fles",
    "oneBook": "Een boek"
  }
}
```

Add `units`:
```json
"units": {
  "optional": "Eenheid (optioneel)",
  "custom": "Aangepast",
  "customName": "Eenheidsnaam",
  "customShort": "Afkorting",
  "categories": {
    "volume": "Volume",
    "weight": "Gewicht",
    "distance": "Afstand",
    "time": "Tijd",
    "other": "Overig"
  },
  "liters": { "name": "liter", "short": "L" },
  "milliliters": { "name": "milliliter", "short": "mL" },
  "cups": { "name": "kopjes", "short": "kopjes" },
  "fluidOunces": { "name": "vloeibare ounces", "short": "fl oz" },
  "gallons": { "name": "gallons", "short": "gal" },
  "kilograms": { "name": "kilogram", "short": "kg" },
  "grams": { "name": "gram", "short": "g" },
  "pounds": { "name": "pond", "short": "lbs" },
  "ounces": { "name": "ounces", "short": "oz" },
  "kilometers": { "name": "kilometer", "short": "km" },
  "miles": { "name": "mijlen", "short": "mi" },
  "meters": { "name": "meter", "short": "m" },
  "minutes": { "name": "minuten", "short": "min" },
  "hours": { "name": "uren", "short": "u" },
  "calories": { "name": "calorieën", "short": "cal" },
  "steps": { "name": "stappen", "short": "stappen" },
  "pages": { "name": "pagina's", "short": "pag" },
  "reps": { "name": "herhalingen", "short": "herh" }
}
```

- [ ] **Step 8: Update `ru.json`**

Add to `habits`:
```json
"defaultOptionLabel": "Настроить"
```

Update:
```json
"targetDisplay": "{{value}}{{unit}} в {{period}}",
"vsTarget": "vs. {{value}}{{unit}} в {{period}}"
```

(Check the existing `targetDisplay` and `vsTarget` patterns in `ru.json` — use whatever preposition already exists in the file, e.g. "в" or "за".)

Add `data.demo`:
```json
"demo": {
  "fruitsVeg": "Фрукты и овощи",
  "drinkWater": "Пить воду",
  "reading": "Чтение",
  "options": {
    "greenApple": "Зелёное яблоко",
    "banana": "Банан",
    "avocado": "Авокадо",
    "tomato": "Помидор",
    "kiwi": "Киви",
    "glassS": "Стакан М",
    "glassL": "Стакан Б",
    "bottle": "Бутылка",
    "oneBook": "Одна книга"
  }
}
```

Add `units`:
```json
"units": {
  "optional": "Единица (необязательно)",
  "custom": "Другое",
  "customName": "Название единицы",
  "customShort": "Сокращение",
  "categories": {
    "volume": "Объём",
    "weight": "Вес",
    "distance": "Расстояние",
    "time": "Время",
    "other": "Прочее"
  },
  "liters": { "name": "литры", "short": "л" },
  "milliliters": { "name": "миллилитры", "short": "мл" },
  "cups": { "name": "чашки", "short": "чаш" },
  "fluidOunces": { "name": "жидкие унции", "short": "fl oz" },
  "gallons": { "name": "галлоны", "short": "гал" },
  "kilograms": { "name": "килограммы", "short": "кг" },
  "grams": { "name": "граммы", "short": "г" },
  "pounds": { "name": "фунты", "short": "фунт" },
  "ounces": { "name": "унции", "short": "унц" },
  "kilometers": { "name": "километры", "short": "км" },
  "miles": { "name": "мили", "short": "миль" },
  "meters": { "name": "метры", "short": "м" },
  "minutes": { "name": "минуты", "short": "мин" },
  "hours": { "name": "часы", "short": "ч" },
  "calories": { "name": "калории", "short": "кал" },
  "steps": { "name": "шаги", "short": "шаг" },
  "pages": { "name": "страницы", "short": "стр" },
  "reps": { "name": "повторения", "short": "повт" }
}
```

- [ ] **Step 9: Update `ja.json`**

Add to `habits`:
```json
"defaultOptionLabel": "カスタマイズ"
```

Update (note: Japanese uses reversed order):
```json
"targetDisplay": "{{period}}{{value}}{{unit}}",
"vsTarget": "vs. {{period}}{{value}}{{unit}}"
```

Add `data.demo`:
```json
"demo": {
  "fruitsVeg": "フルーツ＆野菜",
  "drinkWater": "水を飲む",
  "reading": "読書",
  "options": {
    "greenApple": "青りんご",
    "banana": "バナナ",
    "avocado": "アボカド",
    "tomato": "トマト",
    "kiwi": "キウイ",
    "glassS": "グラスS",
    "glassL": "グラスL",
    "bottle": "ボトル",
    "oneBook": "1冊"
  }
}
```

Add `units`:
```json
"units": {
  "optional": "単位（任意）",
  "custom": "カスタム",
  "customName": "単位名",
  "customShort": "略称",
  "categories": {
    "volume": "体積",
    "weight": "重量",
    "distance": "距離",
    "time": "時間",
    "other": "その他"
  },
  "liters": { "name": "リットル", "short": "L" },
  "milliliters": { "name": "ミリリットル", "short": "mL" },
  "cups": { "name": "カップ", "short": "杯" },
  "fluidOunces": { "name": "液量オンス", "short": "fl oz" },
  "gallons": { "name": "ガロン", "short": "gal" },
  "kilograms": { "name": "キログラム", "short": "kg" },
  "grams": { "name": "グラム", "short": "g" },
  "pounds": { "name": "ポンド", "short": "lbs" },
  "ounces": { "name": "オンス", "short": "oz" },
  "kilometers": { "name": "キロメートル", "short": "km" },
  "miles": { "name": "マイル", "short": "mi" },
  "meters": { "name": "メートル", "short": "m" },
  "minutes": { "name": "分", "short": "分" },
  "hours": { "name": "時間", "short": "時間" },
  "calories": { "name": "カロリー", "short": "cal" },
  "steps": { "name": "歩", "short": "歩" },
  "pages": { "name": "ページ", "short": "頁" },
  "reps": { "name": "回", "short": "回" }
}
```

- [ ] **Step 10: Update `zh-CN.json`**

Add to `habits`:
```json
"defaultOptionLabel": "自定义"
```

Update (check existing pattern — Chinese likely uses `"{{period}}{{value}}"` like Japanese):
```json
"targetDisplay": "{{period}}{{value}}{{unit}}",
"vsTarget": "vs. {{period}}{{value}}{{unit}}"
```

Add `data.demo`:
```json
"demo": {
  "fruitsVeg": "水果和蔬菜",
  "drinkWater": "喝水",
  "reading": "阅读",
  "options": {
    "greenApple": "青苹果",
    "banana": "香蕉",
    "avocado": "牛油果",
    "tomato": "番茄",
    "kiwi": "猕猴桃",
    "glassS": "小杯",
    "glassL": "大杯",
    "bottle": "水瓶",
    "oneBook": "一本书"
  }
}
```

Add `units`:
```json
"units": {
  "optional": "单位（可选）",
  "custom": "自定义",
  "customName": "单位名称",
  "customShort": "缩写",
  "categories": {
    "volume": "体积",
    "weight": "重量",
    "distance": "距离",
    "time": "时间",
    "other": "其他"
  },
  "liters": { "name": "升", "short": "L" },
  "milliliters": { "name": "毫升", "short": "mL" },
  "cups": { "name": "杯", "short": "杯" },
  "fluidOunces": { "name": "液盎司", "short": "fl oz" },
  "gallons": { "name": "加仑", "short": "gal" },
  "kilograms": { "name": "千克", "short": "kg" },
  "grams": { "name": "克", "short": "g" },
  "pounds": { "name": "磅", "short": "lbs" },
  "ounces": { "name": "盎司", "short": "oz" },
  "kilometers": { "name": "公里", "short": "km" },
  "miles": { "name": "英里", "short": "mi" },
  "meters": { "name": "米", "short": "m" },
  "minutes": { "name": "分钟", "short": "分" },
  "hours": { "name": "小时", "short": "时" },
  "calories": { "name": "卡路里", "short": "cal" },
  "steps": { "name": "步", "short": "步" },
  "pages": { "name": "页", "short": "页" },
  "reps": { "name": "次", "short": "次" }
}
```

- [ ] **Step 11: Update `zh-TW.json`**

Add to `habits`:
```json
"defaultOptionLabel": "自訂"
```

Update:
```json
"targetDisplay": "{{period}}{{value}}{{unit}}",
"vsTarget": "vs. {{period}}{{value}}{{unit}}"
```

Add `data.demo`:
```json
"demo": {
  "fruitsVeg": "水果與蔬菜",
  "drinkWater": "喝水",
  "reading": "閱讀",
  "options": {
    "greenApple": "青蘋果",
    "banana": "香蕉",
    "avocado": "酪梨",
    "tomato": "番茄",
    "kiwi": "奇異果",
    "glassS": "小杯",
    "glassL": "大杯",
    "bottle": "水瓶",
    "oneBook": "一本書"
  }
}
```

Add `units`:
```json
"units": {
  "optional": "單位（選填）",
  "custom": "自訂",
  "customName": "單位名稱",
  "customShort": "縮寫",
  "categories": {
    "volume": "體積",
    "weight": "重量",
    "distance": "距離",
    "time": "時間",
    "other": "其他"
  },
  "liters": { "name": "公升", "short": "L" },
  "milliliters": { "name": "毫升", "short": "mL" },
  "cups": { "name": "杯", "short": "杯" },
  "fluidOunces": { "name": "液盎司", "short": "fl oz" },
  "gallons": { "name": "加侖", "short": "gal" },
  "kilograms": { "name": "公斤", "short": "kg" },
  "grams": { "name": "公克", "short": "g" },
  "pounds": { "name": "磅", "short": "lbs" },
  "ounces": { "name": "盎司", "short": "oz" },
  "kilometers": { "name": "公里", "short": "km" },
  "miles": { "name": "英里", "short": "mi" },
  "meters": { "name": "公尺", "short": "m" },
  "minutes": { "name": "分鐘", "short": "分" },
  "hours": { "name": "小時", "short": "時" },
  "calories": { "name": "卡路里", "short": "cal" },
  "steps": { "name": "步", "short": "步" },
  "pages": { "name": "頁", "short": "頁" },
  "reps": { "name": "次", "short": "次" }
}
```

- [ ] **Step 12: Update `hi.json`**

Add to `habits`:
```json
"defaultOptionLabel": "अनुकूलित करें"
```

Update (check existing pattern in hi.json):
```json
"targetDisplay": "{{value}}{{unit}} प्रति {{period}}",
"vsTarget": "vs. {{value}}{{unit}} प्रति {{period}}"
```

Add `data.demo`:
```json
"demo": {
  "fruitsVeg": "फल और सब्ज़ियाँ",
  "drinkWater": "पानी पीना",
  "reading": "पढ़ना",
  "options": {
    "greenApple": "हरा सेब",
    "banana": "केला",
    "avocado": "एवोकाडो",
    "tomato": "टमाटर",
    "kiwi": "कीवी",
    "glassS": "गिलास S",
    "glassL": "गिलास L",
    "bottle": "बोतल",
    "oneBook": "एक किताब"
  }
}
```

Add `units`:
```json
"units": {
  "optional": "इकाई (वैकल्पिक)",
  "custom": "कस्टम",
  "customName": "इकाई का नाम",
  "customShort": "संक्षिप्त नाम",
  "categories": {
    "volume": "आयतन",
    "weight": "वज़न",
    "distance": "दूरी",
    "time": "समय",
    "other": "अन्य"
  },
  "liters": { "name": "लीटर", "short": "L" },
  "milliliters": { "name": "मिलीलीटर", "short": "mL" },
  "cups": { "name": "कप", "short": "कप" },
  "fluidOunces": { "name": "फ्लूइड आउंस", "short": "fl oz" },
  "gallons": { "name": "गैलन", "short": "gal" },
  "kilograms": { "name": "किलोग्राम", "short": "kg" },
  "grams": { "name": "ग्राम", "short": "g" },
  "pounds": { "name": "पाउंड", "short": "lbs" },
  "ounces": { "name": "आउंस", "short": "oz" },
  "kilometers": { "name": "किलोमीटर", "short": "km" },
  "miles": { "name": "मील", "short": "mi" },
  "meters": { "name": "मीटर", "short": "m" },
  "minutes": { "name": "मिनट", "short": "मिनट" },
  "hours": { "name": "घंटे", "short": "घंटा" },
  "calories": { "name": "कैलोरी", "short": "cal" },
  "steps": { "name": "कदम", "short": "कदम" },
  "pages": { "name": "पृष्ठ", "short": "पृष्ठ" },
  "reps": { "name": "दोहराव", "short": "रेप्स" }
}
```

- [ ] **Step 13: Commit all locale files**

```bash
git add src/i18n/locales/*.json
git commit -m "feat: add translation keys for default option, demo i18n, and units in all 12 locales"
```

---

## Task 3: Feature 1 — Rename Default Option Label

**Files:**
- Modify: `src/context/HabitContext.tsx:1-4,79-85`

- [ ] **Step 1: Import i18next and use translated label**

At the top of `src/context/HabitContext.tsx`, add import:

```typescript
import i18n from '../i18n';
```

Then change the default option creation (around line 80-84) from:

```typescript
const defaultOption: Option = {
  id: Date.now().toString(),
  habitId: activeHabitId,
  label: 'One Unit',
  value: 1
};
```

to:

```typescript
const defaultOption: Option = {
  id: Date.now().toString(),
  habitId: activeHabitId,
  label: i18n.t('habits.defaultOptionLabel'),
  value: 1
};
```

- [ ] **Step 2: Commit**

```bash
git add src/context/HabitContext.tsx
git commit -m "feat: rename default option label to translated 'Customize Me'"
```

---

## Task 4: Feature 2 — Internationalize Demo Data

**Files:**
- Modify: `src/services/storage.ts:153-255`
- Modify: `app/(tabs)/(home)/index.tsx:11,38-41`

- [ ] **Step 1: Update `populateTestData` to accept translation function**

In `src/services/storage.ts`, change the function signature and update all hardcoded strings.

Change line 153 from:

```typescript
export const populateTestData = async (): Promise<void> => {
```

to:

```typescript
export const populateTestData = async (t: (key: string) => string): Promise<void> => {
```

Update the `drinkWaterOptions` array (around line 165-169) to use translated labels:

```typescript
const drinkWaterOptions = [
  { label: t('data.demo.options.glassS'), value: 0.15 },
  { label: t('data.demo.options.glassL'), value: 0.25 },
  { label: t('data.demo.options.bottle'), value: 0.5 },
];
```

Update the `habitsData` array (around line 198-202) to use translated names and add unit to Drink Water:

```typescript
const habitsData: Habit[] = [
  { createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(), id: '1768198262233', name: `${t('data.demo.fruitsVeg')} 😋`, totalCount: 42, target: { value: 5, period: 'day' } },
  { createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(), id: drinkWaterHabitId, name: `${t('data.demo.drinkWater')} 💦`, totalCount: Math.round(drinkWaterTotal * 100) / 100, target: { value: 2, period: 'day', unit: t('units.liters.name'), unitShort: t('units.liters.short') } },
  { createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(), id: '1768196003754', name: `${t('data.demo.reading')} 📚`, totalCount: 3, target: { value: 50, period: 'year' } },
];
```

Update the `optionsData` (around line 204) — replace the hardcoded JSON.parse with translated options:

```typescript
const optionsData: Option[] = [
  { habitId: drinkWaterHabitId, id: '1768195720829', label: t('data.demo.options.glassS'), value: 0.15 },
  { habitId: drinkWaterHabitId, id: '1768195744249', label: t('data.demo.options.glassL'), value: 0.25 },
  { habitId: drinkWaterHabitId, id: '1768195751749', label: t('data.demo.options.bottle'), value: 0.5 },
  { habitId: '1768196003754', id: '1768196003922', label: t('data.demo.options.oneBook'), value: 1 },
  { habitId: '1768198262233', id: '1768198262453', label: '🍏', value: 1 },
  { habitId: '1768198262233', id: '1768198359819', label: '🍌', value: 1 },
  { habitId: '1768198262233', id: '1768198366820', label: '🥑', value: 1 },
  { habitId: '1768198262233', id: '1768198374136', label: '🍅', value: 1 },
  { habitId: '1768198262233', id: '1768198382019', label: '🥝', value: 1 },
];
```

Update the reading entries (around line 210-219) to use translated label:

```typescript
readingDates.forEach((daysAgo, i) => {
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  staticEntries.push({
    habitId: '1768196003754',
    id: `reading-${i}-${Date.now()}`,
    label: t('data.demo.options.oneBook'),
    timestamp: date.toISOString(),
    value: 1,
  });
});
```

- [ ] **Step 2: Update caller in `index.tsx`**

In `app/(tabs)/(home)/index.tsx`, change line 40 from:

```typescript
await populateTestData();
```

to:

```typescript
await populateTestData(t);
```

- [ ] **Step 3: Commit**

```bash
git add src/services/storage.ts app/\(tabs\)/\(home\)/index.tsx
git commit -m "feat: internationalize demo data using active language"
```

---

## Task 5: Feature 3 — Add Unit Picker to Target Screen

**Files:**
- Modify: `app/(tabs)/(home)/target.tsx`

- [ ] **Step 1: Add unit constants, state, and picker UI**

In `app/(tabs)/(home)/target.tsx`, make the following changes:

Add imports at the top (add `ScrollView` to the RN import):

```typescript
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Platform, Alert, ScrollView } from 'react-native';
```

Add the `HabitTarget` import:

```typescript
import { TargetPeriod, HabitTarget } from '../../../src/models/types';
```

Add unit constants after the `PERIODS` constant:

```typescript
interface UnitDef {
  key: string;
  category: 'volume' | 'weight' | 'distance' | 'time' | 'other';
}

const UNIT_DEFS: UnitDef[] = [
  { key: 'liters', category: 'volume' },
  { key: 'milliliters', category: 'volume' },
  { key: 'cups', category: 'volume' },
  { key: 'fluidOunces', category: 'volume' },
  { key: 'gallons', category: 'volume' },
  { key: 'kilograms', category: 'weight' },
  { key: 'grams', category: 'weight' },
  { key: 'pounds', category: 'weight' },
  { key: 'ounces', category: 'weight' },
  { key: 'kilometers', category: 'distance' },
  { key: 'miles', category: 'distance' },
  { key: 'meters', category: 'distance' },
  { key: 'minutes', category: 'time' },
  { key: 'hours', category: 'time' },
  { key: 'calories', category: 'other' },
  { key: 'steps', category: 'other' },
  { key: 'pages', category: 'other' },
  { key: 'reps', category: 'other' },
];

const CATEGORIES = ['volume', 'weight', 'distance', 'time', 'other'] as const;
```

Add state for unit selection inside the component (after the existing state declarations):

```typescript
const [selectedUnitKey, setSelectedUnitKey] = useState<string | null>(null);
const [isCustomUnit, setIsCustomUnit] = useState(false);
const [customUnitName, setCustomUnitName] = useState('');
const [customUnitShort, setCustomUnitShort] = useState('');
```

Update `handleNext` to include unit in the target. Change the call from:

```typescript
await createNewHabit(habitName, undefined, { value, period: selectedPeriod });
```

to:

```typescript
const target: HabitTarget = { value, period: selectedPeriod };
if (isCustomUnit && customUnitName.trim()) {
  target.unit = customUnitName.trim();
  target.unitShort = customUnitShort.trim() || customUnitName.trim();
} else if (selectedUnitKey) {
  target.unit = t(`units.${selectedUnitKey}.name`);
  target.unitShort = t(`units.${selectedUnitKey}.short`);
}
await createNewHabit(habitName, undefined, target);
```

Add a helper for toggling unit selection:

```typescript
const handleUnitPress = (unitKey: string) => {
  setIsCustomUnit(false);
  if (selectedUnitKey === unitKey) {
    setSelectedUnitKey(null);
  } else {
    setSelectedUnitKey(unitKey);
  }
};

const handleCustomPress = () => {
  setSelectedUnitKey(null);
  setIsCustomUnit(!isCustomUnit);
};
```

Add the unit picker UI after the period selector `</View>` and before the closing `</View>` of the section. Insert this block:

```tsx
{/* Unit Picker */}
<View style={styles.unitSection}>
  <Text style={[styles.unitSectionLabel, { color: theme.colors.textSecondary }]}>
    {t('units.optional')}
  </Text>

  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitScroll}>
    <View style={styles.unitPillsRow}>
      {CATEGORIES.map((category) => {
        const categoryUnits = UNIT_DEFS.filter(u => u.category === category);
        return (
          <View key={category} style={styles.unitCategoryGroup}>
            <Text style={[styles.unitCategoryLabel, { color: theme.colors.textSecondary }]}>
              {t(`units.categories.${category}`)}
            </Text>
            <View style={styles.unitCategoryPills}>
              {categoryUnits.map((unitDef) => (
                <TouchableOpacity
                  key={unitDef.key}
                  style={[
                    styles.unitPill,
                    {
                      backgroundColor: selectedUnitKey === unitDef.key ? theme.colors.primary : theme.colors.card,
                      borderColor: selectedUnitKey === unitDef.key ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  onPress={() => handleUnitPress(unitDef.key)}
                >
                  <Text
                    style={[
                      styles.unitPillText,
                      { color: selectedUnitKey === unitDef.key ? '#FFFFFF' : theme.colors.text },
                    ]}
                  >
                    {t(`units.${unitDef.key}.short`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      })}
      {/* Custom pill */}
      <View style={styles.unitCategoryGroup}>
        <Text style={[styles.unitCategoryLabel, { color: theme.colors.textSecondary }]}>{' '}</Text>
        <View style={styles.unitCategoryPills}>
          <TouchableOpacity
            style={[
              styles.unitPill,
              {
                backgroundColor: isCustomUnit ? theme.colors.primary : theme.colors.card,
                borderColor: isCustomUnit ? theme.colors.primary : theme.colors.border,
              },
            ]}
            onPress={handleCustomPress}
          >
            <Text
              style={[
                styles.unitPillText,
                { color: isCustomUnit ? '#FFFFFF' : theme.colors.text },
              ]}
            >
              {t('units.custom')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </ScrollView>

  {isCustomUnit && (
    <View style={styles.customUnitInputs}>
      <TextInput
        style={[
          styles.customUnitInput,
          {
            backgroundColor: theme.colors.card,
            color: theme.colors.text,
            borderColor: theme.colors.border,
            flex: 2,
          },
        ]}
        value={customUnitName}
        onChangeText={setCustomUnitName}
        placeholder={t('units.customName')}
        placeholderTextColor={theme.colors.textSecondary}
      />
      <TextInput
        style={[
          styles.customUnitInput,
          {
            backgroundColor: theme.colors.card,
            color: theme.colors.text,
            borderColor: theme.colors.border,
            flex: 1,
          },
        ]}
        value={customUnitShort}
        onChangeText={setCustomUnitShort}
        placeholder={t('units.customShort')}
        placeholderTextColor={theme.colors.textSecondary}
      />
    </View>
  )}
</View>
```

Add new styles:

```typescript
unitSection: {
  marginTop: 20,
},
unitSectionLabel: {
  fontSize: 14,
  fontWeight: '600',
  marginBottom: 10,
},
unitScroll: {
  marginBottom: 10,
},
unitPillsRow: {
  flexDirection: 'row',
  gap: 15,
},
unitCategoryGroup: {
  gap: 6,
},
unitCategoryLabel: {
  fontSize: 11,
  fontWeight: '500',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
},
unitCategoryPills: {
  flexDirection: 'row',
  gap: 6,
},
unitPill: {
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 16,
  borderWidth: 1,
},
unitPillText: {
  fontSize: 13,
  fontWeight: '500',
},
customUnitInputs: {
  flexDirection: 'row',
  gap: 10,
  marginTop: 10,
},
customUnitInput: {
  height: 40,
  borderWidth: 1,
  borderRadius: 8,
  paddingHorizontal: 12,
  fontSize: 14,
},
```

- [ ] **Step 2: Verify the app builds**

Run: `npx expo start --web` (or your preferred platform) and navigate to the target screen to confirm the unit picker renders.

- [ ] **Step 3: Commit**

```bash
git add app/\(tabs\)/\(home\)/target.tsx
git commit -m "feat: add unit picker with common units and custom option to target screen"
```

---

## Task 6: Feature 3 — Display Unit in Goal and Edit Screens

**Files:**
- Modify: `app/(tabs)/(home)/goal.tsx:128-134`
- Modify: `app/(tabs)/(home)/edit.tsx:91-95,105-128,130-136,345-407`

- [ ] **Step 1: Update goal screen to show unit**

In `app/(tabs)/(home)/goal.tsx`, update the target display (around line 128-134).

Change:

```typescript
{activeHabit.target
  ? t('habits.vsTarget', {
      value: formatNumber(activeHabit.target.value),
      period: t(`habits.period.${activeHabit.target.period}`)
    })
  : t('history.totalCount')}
```

to:

```typescript
{activeHabit.target
  ? t('habits.vsTarget', {
      value: formatNumber(activeHabit.target.value),
      unit: activeHabit.target.unitShort ? activeHabit.target.unitShort : '',
      period: t(`habits.period.${activeHabit.target.period}`)
    })
  : t('history.totalCount')}
```

- [ ] **Step 2: Update edit screen `formatTarget` to show unit**

In `app/(tabs)/(home)/edit.tsx`, update the `formatTarget` function (around line 130-136).

Change:

```typescript
const formatTarget = (target?: HabitTarget): string => {
  if (!target) return t('habits.noTarget');
  return t('habits.targetDisplay', {
    value: formatNumber(target.value),
    period: t(`habits.period.${target.period}`)
  });
};
```

to:

```typescript
const formatTarget = (target?: HabitTarget): string => {
  if (!target) return t('habits.noTarget');
  return t('habits.targetDisplay', {
    value: formatNumber(target.value),
    unit: target.unitShort ? target.unitShort : '',
    period: t(`habits.period.${target.period}`)
  });
};
```

- [ ] **Step 3: Update edit screen `saveTarget` to preserve/edit unit**

In `app/(tabs)/(home)/edit.tsx`, add state for unit editing. After the existing target edit state declarations (around line 42-43):

```typescript
const [editedTargetUnit, setEditedTargetUnit] = useState<string | null>(null);
const [editedTargetUnitShort, setEditedTargetUnitShort] = useState<string | null>(null);
```

Update `startEditTarget` (around line 91-95) to also load the current unit:

Change:

```typescript
const startEditTarget = () => {
  if (activeHabit) {
    setEditedTargetValue(activeHabit.target?.value?.toString() || '');
    setEditedTargetPeriod(activeHabit.target?.period || 'day');
    setIsEditingTarget(true);
  }
};
```

to:

```typescript
const startEditTarget = () => {
  if (activeHabit) {
    setEditedTargetValue(activeHabit.target?.value?.toString() || '');
    setEditedTargetPeriod(activeHabit.target?.period || 'day');
    setEditedTargetUnit(activeHabit.target?.unit || null);
    setEditedTargetUnitShort(activeHabit.target?.unitShort || null);
    setIsEditingTarget(true);
  }
};
```

Update `cancelEditTarget` to also reset unit state:

```typescript
const cancelEditTarget = () => {
  setIsEditingTarget(false);
  setEditedTargetValue('');
  setEditedTargetPeriod('day');
  setEditedTargetUnit(null);
  setEditedTargetUnitShort(null);
};
```

Update `saveTarget` (around line 105-128) to include unit:

Change the target creation inside `saveTarget` from:

```typescript
let newTarget: HabitTarget | undefined = undefined;
const value = parseFloat(editedTargetValue);
if (!isNaN(value) && value > 0) {
  newTarget = { value, period: editedTargetPeriod };
}
```

to:

```typescript
let newTarget: HabitTarget | undefined = undefined;
const value = parseFloat(editedTargetValue);
if (!isNaN(value) && value > 0) {
  newTarget = { value, period: editedTargetPeriod };
  if (editedTargetUnit) {
    newTarget.unit = editedTargetUnit;
    newTarget.unitShort = editedTargetUnitShort || editedTargetUnit;
  }
}
```

In the target editing UI section (around line 345-397), add a simple unit text input after the period selector. After the `</View>` that closes the `periodSelector` and before the `</View>` that closes `targetEditRow`, add:

```tsx
<TextInput
  style={[
    styles.targetValueInput,
    {
      backgroundColor: theme.colors.card,
      color: theme.colors.text,
      borderColor: theme.colors.border,
      width: 80,
    },
  ]}
  value={editedTargetUnitShort || ''}
  onChangeText={(text) => {
    setEditedTargetUnitShort(text || null);
    setEditedTargetUnit(text || null);
  }}
  placeholder={t('units.customShort')}
  placeholderTextColor={theme.colors.textSecondary}
/>
```

- [ ] **Step 4: Commit**

```bash
git add app/\(tabs\)/\(home\)/goal.tsx app/\(tabs\)/\(home\)/edit.tsx
git commit -m "feat: display unit in target labels on goal and edit screens"
```

---

## Task 7: Verify and Test

- [ ] **Step 1: Run linter**

```bash
cd /Users/a-chalochet/dev/habit-tracker && npm run lint
```

Fix any lint errors.

- [ ] **Step 2: Run tests**

```bash
cd /Users/a-chalochet/dev/habit-tracker && npm test
```

Fix any test failures.

- [ ] **Step 3: Manual verification**

Start the app and verify:
1. Create a new habit — default option should say "Customize Me" (or translated equivalent)
2. Start demo — habit names and option labels should be in the active language
3. Demo "Drink Water" target should show "2L per day" (or translated equivalent)
4. Create a habit with a target and select a unit — verify it shows on goal screen
5. Edit a target — verify unit field is populated and editable
6. Create a target without a unit — verify display is unchanged ("2 per day")

```bash
cd /Users/a-chalochet/dev/habit-tracker && npm run start
```

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: address lint and test issues from unit feature"
```
