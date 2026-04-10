# Happy Adoptions AI — Product Specification: Spanish (Spain) Language Support

> **Part of The Happy Factory suite.**
> Follows all platform conventions defined in `HAPPY-FACTORY-CONTEXT.md` and `BRAND-SPEC.md`.
> Design reference: `happy-shelter-ai`.

---

## 1. Vision

Happy Adoptions AI is a multi-role pet adoption platform that uses AI to match adopters with dogs based on lifestyle compatibility, and helps volunteers assess and list dogs for adoption. It combines quiz-based profiling, AI matching (Cohere), and photo-based visual similarity search (Groq/Llama Vision).

This spec covers **adding Spanish (Spain) — `es-ES`** as the first non-English language, establishing the i18n foundation for future localization across all Happy Factory apps.

**Core insight:** The platform targets the Iberian Peninsula as its initial region. Spanish-speaking adopters and shelter volunteers in Spain are the primary audience — the app must speak their language natively, not as an afterthought.

**Scope:** Full i18n infrastructure + complete `es-ES` translation of all user-facing strings, AI prompts, and email templates.

---

## 2. Target Users

| Persona | Language Need |
|---------|--------------|
| **Spanish adopter** | Browse quiz, results, and dog profiles entirely in Spanish |
| **Spanish volunteer** | Post dogs, assess temperament, and manage listings in Spanish |
| **Bilingual user** | Switch between English and Spanish freely, preference persisted |
| **Shelter staff (Spain)** | Receive AI-generated match reports and adopter profiles in Spanish |

**Locale:** `es-ES` (Castilian Spanish, not Latin American variants). Uses European conventions: comma as decimal separator, 24-hour time, `dd/mm/yyyy` date format.

---

## 3. Feature Tiers

i18n is **not a premium feature** — all language support is available to all users on all tiers.

| Feature | Free | Premium |
|---------|------|---------|
| Full UI in Spanish | Yes | Yes |
| AI match results in Spanish | Yes | Yes |
| AI dog assessments in Spanish | Yes | Yes |
| Email templates in Spanish | Yes | Yes |
| Language switcher | Yes | Yes |

---

## 4. Feature Details

### 4.1 i18n Infrastructure

**Library:** `next-intl` (recommended for Next.js App Router, lightweight, supports server components).

**Directory structure:**

```
src/
  i18n/
    config.ts              # Supported locales, default locale
    request.ts             # next-intl request config
  messages/
    en.json                # English translations (extracted from current hardcoded strings)
    es-ES.json             # Spanish (Spain) translations
```

**Locale detection strategy (no URL prefix):**

1. Check user preference in `localStorage` (`adoptions_locale`)
2. Fall back to browser `Accept-Language` header
3. Default to `en`

**No URL-based routing** (no `/es/quiz` or `/en/quiz`). The app is a PWA with a single deployment — locale is a user preference, not a URL path. This keeps URLs clean and avoids duplicate routes on Cloudflare Workers.

### 4.2 Translation Scope

All user-facing strings must be extracted and translated. Organized by namespace:

| Namespace | Description | Approx. String Count |
|-----------|-------------|---------------------|
| `common` | Shared UI: buttons, labels, navigation, errors, toasts | ~60 |
| `nav` | NavBar and BottomNav labels | ~10 |
| `home` | Home page, role selection | ~15 |
| `quiz` | All 6 quiz steps: ContactStep, HouseholdStep, HousingStep, LifestyleStep, ExperienceStep, PreferencesStep | ~80 |
| `results` | Match results page, scores, compatibility explanations | ~30 |
| `assess` | Volunteer dog assessment tool | ~20 |
| `postDog` | Dog posting form (all fields, validation messages) | ~40 |
| `dogDetail` | Individual dog profile page | ~20 |
| `dashboard` | User dashboard | ~15 |
| `shelters` | Shelter browsing page | ~10 |
| `auth` | Login page, magic link flow, session messages | ~15 |
| `favorites` | Favorites management | ~10 |
| `offline` | Offline fallback page | ~5 |
| **Total** | | **~330 strings** |

### 4.3 AI Response Localization

AI-generated content must respect the user's language:

**Cohere match responses** (`src/lib/ai/match.js`):
- Add a `language` parameter to `matchDogsToAdopter()`, `assessDogForAdoption()`, and `matchVolunteerOpportunities()`
- Append to system prompt: `"Respond entirely in {language}. Use natural, friendly {language} phrasing."`
- Structured fields (JSON keys) remain in English; only human-readable values are translated

