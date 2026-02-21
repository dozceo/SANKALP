# ADK Decision Engine Logic Validation
Running exhaustive validation on decision rules...

## Revision Decision Coverage
| Rule ID | Triggers | % Coverage | Shadowed (Preempted) |
|---|---|---|---|
| RULE_0_CRAMMING | 107520 | 33.33% | 0 |
| RULE_1_CRITICAL_FORGETTING | 18432 | 5.71% | 18432 |
| RULE_2_ATTENTION_RISK | 6912 | 2.14% | 17664 |
| RULE_3_STALE_KNOWLEDGE | 21600 | 6.70% | 21600 |
| RULE_4_MASTERY | 60480 | 18.75% | 0 |
| DEFAULT | 107616 | 33.36% | 203712 |

## Intervention Decision Coverage
| Rule ID | Triggers | % Coverage | Shadowed (Preempted) |
|---|---|---|---|
| INTERVENTION_1_CRITICAL | 5040 | 1.56% | 0 |
| INTERVENTION_2_HIGH_RISK | 25200 | 7.81% | 1680 |
| INTERVENTION_3_PERSISTENT_LOW | 47600 | 14.76% | 6160 |
| NO_INTERVENTION | 244720 | 75.87% | 77840 |

## Edge Case Analysis
- **daysUntilExam: 0 Bug**: Failed to trigger CRAMMING_MODE in 0 cases where it should have.
- All Revision rules are reachable.
- All Intervention rules are reachable.
