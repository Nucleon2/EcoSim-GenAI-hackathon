# Claude API Skill Documentation

This documentation provides guidance for building LLM-powered applications with Claude across multiple programming languages.

## Key Defaults

When working with Claude unless specified otherwise:
- **Model:** Use `claude-opus-4-6` (do not downgrade for cost)
- **Thinking:** Apply `thinking: {type: "adaptive"}` for complex tasks
- **Streaming:** Default to streaming for long inputs/outputs to avoid timeouts

## Language Detection

The guide provides language-specific examples for: Python, TypeScript/JavaScript, Java, Kotlin, Scala, Go, Ruby, C#, PHP, and cURL.

First identify the project language by examining file extensions and configuration files, then read from the corresponding language folder.

## Choosing the Right Surface

**Single API calls:** Best for classification, summarization, extraction, and Q&A tasks.

**Workflows with tool use:** Employ Claude API with function calling for multi-step pipelines you orchestrate.

**Agent SDK:** Select for applications requiring built-in file/web/terminal access, permissions, and MCP support (Python and TypeScript only).

**Custom agents:** Build with Claude API tool use when you need maximum flexibility with your own tools.

## Critical Implementation Notes

- Always use exact model IDs from the current table; don't append date suffixes
- For Opus 4.6/Sonnet 4.6, use adaptive thinking—`budget_tokens` is deprecated
- Use `output_config: {format: {...}}` instead of deprecated `output_format`
- Preserve `response.content` blocks when enabling server-side compaction
- Parse tool inputs with JSON methods, not raw string matching

## Documentation Structure

Begin with language-specific README files, then consult specialized guides for streaming, batches, files, or tool use as needed. Access live documentation through WebFetch for the latest information.
