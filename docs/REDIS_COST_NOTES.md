# Redis/BullMQ Cost Optimization Notes

## How BullMQ Generates Redis Operations

BullMQ performs several types of Redis operations even when there are no jobs in the queue:

### 1. Polling (Queue Inspection)
- **What**: Worker periodically checks the queue for new jobs
- **Default**: Every 500ms per worker
- **Impact**: ~17,280 requests/day per worker at 500ms interval
- **Optimization**: Increase `wait` interval in worker settings

### 2. Heartbeat
- **What**: Active jobs send heartbeat signals to prevent being marked as stalled
- **Default**: Every 30 seconds
- **Impact**: ~2,880 requests/day per active job
- **Optimization**: Use `lockDuration` matching job processing time

### 3. Job Completion
- **What**: Notifications when jobs complete or fail
- **Impact**: Depends on job throughput
- **Optimization**: Use `removeOnComplete` and `removeOnFail` options

### 4. Retry Checks
- **What**: Checking if failed jobs should be retried
- **Impact**: Minimal
- **Optimization**: Set appropriate retry limits

---

## Upstash Pricing Models

### Fixed Plan ($10/month)
- **Pros**: Unlimited operations, predictable cost
- **Best for**: High-volume workloads, continuous processing

### PAYG Plan ($0.50/10k operations)
- **Pros**: Low starting cost
- **Cons**: Costs can spike with misconfigured workers
- **Best for**: Low-volume, development, testing

---

## Cost Optimization Strategies

### 1. Increase Polling Interval
```typescript
// Default: 500ms
// Optimized: 5000ms for low-volume
const worker = new Worker('queue', processor, {
  connection: { /* ... */ },
  wait: 5000, // Check every 5 seconds
});
```

### 2. Set Appropriate Lock Duration
```typescript
// Match to expected job processing time
const worker = new Worker('queue', processor, {
  lockDuration: 30000, // 30 seconds
});
```

### 3. Configure Stalled Job Handling
```typescript
const worker = new Worker('queue', processor, {
  // Max times a job can be stalled before marked as failed
  maxStalledCount: 2,
  // Skip stalled checks between workers
  skipStalledCheck: true,
});
```

### 4. Auto-cleanup Completed Jobs
```typescript
const queue = new Queue('queue', {
  defaultJobOptions: {
    removeOnComplete: { age: 86400 }, // Remove after 24h
    removeOnFail: { age: 604800 },   // Remove after 7 days
  },
});
```

---

## Environment Variables

| Variable | Description | Recommended Value |
|----------|-------------|------------------|
| `REDIS_URL` | Redis connection | From Upstash |
| `MAX_CONCURRENT_WORKERS` | Parallel jobs | 5 |
| `MAX_JOB_RETRIES` | Retry attempts | 3 |
| `JOB_TIMEOUT_SECONDS` | Job timeout | 30 |

---

## Monitoring

Watch for these cost warning signs:
1. High request counts with low job throughput
2. Many stalled job checks
3. Rapid polling without jobs to process

---

## References
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Upstash Pricing](https://upstash.com/pricing)