**Groq vision responses** (`src/lib/ai/vision.js`):
- `describePhoto()` and `describeDogPhotos()` return structured data (breed, size, coat) — these remain in English as they're used for matching logic
- Display-facing descriptions (if shown to users) are translated client-side using a mapping

**Example prompt modification:**
```
// Current
"You are a dog adoption matching expert..."

// Localized
"You are a dog adoption matching expert. Respond entirely in Spanish (Spain).
Use natural Castilian Spanish phrasing, including vosotros forms where appropriate..."
```

### 4.4 Email Template Localization

Magic link emails (`src/lib/auth/magic-link.js`):
- Store the user's locale preference at send time
- Render email subject and body in the appropriate language
- Fallback to English if locale unknown (e.g., first-time user)

### 4.5 Language Switcher Component

**New component:** `src/components/LanguageSwitcher.jsx`

- Appears in NavBar (desktop) and Settings/Profile area (mobile)
- Displays current language flag + name (e.g., "EN" / "ES")
- Click toggles between available locales
- Saves preference to `localStorage` (`adoptions_locale`)
- Page re-renders without navigation (client-side locale swap)

### 4.6 Date, Number, and Unit Formatting

| Format | English (`en`) | Spanish (`es-ES`) |
|--------|---------------|-------------------|
| Date | Apr 10, 2026 | 10 abr 2026 |
| Time | 3:30 PM | 15:30 |
| Number | 1,234.5 | 1.234,5 |
| Weight | 25 kg | 25 kg |
| Distance | — | — |
| Currency | $9.99/mo | 9,99 $/mes |

Use `Intl.DateTimeFormat` and `Intl.NumberFormat` with the active locale.

### 4.7 Quiz Answer Localization

Quiz option labels (e.g., "Apartment", "House with garden", "Very active") must be translated for display but stored in English in the database. This ensures:
- AI matching prompts always receive English profile data
- Consistency across users regardless of language
- No data migration needed

**Implementation:** Quiz options use translation keys for display, but submit English values.

---

## 5. Data Model Changes

Minimal schema changes required:

```sql
-- Add locale preference to users table
ALTER TABLE users ADD COLUMN locale VARCHAR(10) DEFAULT 'en';

-- No other schema changes needed — quiz data and AI results
-- are stored as JSONB and remain in English internally
```

**No new tables.** Translation files are static JSON, not database-driven.

---

## 6. AI Integration

| Provider | Model | i18n Impact |
|----------|-------|-------------|
| **Cohere** | `command-a-03-2025` | System prompts gain locale instruction; response language matches user preference |
| **Groq** | `llama-4-scout-17b-16e-instruct` | Structured vision output stays English; display labels translated client-side |

**Prompt strategy:** Append locale instruction to existing system prompts rather than maintaining separate prompt templates per language. This keeps prompt maintenance simple and leverages the models' multilingual capabilities.

**AI quality consideration:** Cohere's `command-a-03-2025` has strong Spanish capabilities. Test match quality in Spanish to ensure compatibility explanations are natural and accurate. Key areas to validate:
- Dog temperament descriptions sound natural in Castilian Spanish
- Match explanations use appropriate pet/adoption terminology
- Vosotros vs. usted forms are consistent (prefer informal/friendly tone)

---

## 7. Navigation & Screens

No new screens. All existing screens gain translated content:

| Screen | Route | i18n Changes |
|--------|-------|-------------|
| Home | `/` | Role selection text, hero copy, CTAs |
| Quiz (6 steps) | `/quiz` | All questions, options, progress labels, validation |
| Results | `/results` | Match scores, explanations, breed recommendations |
| Dog Detail | `/dogs/[id]` | Labels, temperament tags, action buttons |
| Assess | `/assess` | Assessment form, AI-generated profile |
| Post a Dog | `/post-a-dog` | All form fields, validation, success messages |
| Dashboard | `/dashboard` | Section headers, status labels |
| Shelters | `/shelters` | Shelter list labels |
| Login | `/login` | Email input, magic link instructions |
| Offline | `/offline` | Offline message |
| NavBar / BottomNav | (global) | Nav labels + language switcher |

---

## 8. Tech Stack

| Layer | Technology | i18n Role |
|-------|-----------|-----------|
| **i18n library** | `next-intl` | Translation loading, `useTranslations` hook, server component support |
| **Locale storage** | `localStorage` + `users.locale` column | Client preference + server persistence |
| **Formatting** | `Intl.DateTimeFormat`, `Intl.NumberFormat` | Native browser APIs for dates/numbers |
| **AI prompts** | Cohere / Groq | Locale-aware system prompt injection |
| **Emails** | Resend | Locale-aware HTML templates |
| **Framework** | Next.js 16 (App Router) | `next-intl` integrates via middleware + providers |
| **Deployment** | Cloudflare Workers | No routing changes needed (no URL prefixes) |

