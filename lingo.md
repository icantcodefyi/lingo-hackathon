---
title: "Lingo.dev CLI"
subtitle: "AI translations for apps and content"
---

## Introduction

**Lingo.dev CLI** is a free, open-source CLI for translating apps and content with AI. It’s designed to replace traditional translation management software while integrating with existing pipelines.

To get up and running, read the [Quickstart](/cli/quick-start) guide.

## Why Lingo.dev CLI?

- Supports all major LLM providers, such as OpenAI and Anthropic.
- Supports all industry-standard formats, such as [CSV](/cli/formats/csv), [JSON](/cli/formats/json), and [PO](/cli/formats/po) files.
- Integrates with [CI/CD](/ci) pipelines for continuous translation.

## How it works

At a high-level, **Lingo.dev CLI**:

1. Extracts translatable content from a variety of file formats.
2. Sends the extracted content to an LLM provider for translation.
3. Writes the changes back to the file system.
4. Keeps track of what's been translated to prevent unnecessary retranslation.

For a deeper dive into each of these steps, see [How it works](/cli/how-it-works).

## Looking for help?

If you’re not sure if **Lingo.dev CLI** is the right fit for you, or if you need any other kind of help, ask a question in [our Discord community](https://discord.com/channels/1193198600298172486/1197646830138306720).