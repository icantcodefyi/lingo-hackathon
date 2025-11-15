### 🔥 **Ad Copy Multiplier**

### 🛡️ **Ad Compliance Checker**

into **one single app** that looks _highly polished, original, and impactful_.

This reads like a real startup README — perfect for judging.

---

# 🌍 **Rizz Ads — Global Ad Generation + Compliance Engine**

### Create, Localize, and Legally Validate Ads for Any Market in Minutes

**Powered by Lingo.dev + Cultural AI + Compliance Intelligence**

---

## 🚀 Overview

**Rizz Ads** is a unified AI platform that turns a single English ad into a **culturally adapted, locally compliant, platform-ready advertising bundle** for every global market.

It combines two powerful modules:

---

### 🔥 **1. Ad Copy Multiplier**

Generate culturally optimized ad copies for 20+ regions using:

- Lingo.dev CLI for base translations
- Cultural Tone Engine for rewriting
- Platform Formatting Engine for:
  - Google Ads
  - Meta Ads
  - LinkedIn
  - TikTok

- Region rules: tone, emojis, CTA style, length constraints

---

### 🛡️ **2. Ad Compliance Checker**

Automatically validate each localized ad against:

- Country-specific advertising laws
- Platform guidelines
- Industry restrictions
- Required disclaimers
- Banned claim patterns

Produces:

- ⚠️ flagged issues
- Auto-fixed compliant rewrites
- A final corrected ad bundle per market

---

# 🎯 Core Value Proposition

With **one upload**, companies get:

✔️ Localized ad variations
✔️ Cultural tone matching (US, Japan, LatAm, Germany, UAE, etc.)
✔️ Platform-specific ad formats
✔️ Legal + ethical compliance validation
✔️ Auto-corrected ads that are ready for deployment
✔️ A fully exportable multi-language ad package

This is a **marketing, growth, and ad-ops supertool**.

---

# 🧱 System Architecture

```
┌────────────────────────────────────────────────────────┐
│                        FRONTEND                        │
│          Next.js App (Dashboard + Preview)             │
│ - Upload Ad Copy + Product JSON                        │
│ - Select Countries & Platforms                          │
│ - Display Generated Ads (Table + Editor)               │
│ - Compliance Report UI                                  │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│                         BACKEND                        │
│                     Bun/Node Server                    │
│                                                        │
│ 1. Lingo.dev Module                                     │
│    - Extract strings                                    │
│    - Translate to multiple languages                    │
│    - Cache translations                                 │
│                                                        │
│ 2. Cultural Tone Engine                                 │
│    - Adjust tone per region                             │
│    - Rewrite CTAs, emojis, length                       │
│    - Maintain persuasion principles                     │
│                                                        │
│ 3. Platform Formatter                                   │
│    - Google Ads (30-char, 90-char)                     │
│    - Facebook/Instagram                                │
│    - LinkedIn (long-form)                              │
│    - TikTok hooks                                      │
│                                                        │
│ 4. Compliance Checker                                   │
│    - Platform rules (Google, Meta, TikTok, LinkedIn)    │
│    - Country rule packs                                 │
│    - Industry rule packs                                │
│    - AI risk scoring                                    │
│                                                        │
│ 5. Auto-Fix Engine                                      │
│    - Suggest compliant alternatives                     │
│    - Preserve tone + persuasion                         │
│                                                        │
│ 6. Export Generator                                     │
│    - /ads/xx-YY.json                                   │
│    - /compliance/xx-YY.report.json                     │
└────────────────────────────────────────────────────────┘
```

---

# 🧩 Features

---

## 🔥 1. Ad Localization Engine

### ✔️ Base Translation (Lingo.dev)

- Run `lingo extract` on input JSON
- Run `lingo translate` to produce locale bundles
- Zero duplication / incremental updates

### ✔️ Cultural Tone Transformer

Each region receives a custom transformation:

