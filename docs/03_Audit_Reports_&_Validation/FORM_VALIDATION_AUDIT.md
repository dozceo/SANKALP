# Form Validation Error Message Clarity Audit

| Schema | Field | Input | Error Message | Clarity Score (1-5) | Recommendation |
|---|---|---|---|---|---|
| Sign Up Schema | name | `""` | "Name must be at least 2 characters" | 5 | Good |
| Sign Up Schema | email | `""` | "Please enter a valid email address" | 5 | Good |
| Sign Up Schema | password | `""` | "Password must be at least 6 characters" | 5 | Good |
| Sign Up Schema | role | `""` | "Invalid enum value. Expected 'student' | 'teacher', received ''" | 5 | Good |
| Sign Up Schema | name | `"A"` | "Name must be at least 2 characters" | 5 | Good |
| Sign Up Schema | email | `"invalid-email"` | "Please enter a valid email address" | 5 | Good |
| Sign Up Schema | password | `"123"` | "Password must be at least 6 characters" | 5 | Good |
| Sign Up Schema | role | `"invalid"` | "Invalid enum value. Expected 'student' | 'teacher', received 'invalid'" | 5 | Good |
| Sign Up Schema | role | `""` | "Invalid enum value. Expected 'student' | 'teacher', received ''" | 5 | Good |
| Login Schema | email | `""` | "Please enter a valid email address" | 5 | Good |
| Login Schema | password | `""` | "Password must be at least 6 characters" | 5 | Good |
| Login Schema | email | `"bad-email"` | "Please enter a valid email address" | 5 | Good |
| Login Schema | password | `"short"` | "Password must be at least 6 characters" | 5 | Good |
| Join Class Schema | classCode | `""` | "Class code must be exactly 6 characters" | 5 | Good |
| Join Class Schema | classCode | `""` | "Class code must contain only uppercase letters and numbers" | 5 | Good |
| Join Class Schema | classCode | `"abc"` | "Class code must be exactly 6 characters" | 5 | Good |
| Join Class Schema | classCode | `"abc"` | "Class code must contain only uppercase letters and numbers" | 5 | Good |
| Join Class Schema | classCode | `"abcdefg"` | "Class code must be exactly 6 characters" | 5 | Good |
| Join Class Schema | classCode | `"abcdefg"` | "Class code must contain only uppercase letters and numbers" | 5 | Good |
| Join Class Schema | classCode | `"ABC@#$"` | "Class code must contain only uppercase letters and numbers" | 5 | Good |
