# Deck Files

This directory contains deck files in JSON or YAML format that can be automatically seeded into Skola.

## File Format

Deck files should follow this structure:

```yaml
meta:
  id: "unique-identifier"  # Used to track if file has been seeded
  title: "Deck Title"
  version: 1
  description: "Description"
  license: "CC-BY-4.0"
  created_at: "2026-01-08"
  tags: ["tag1", "tag2"]

decks:
  - deck_id: "unique_deck_id"
    name: "Deck Name"
    description: "Deck description"
    tags: ["tag1"]
    cards:
      - id: "card-001"
        type: "basic" | "cloze" | "list"
        # ... card-specific fields
```

## Manifest System

The `manifest.json` file lists all deck files that should be processed. 

### Generating the Manifest

When you add new deck files, run:

```bash
pnpm run generate-manifest
```

This will automatically scan the `public/decks/` directory and update `manifest.json` with all `.json`, `.yaml`, and `.yml` files.

### Manual Editing

You can also manually edit `manifest.json`:

```json
{
  "files": [
    "system-design.v1.json",
    "system-design.v2.yaml",
    "my-custom-deck.yaml"
  ]
}
```

## Adding New Deck Files

1. Add your deck file (`.json` or `.yaml`) to this directory
2. Run `pnpm run generate-manifest` to update the manifest
3. The file will be automatically seeded on next app load

## Notes

- The `meta.id` field is used to track if a file has been seeded (idempotent)
- Each file is processed independently
- Files are only seeded if they haven't been seeded before (based on `meta.id`)
- If you clear all decks, you can re-seed by clearing the database or changing the `meta.id`
