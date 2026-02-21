# Copy Style Guide

Guidelines for SEO content generation on colouring-pages.com

---

## Language

### Polish (PL)
- **Tone**: Naturalny, rodzinny, ciepły, zachęcający
- **Style**: Prosty, zrozumiały dla rodziców
- **Avoid**: Sztucznych frazesów, nadmiernego marketingu

### English (EN)
- **Tone**: Simple, engaging, family-friendly
- **Style**: Clear, accessible for parents
- **Avoid**: Overly promotional language

---

## Content Requirements

### Title
- **Length**: 50-255 characters
- **Format**: Descriptive, engaging
- **Examples**:
  - PL: "Kolorowanka Lew dla Dzieci - Do Druku"
  - EN: "Lion Coloring Page for Kids - Free Printable"

### Description
- **Length**: 150-300 characters
- **Purpose**: Describe the coloring page, encourage engagement
- **Examples**:
  - PL: "Pobierz darmową kolorowankę lwa dla dzieci. Idealna dla przedszkolaków i uczniów. Rozwijaj kreatywność swojego dziecka!"
  - EN: "Download a free lion coloring page for kids. Perfect for preschoolers and elementary students. Help your child develop creativity!"

### Meta Title (SEO)
- **Length**: Max 70 characters
- **Format**: Primary keyword + value proposition

### Meta Description (SEO)
- **Length**: Max 160 characters
- **Format**: Call-to-action + keywords

### Keywords
- **Count**: 5-10 keywords
- **Types**: Primary, secondary, long-tail
- **Examples**:
  - PL: kolorowanka, lew, dzieci, do druku, darmowa, zwierzęta
  - EN: coloring page, lion, kids, printable, free, animals

---

## Structure

### Introduction (1-2 sentences)
- Hook the reader
- Mention the subject

### Benefits (3-4 bullet points)
- Educational value
- Developmental benefits
- Fun factor

### Tips (2-3 suggestions)
- Coloring tips
- Age-appropriate guidance

### Call-to-Action
- Encourage downloading/printing
- Example: "Pobierz i pokoloruj już dziś!"

---

## Quality Rules

1. **No duplicates**: Each page must have unique content
2. **Minimum length**: Description ≥100 chars (PL), ≥80 chars (EN)
3. **Keyword density**: Natural, not forced
4. **No prohibited content**: Follow CONTENT_POLICY.md
5. **Age-appropriate**: Focus on child-friendly themes

---

## Prohibited

- Violent or scary themes
- Sexual content
- Political content
- Religious content (unless educational)
- Protected characters/copyright
- Harmful activities

---

## Moderation

All content must pass AI moderation before publishing.
See: `apps/worker/src/steps/moderate.ts`

---

## See Also

- `prompts/schemas/pageText.schema.json` - JSON schema
- `prompts/templates/pageText.prompt.md` - AI prompt template
- `docs/CONTENT_POLICY.md` - Prohibited content