---

## 9. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Translation coverage | 100% of user-facing strings in `es-ES` |
| Bundle size impact | < 5KB per locale (JSON translations are small) |
| Locale switch latency | < 100ms (client-side, no page reload) |
| AI response language accuracy | > 95% of AI responses in correct language |
| Fallback behavior | Missing translation key → English fallback (never show raw keys) |
| RTL support | Not needed (Spanish is LTR) |
| Accessibility | `lang` attribute on `<html>` updates with locale |
| SEO | `<meta>` language tag reflects active locale |
| Testing | All quiz flows verified in both languages |

---

## 10. Phased Roadmap

### Phase 1 — i18n Infrastructure (Current Sprint)

- [ ] Install `next-intl` and configure for App Router
- [ ] Create `src/i18n/config.ts` with supported locales (`en`, `es-ES`)
- [ ] Create `src/i18n/request.ts` for server-side locale resolution
- [ ] Extract all hardcoded English strings into `src/messages/en.json`
- [ ] Add locale detection: `localStorage` → `Accept-Language` → default `en`
- [ ] Add `locale` column to `users` table
- [ ] Update `<html lang="">` to reflect active locale

### Phase 2 — Component Migration

- [ ] Replace hardcoded strings in all components with `useTranslations()` calls
- [ ] Migrate quiz steps: ContactStep, HouseholdStep, HousingStep, LifestyleStep, ExperienceStep, PreferencesStep
- [ ] Migrate results page, dog detail, dashboard, shelters
- [ ] Migrate NavBar, BottomNav, and shared UI components
- [ ] Migrate auth flow: login page, magic link email templates
- [ ] Migrate error messages and toast notifications
- [ ] Ensure quiz submits English values regardless of display language

### Phase 3 — Spanish Translation

- [ ] Create `src/messages/es-ES.json` with all ~330 translated strings
- [ ] Use Castilian Spanish conventions (vosotros, European terminology)
- [ ] Pet/adoption domain terminology review (protectora, acogida, adopcion, etc.)
- [ ] Date/number formatting with `es-ES` locale

### Phase 4 — AI Localization

- [ ] Add `language` parameter to `matchDogsToAdopter()`
- [ ] Add `language` parameter to `assessDogForAdoption()`
- [ ] Add `language` parameter to `matchVolunteerOpportunities()`
- [ ] Update Cohere system prompts with locale instruction
- [ ] Test AI match quality in Spanish (natural phrasing, correct terminology)
- [ ] Localize magic link email templates

### Phase 5 — Language Switcher & Polish

- [ ] Build `LanguageSwitcher.jsx` component
- [ ] Add to NavBar (desktop) and settings area (mobile)
- [ ] Persist preference to `localStorage` and `users.locale`
- [ ] Test full flows in Spanish: quiz → results → dog detail → favorites
- [ ] Test volunteer flows in Spanish: assess → post dog
- [ ] Verify offline page displays in correct language
- [ ] Update PWA manifest with localized app name/description

### Future Phases

- **Phase 6:** Additional languages (Portuguese `pt-PT`, Catalan `ca`, Basque `eu`)
- **Phase 7:** URL-based locale routing (if SEO requires it)
- **Phase 8:** Community-contributed translations via translation platform

---

## Appendix: Key Spanish Terminology

| English | Spanish (es-ES) | Notes |
|---------|-----------------|-------|
| Adopt | Adoptar | |
| Adopter | Adoptante | |
| Shelter | Protectora | Not "refugio" (which implies wild animals) |
| Foster | Acogida | Temporary care before adoption |
| Volunteer | Voluntario/a | |
| Match | Compatibilidad | "Match" is understood but "compatibilidad" is clearer |
| Quiz | Cuestionario | Not "quiz" (anglicism) |
| Dog post | Anuncio de perro | |
| Favorites | Favoritos | |
| Magic link | Enlace de acceso | "Magic link" doesn't translate well |
| Sign in | Iniciar sesion | |
| Dashboard | Panel | Not "dashboard" (anglicism, though common) |
| Temperament | Temperamento | |
| Special needs | Necesidades especiales | |
| Available | Disponible | |
| On hold | En espera | |
| Adopted | Adoptado/a | Gender-variable |
