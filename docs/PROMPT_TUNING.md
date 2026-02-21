# Prompt Tuning Guide

How to iterate and improve prompts using the harness.

---

## Quick Start

```bash
# Test with 10 topics (dry run - no AI)
pnpm prompt:harness --dry-run

# Test with 5 topics (live - with AI)
pnpm prompt:harness --count 5

# Test specific topics
pnpm prompt:harness --topics=lion,cat,dog
```

---

## Understanding Reports

Reports are saved in `reports/` directory:

```
reports/
├── harness-2026-02-21T12-00-00.000Z.json
└── harness-2026-02-21T12-00-00.000Z.md
```

### JSON Report
- Machine-readable
- Contains detailed metrics
- No secrets

### Markdown Report
- Human-readable summary
- Good for sharing

---

## Metrics to Watch

| Metric | Good | Bad |
|--------|------|-----|
| Success Rate | >90% | <70% |
| Cost/Topic | <$0.03 | >$0.05 |
| Time/Topic | <2s | >5s |

---

## Iteration Workflow

1. **Run baseline**
   ```bash
   pnpm prompt:harness --count 10 --dry-run
   ```

2. **Review report**
   - Check for failures
   - Note high-cost items

3. **Adjust prompt**
   - Edit `prompts/templates/`
   - Or use `--prompt` flag

4. **Re-run**
   ```bash
   pnpm prompt:harness --count 10
   ```

5. **Compare**
   - Check if metrics improved
   - Look for patterns in failures

---

## Common Issues

### Images too complex
- Add "simple outlines" to prompt
- Add "child-friendly"

### Text too short
- Increase min length in quality validation
- Adjust prompt to ask for more detail

### Duplicates detected
- Add variation keywords
- Randomize prompt slightly

---

## Cost Optimization

| Operation | Cost |
|-----------|------|
| Image (1024x1024) | $0.02 |
| Text PL | $0.0001 |
| Text EN | $0.0001 |
| **Total** | **$0.02-0.03** |

To reduce cost:
- Use `--dry-run` for testing
- Start with 5 topics

---

## Best Practices

1. **Always start dry-run** - saves money
2. **Test edge cases** - add unusual topics
3. **Track over time** - save reports
4. **Version prompts** - use git tags

---

## Related

- `scripts/prompt-harness.ts` - Main script
- `prompts/templates/` - Prompt templates
- `docs/COPY_STYLE_GUIDE.md` - Content style
