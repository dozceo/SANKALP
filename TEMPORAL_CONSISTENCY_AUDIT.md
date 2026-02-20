# Temporal Consistency Audit Report

Generated at: 2026-02-20T06:32:38.018Z

## Synthetic Data Stress Test

### Scenario: Valid Student
- ✅ PASSED: No violations detected.

### Scenario: Time Traveler
- ❌ FAILED: 1 violations detected.
  - **[CRITICAL] TEMPORAL_ORDER_VIOLATION**: Time Travel Detected: Event at 2023-12-31T10:00:00.000Z occurred after global last active 2024-01-02T11:00:00.000Z (Topic: Geometry)

### Scenario: Teleporter
- ❌ FAILED: 1 violations detected.
  - **[HIGH] MASTERY_TELEPORTATION**: Mastery spiked from 0.10 to 0.95 despite low quiz score 0.2 (Topic: Physics)

### Scenario: Causality Breaker
- ❌ FAILED: 1 violations detected.
  - **[MEDIUM] CAUSALITY_VIOLATION**: Revision recommended/performed for Topic 'Calculus' before any learning activity (Topic: Calculus)

## Static Student Data Audit

### File: alex-kumar.md
- ✅ PASSED: Consistent history derived from markdown.

### File: arjun-reddy.md
- ✅ PASSED: Consistent history derived from markdown.

### File: meera-patel.md
- ✅ PASSED: Consistent history derived from markdown.

### File: priya-sharma.md
- ✅ PASSED: Consistent history derived from markdown.

### File: rahul-singh.md
- ✅ PASSED: Consistent history derived from markdown.

## Violation Summary
| Severity | Count |
|---|---|
| CRITICAL | 1 |
| HIGH | 1 |
| MEDIUM | 1 |
| LOW | 0 |
