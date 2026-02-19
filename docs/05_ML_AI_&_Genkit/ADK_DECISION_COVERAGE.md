# ADK Decision Logic Validation Report

**Total Scenarios Tested:** 14700

## Revision Decision Logic

✅ **Model matches Implementation perfectly.**

| Rule ID | Description | Triggered Count | Coverage % |
|---|---|---|---|
| R0_EXAM_CRAMMING | Exam imminent (<3 days) & low mastery (<0.6) | 3600 | 24.49% |
| R1_FORGETTING_RISK | Low mastery (<0.4) & imminent forgetting (<3 days) | 480 | 3.27% |
| R2_ATTENTION_RISK | Low mastery (<0.4) & high attention risk | 960 | 6.53% |
| R3_SPACED_REPETITION | Moderate mastery (0.4-0.6) & stale (>7 days) | 1920 | 13.06% |
| R4_MASTERY_PROGRESS | High mastery (>=0.7) & recent (<14 days) | 2520 | 17.14% |
| DEFAULT | Routine Revision | 5220 | 35.51% |

### Overlap Analysis (Potential Contradictions)
These pairs of rules are satisfied simultaneously. The higher priority (earlier) rule wins.
| Winner Rule | Shadowed Rule | Count |
|---|---|---|
| R0_EXAM_CRAMMING | R1_FORGETTING_RISK | 360 |
| R0_EXAM_CRAMMING | R2_ATTENTION_RISK | 900 |
| R1_FORGETTING_RISK | R2_ATTENTION_RISK | 240 |
| R0_EXAM_CRAMMING | R3_SPACED_REPETITION | 1440 |

## Intervention Decision Logic

✅ **Model matches Implementation perfectly.**

| Rule ID | Description | Triggered Count | Coverage % |
|---|---|---|---|
| I1_CRITICAL_RISK | Very low mastery (<0.3) & high attention & inactive (>10 days) | 630 | 4.29% |
| I2_DROPOUT_RISK | High attention risk & high dropout (>0.6) | 2240 | 15.24% |
| I3_PERSISTENT_FAILURE | Low mastery (<0.4) & many attempts (>5) | 1540 | 10.48% |
| NO_INTERVENTION | - | 10290 | 70.00% |

### Overlap Analysis (Intervention)
| Winner Rule | Shadowed Rule | Count |
|---|---|---|
| I1_CRITICAL_RISK | I2_DROPOUT_RISK | 210 |
| I1_CRITICAL_RISK | I3_PERSISTENT_FAILURE | 315 |
| I2_DROPOUT_RISK | I3_PERSISTENT_FAILURE | 245 |

## Unreachable/Dead Rules
- None (All rules are reachable)
