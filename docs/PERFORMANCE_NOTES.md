# Performance Notes

Notes on pipeline performance and scaling.

---

## Target

- **300 pages/day** target
- **12.5 pages/hour** average
- **~2 minutes per page** (with real AI)

---

## Current Estimates

| Operation | Time (mock) | Time (real) |
|-----------|-------------|-------------|
| Generate Text (PL) | 200ms | ~2s |
| Generate Text (EN) | 200ms | ~2s |
| Generate Image | 200ms | ~30s |
| Upload to R2 | 100ms | ~5s |
| **Total per page** | **~700ms** | **~40s** |

---

## Worker Concurrency

| Workers | 300 jobs (mock) | 300 jobs (real) |
|---------|-----------------|------------------|
| 1 | ~3.5 min | ~20 min |
| 3 | ~1.2 min | ~7 min |
| 5 | ~42 sec | ~4 min |
| 10 | ~21 sec | ~2 min |

**Recommended: 3-5 workers**

---

## Simulation

Run the simulation script:

```bash
# Mock simulation (no real AI)
pnpm simulate:batch

# Custom jobs
pnpm simulate:batch --jobs 100 --workers 5
```

---

## Metrics to Watch

- Queue depth
- Worker CPU usage
- Redis memory
- R2 upload latency

---

## Cost Estimates

| Scenario | Cost/month |
|----------|-----------|
| 100 pages/day | ~$10 |
| 300 pages/day | ~$30 |
| 1000 pages/day | ~$100 |

---

## Scaling

When hitting limits:
1. Increase worker concurrency
2. Add more workers (horizontal scaling)
3. Optimize AI prompts (faster generation)
4. Use caching for similar prompts
