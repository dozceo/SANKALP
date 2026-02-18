
import { z } from "zod";
import fs from "fs";
import path from "path";
import { signUpSchema, loginSchema, joinClassSchema } from "../src/lib/validations/auth";

interface TestCase {
  name: string;
  schema: z.ZodSchema<any>;
  inputs: Record<string, any>[];
}

const testCases: TestCase[] = [
  {
    name: "Sign Up Schema",
    schema: signUpSchema,
    inputs: [
      { name: "", email: "", password: "", role: "" }, // All empty
      { name: "A", email: "invalid-email", password: "123", role: "invalid" }, // Too short, invalid format
      { name: "Valid Name", email: "test@example.com", password: "password123", role: "" }, // Missing role
    ],
  },
  {
    name: "Login Schema",
    schema: loginSchema,
    inputs: [
      { email: "", password: "" },
      { email: "bad-email", password: "short" },
    ],
  },
  {
    name: "Join Class Schema",
    schema: joinClassSchema,
    inputs: [
      { classCode: "" },
      { classCode: "abc" }, // Too short
      { classCode: "abcdefg" }, // Too long
      { classCode: "ABC@#$" }, // Invalid chars
    ],
  },
];

async function runAudit() {
  let report = "# Form Validation Error Message Clarity Audit\n\n";
  report += "| Schema | Field | Input | Error Message | Clarity Score (1-5) | Recommendation |\n";
  report += "|---|---|---|---|---|---|\n";

  for (const testCase of testCases) {
    for (const input of testCase.inputs) {
      const result = testCase.schema.safeParse(input);
      if (!result.success) {
        for (const issue of result.error.issues) {
          const field = issue.path.join(".");
          const message = issue.message;
          const inputValue = JSON.stringify(input[field as keyof typeof input]);

          // Simple heuristic for clarity score
          let score = 5;
          let recommendation = "Good";

          if (message.includes("String must contain")) {
             score = 2;
             recommendation = "Use plain language (e.g., 'Must be X characters').";
          } else if (message.includes("Required")) {
             score = 3;
             recommendation = "Be more specific (e.g., 'Please enter your email').";
          } else if (message.toLowerCase().includes("regex")) {
             score = 1;
             recommendation = "Avoid technical terms like regex.";
          }

          report += `| ${testCase.name} | ${field} | \`${inputValue}\` | "${message}" | ${score} | ${recommendation} |\n`;
        }
      }
    }
  }

  const outputPath = path.join(process.cwd(), "FORM_VALIDATION_AUDIT.md");
  fs.writeFileSync(outputPath, report);
  console.log(`Audit report generated at: ${outputPath}`);
}

runAudit().catch(console.error);
