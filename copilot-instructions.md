# Project Language — Project Instructions

## 1. Project Overview

Project Language is an ambitious language-learning platform focused on independent, flexible and effective learning.

The long-term goal is to build an international EdTech product supporting multiple languages, learning levels and educational goals.

The initial development is driven by the founder's personal experience learning Japanese and dissatisfaction with existing language-learning tools.

## 2. Product Philosophy

The central philosophy:

"The application does not decide what the user should learn. It provides everything necessary for the user to learn independently and effectively."

The user controls:
- What they learn.
- At what pace they learn.
- Which vocabulary and materials they use.
- How they test their knowledge.
- Which learning methods work best for them.

The platform organizes, enriches, stores, reviews and analyzes learning materials.

## 3. Product Principles

### Flexibility
Users should be able to create their own learning materials, import large vocabulary lists and customize their learning process.

### Simplicity
The interface must remain intuitive and visually appealing. Advanced functionality should not overwhelm beginners.

### Learning effectiveness
The product must prioritize actual knowledge retention rather than streaks, superficial activity or arbitrary daily limits.

### User control
Do not force users into a single learning methodology. Offer different testing and practice modes.

### Scalability
The architecture must support multiple languages and their specific linguistic structures without requiring a complete redesign.

## 4. Target Audience

- Beginners learning their first foreign language.
- Intermediate learners expanding their vocabulary.
- Advanced learners studying specialized or literary vocabulary.
- Students preparing for language examinations.
- Professionals learning industry-specific terminology.

## 5. Core Product Features

- Personal vocabulary library.
- Single-word and bulk vocabulary import.
- Automatic vocabulary enrichment.
- Language-specific information such as kanji, kana, romaji, pinyin, pronunciation and examples.
- Custom vocabulary collections.
- Multiple testing modes: recognition, recall, reading, listening and writing.
- Spaced repetition.
- Learning analytics and progress tracking.
- Ready-made learning packs.
- Future community and user-generated content features.

## 6. Language Architecture

The platform must not assume that every language has the same linguistic structure.

For example:
- Japanese requires kanji, kana, readings and potentially multiple pronunciations.
- Chinese requires hanzi, pinyin, tones and simplified/traditional variants.
- Korean requires hangul, pronunciation and grammatical information.

Use an extensible data model that supports language-specific properties without breaking the shared application logic.

Japanese is the initial development and testing language.

## 7. UX/UI Direction

The desired interface combines:
- The functional depth and flexibility of Renshuu and Anki.
- The visual appeal and accessibility of modern consumer applications such as Duolingo.

Design requirements:
- Minimalist and modern.
- Clear visual hierarchy.
- Intuitive navigation.
- Consistent spacing and typography.
- Responsive design for desktop and mobile.
- Progressive disclosure of advanced functionality.
- Avoid unnecessary interface elements and excessive configuration.

Do not copy competitor interfaces. Develop an independent visual identity.

## 8. Development Principles

- Build incrementally, one functional feature at a time.
- Prioritize working functionality over unnecessary complexity.
- Keep components modular and reusable.
- Separate UI, business logic and data management.
- Use TypeScript properly; avoid unnecessary `any`.
- Write readable, maintainable code.
- Do not introduce dependencies without a clear reason.
- Do not rewrite working code unnecessarily.
- Preserve existing functionality when implementing new features.
- Explain important architectural decisions.
- Ask for clarification when requirements are ambiguous rather than inventing major product decisions.

## 9. Current Technical Stack

Frontend:
- React
- TypeScript
- Vite

Development:
- VS Code
- GitHub Copilot

Planned backend:
- Python
- FastAPI

Planned database:
- PostgreSQL

The initial MVP can use local storage or another lightweight persistence solution where appropriate. Avoid introducing a full backend before it is needed.

## 10. Current Development Goal

Build the first usable version of Project Language for personal Japanese learning.

Initial priorities:
1. Dashboard.
2. Personal vocabulary library.
3. Adding individual words.
4. Bulk vocabulary import.
5. Automatic vocabulary enrichment.
6. Vocabulary study and testing.
7. Basic spaced repetition.

The first version should already be useful to the founder as a real learning tool.

## 11. Important Product Constraint

Do not sacrifice the long-term product vision for short-term implementation convenience.

At the same time, do not build future functionality prematurely.

Make architectural decisions that preserve scalability while keeping the MVP small, understandable and functional.