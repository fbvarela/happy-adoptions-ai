# Spec: AI Photo Matching with Groq Vision

## Goal

Allow users to upload a photo of a dog and find visually similar dogs in the system. Use Groq's vision model to describe and compare dog photos, enabling "find dogs that look like this" functionality.

## Background

- Dog photos are currently stored as base64 data URLs in the `photos` JSONB column of `dog_posts` and `shelter_dogs_cache` tables (up to 6 per dog).
- Current AI provider is Cohere (text-only). Groq will be added specifically for vision tasks.
- No image embeddings or visual feature extraction exists today.

## Approach

### Phase 1: Dog Photo Description (pre-compute)

When a dog is posted or updated, use Groq's vision model to generate a structured visual description of each photo. Store these descriptions alongside the photos for later comparison.

**Groq model:** `llama-4-scout-17b-16e-instruct` (vision-capable)

**Prompt strategy:**
Ask the model to describe the dog's visual traits in a structured JSON format:
```json
{
  "size_estimate": "medium",
  "coat_type": "short",
  "coat_color": ["brown", "white"],
  "coat_pattern": "spotted",
  "ear_type": "floppy",
  "face_shape": "round",
  "build": "stocky",
  "distinguishing_features": ["white patch on chest", "brown eyebrows"],
  "breed_guess": "Pit Bull mix"
}
```

**Storage:**
- Add a `photo_descriptions` JSONB column to `dog_posts` and `shelter_dogs_cache`.
- Structure: array of description objects, one per photo, indexed by position.
- Backfill existing dogs via a one-time migration script.

### Phase 2: Photo Search

When a user uploads a search photo:

1. **Describe the search photo** — Send to Groq vision with the same prompt to get a structured description.
2. **Text-based matching** — Compare the search description against stored `photo_descriptions` using the Cohere text model (already in use). Prompt it to score each dog's visual similarity 0-100.
3. **Return ranked results** — Sorted by visual similarity score.

### Why not image embeddings?

- Groq doesn't offer an embedding endpoint for images.
- Adding a separate embedding service (CLIP, etc.) adds infrastructure complexity.
- The description-then-compare approach works within the existing stack and is good enough for approximate matching (breed, color, size, coat type).
- Can upgrade to embeddings later if needed.

## API Design

### `POST /api/photo-search`

**Request:**
```json
{
  "photo": "<base64 data URL>",
  "limit": 10
}
```

**Response:**
```json
{
  "matches": [
    {
      "dogId": "uuid",
      "name": "Luna",
      "similarity": 87,
      "matchedTraits": ["brown coat", "medium size", "floppy ears"],
      "photo": "<base64 data URL of best matching photo>",
      "breed": "Labrador Retriever"
    }
  ]
}
```

**Auth:** Optional. Works for anonymous users too.

### `POST /api/dog-posts/[id]/describe` (internal / webhook)

Triggers photo description generation for a specific dog post. Called automatically after creation/update.

## Database Changes

```sql
ALTER TABLE dog_posts ADD COLUMN photo_descriptions JSONB DEFAULT '[]';
ALTER TABLE shelter_dogs_cache ADD COLUMN photo_descriptions JSONB DEFAULT '[]';
```

## New Dependencies

```
groq-sdk
```

**Environment variable:** `GROQ_API_KEY`

## File Structure

```
src/lib/ai/
  match.js          — existing (Cohere, text matching)
  vision.js         — new (Groq, photo description + comparison)
src/app/api/
  photo-search/
    route.js        — new endpoint
```

### `src/lib/ai/vision.js` responsibilities

- `describePhoto(base64DataUrl)` — Send photo to Groq vision, return structured description.
- `describeDogPhotos(photos[])` — Describe all photos for a dog post, return array of descriptions.
- `findSimilarDogs(searchDescription, dogDescriptions[])` — Use Cohere to score visual similarity between search photo description and stored descriptions.

## Flow

```
User uploads photo
  → POST /api/photo-search
    → describePhoto(photo) via Groq vision
    → Fetch all dog_posts with photo_descriptions
    → findSimilarDogs(searchDesc, allDescs) via Cohere
    → Return top N ranked matches
```

## UI

- Add a "Search by photo" button on the main page and dog listings page.
- Opens a modal/drawer with photo upload (camera or file).
- Shows results as a grid of matching dog cards with similarity percentage.
- Each card links to the dog's detail page.

## Considerations

- **Rate limits:** Groq free tier has low RPM. Batch description generation should be throttled.
- **Photo size:** Base64 data URLs can be large. May need to resize/compress before sending to Groq to stay within token limits.
- **Cost:** Description is a one-time cost per photo. Search costs one Groq call + one Cohere call per search.
- **Accuracy:** Text-description matching is approximate. Dogs with similar coloring but different breeds may rank high. This is acceptable for a discovery tool.
- **Caching:** Search descriptions could be cached in sessionStorage to avoid re-describing the same photo.
- **Backfill:** Existing dogs without descriptions need a migration script that processes them in batches.

## Out of Scope

- Real-time video/camera matching
- Image embedding storage (CLIP, etc.)
- External image storage migration (photos remain as base64 in DB)
- Lost dog matching / alert system (future feature)
