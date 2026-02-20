# Temporal Consistency Audit Report
Date: 2026-02-19T06:29:41.985Z

## Scenario 1: Causality Check (Revision before Learning)
- Topic: "topic_never_seen"
- Attempts: 0
- Decision: URGENT_REVISION
- **VIOLATION DETECTED**: Cannot recommend revision for unlearned topic.

## Scenario 2: Time Travel Resilience
- Added Quiz at T1 (Day 2)
- Added Quiz at T_past (Day 1) - Out of order insertion
- Attempts Count: 2 (Expected: 2)
- Days Since Last Revision: 0 (Expected: 0)
- Status: PASSED

## Scenario 3: Forgetting Curve Validation
- Initial Mastery (Day 0): 0.760
- Future Mastery (Day 30): 0.170
- Decay Observed: 0.590
- Status: PASSED (Mastery decayed as expected)

## Scenario 4: State Stability (Teleportation Check)
- Mastery at T: 0.6000
- Mastery at T+1min: 0.6000
- Difference: 0.000000
- Status: PASSED

## Summary of Violations
- **Causality Violation**: System recommended revision for a topic never attempted.
  - Details: {"decision":"URGENT_REVISION","topic":"topic_never_seen","attempts":0}