| Region  | Tone Adjustments                   |
| ------- | ---------------------------------- |
| US      | Direct, bold, urgency, CTA-forward |
| Japan   | Polite, formal, honorific          |
| LatAm   | Emotional, emoji-heavy, energetic  |
| Germany | Factual, detailed, low-emoji       |
| France  | Elegant, aesthetic                 |
| UAE/KSA | Respectful, conservative wording   |
| India   | Conversational + clarity           |

### ✔️ Emoji Sensitivity Rules

- No emojis for Japan in professional ads
- Limited emojis for Germany
- High emoji tolerance for LatAm
- Avoid certain emojis in Middle East

### ✔️ CTA Generator

Example:

| Region  | CTA                        |
| ------- | -------------------------- |
| US      | "Get Started Today"        |
| UK      | "Discover More"            |
| Mexico  | "¡Empieza Ahora!"          |
| Japan   | "詳細を見る" (See Details) |
| Germany | "Mehr Erfahren"            |

### ✔️ Platform Format Adaptation

Each ad is generated in formats for:

- Google Ads (H1, H2, Desc)
- Facebook Ads (Primary text, caption)
- LinkedIn Ads (Professional tone)
- TikTok Ads (short hook lines)

---

## 🛡️ 2. Ad Compliance Validation

### ✔️ Platform Rule Packs

Checks for:

- "Click here" (banned on Google)
- Excessive capitalization
- Sensational claims (Meta)
- Restricted words (LinkedIn)

### ✔️ Country Legislation Packs

Examples:

**EU (GDPR):**

- No misleading data usage claims
- “We store your data safely” → flagged

**USA (FTC):**

- "Guaranteed results" → banned
- "Earn ₹10,000 easily" → flagged

**India (ASCI):**

- No miracle diet claims
- Religious-sensitive language

**Japan Consumer Law:**

- Avoid exaggeration
- Formal tone required

### ✔️ Industry Packs

- Finance → no guaranteed returns
- Crypto → no “risk-free” wording
- Health/Fitness → no unverified claims
- Kids advertising → strict wording

### ✔️ Auto-Fixer

Example:

❌ Original (Germany):
“Lose weight fast — guaranteed results!”

⚠️ Flagged → illegal medical claim

✅ Auto-fixed:
“Supports your weight management goals. Results may vary.”

---

# 📦 Output Structure

```
/output
  /ads
    en-US.json
    es-MX.json
    fr-FR.json
    ar-SA.json
    jp-JP.json

  /compliance
    en-US.report.json
    es-MX.report.json
    fr-FR.report.json
```

---

# 🖥️ UI Flow (Next.js)

1. **Upload Base Ad Copy**
2. **Upload Product Details JSON**
3. **Select Countries + Platforms + Industry**
4. **Run Lingo Translation**
5. **Show Culturally Localized Ads**
6. **Run Compliance Scan**
7. **Display flags + fixes**
8. **Download Global Ad Package**

---

# 🧪 Example Flow

User submits:

```
"Boost your productivity with our AI-powered writing assistant. Try it free today!"
```

Rizz Ads generates:

- 🇯🇵 JP version → formal, no emojis
- 🇲🇽 MX version → energetic, emotional
- 🇩🇪 DE version → factual tone
- 🇸🇦 Arabic → culturally sensitive, formal
- 🇺🇸 US → bold CTA

Then compliance flags:

- DE: “free” needs disclaimer
- US: okay
- MX: uses emoji → allowed
- JP: too casual → auto-fixed

---

# 🏆 Why This Combined Project Will Win

- Extremely creative + deeply practical
- Lingo CLI is used _exactly_ as intended (translation backbone)
- Cultural engine + compliance engine show **real engineering depth**
- Visual output is impressive
- Solves a real-world problem for global companies
- Demonstrates mastery of:
  - AI rewriting
  - globalization
  - legal rules
  - product design
  - technical complexity

This is **a full startup**, built in a hackathon.
