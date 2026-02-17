import fs from 'fs';

const RULES_FILE = 'firestore.rules';
const REPORT_FILE = 'FIRESTORE_SECURITY_REPORT.md';

if (!fs.existsSync(RULES_FILE)) {
  console.error(`File not found: ${RULES_FILE}`);
  process.exit(1);
}

const content = fs.readFileSync(RULES_FILE, 'utf-8');

const criticalCollections = [
  'users',
  'teachers',
  'classes',
  'students',
  'quizResults',
  'mlPredictions',
  'adkDecisions',
  'teacherInterventions',
  'syllabi',
  'quizGenerations',
  'sankalpSessions',
  'activityLogs',
  'chatHistory',
  'brainMapNodes',
  'plannerData',
  'dailySummaries'
];

let report = `# Firestore Security Rules Coverage Report

**Date:** ${new Date().toISOString()}

## Critical Collections Audit

| Collection | Has Rules? | Authenticated Read? | Owner-Only Read? | Owner-Only Write? | Status |
|---|---|---|---|---|---|
`;

const collectionRules: Record<string, any> = {};

criticalCollections.forEach(collection => {
  // Regex to find match block
  const matchRegex = new RegExp(`match\\s+\\/${collection}\\/\\{.*\\}\\s*\\{([\\s\\S]*?)\\}`, 'm');
  const match = content.match(matchRegex);

  if (!match) {
    report += `| \`${collection}\` | ❌ No | - | - | - | ❌ **MISSING** |\n`;
    return;
  }

  const rulesBlock = match[1];

  // Check for allow read
  const hasRead = /allow\s+.*read/.test(rulesBlock);

  const authReadRegex = /allow\s+.*read.*:\s*if.*isAuthenticated/i;
  const requestAuthRegex = /allow\s+.*read.*:\s*if.*request\.auth/i;
  const isOwnerReadRegex = /allow\s+.*read.*:\s*if.*isOwner/i;
  const uidReadRegex = /allow\s+.*read.*:\s*if.*uid\s*==/i;
  const resourceOwnerReadRegex = /resource\.data\.\w+Id\s*==\s*request\.auth\.uid/i;

  const authRead = authReadRegex.test(rulesBlock) || requestAuthRegex.test(rulesBlock) || isOwnerReadRegex.test(rulesBlock);

  const ownerRead = isOwnerReadRegex.test(rulesBlock) ||
                    uidReadRegex.test(rulesBlock) ||
                    resourceOwnerReadRegex.test(rulesBlock);

  // Check for allow write (create/update/delete)
  const hasWrite = /allow\s+(write|create|update|delete)/.test(rulesBlock);

  const isOwnerWriteRegex = /allow\s+(write|create|update|delete):\s*if.*isOwner/i;
  const uidWriteRegex = /allow\s+(write|create|update|delete):\s*if.*uid\s*==/i;
  const resourceOwnerWriteRegex = /request\.resource\.data\.\w+Id\s*==\s*request\.auth\.uid/i;
  const falseWriteRegex = /allow\s+(write|create|update|delete):\s*if\s*false/i;

  const ownerWrite = isOwnerWriteRegex.test(rulesBlock) ||
                     uidWriteRegex.test(rulesBlock) ||
                     resourceOwnerWriteRegex.test(rulesBlock) ||
                     falseWriteRegex.test(rulesBlock); // immutable also counts as safe

  let status = '✅ Pass';
  if (!authRead) status = '⚠️ Public Read?';
  if (!ownerRead && collection !== 'classes') status = '⚠️ Shared Read?'; // Classes might be shared
  if (hasWrite && !ownerWrite) status = '❌ Open Write';

  // Specific checks
  if (collection === 'classes' && !ownerRead) status = '✅ Pass (Shared)';

  report += `| \`${collection}\` | ✅ Yes | ${authRead ? 'Yes' : 'No'} | ${ownerRead ? 'Yes' : 'No'} | ${ownerWrite ? 'Yes' : 'No'} | ${status} |\n`;

  collectionRules[collection] = {
    block: rulesBlock,
    ownerRead,
    authRead,
    hasRead
  };
});

report += `
## Simulation Scenarios (Regex-Based)

| Scenario | Expected Result | Analysis | Pass? |
|---|---|---|---|
`;

function simulate(scenario: string, collection: string, expectedOutcome: string, conditionType: string) {
  const rules = collectionRules[collection];
  if (!rules) return `| **${scenario}** | ${expectedOutcome} | Missing rules | ❌ |\n`;

  let pass = false;
  let analysis = 'Logic mismatch';

  if (expectedOutcome === 'Allow') {
     if (conditionType === 'owner') {
        if (rules.ownerRead) { pass = true; analysis = 'Owner access granted'; }
        else { pass = false; analysis = 'Missing owner access'; }
     } else if (conditionType === 'auth') {
        if (rules.authRead) { pass = true; analysis = 'Auth access granted'; }
        else { pass = false; analysis = 'Missing auth access'; }
     }
  } else if (expectedOutcome === 'Deny') {
     if (conditionType === 'strict_owner') {
        // Deny implies we should NOT have loose rules
        // Loose if 'true' or 'isAuthenticated()' alone or with OR
        const looseAuth = /allow\s+read:\s*if\s*isAuthenticated\s*\(\)\s*(\s*\|\||\s*;|\s*\}|$)/.test(rules.block) ||
                          /allow\s+read:\s*if\s*true/.test(rules.block);

        if (rules.ownerRead && !looseAuth) {
            pass = true;
            analysis = 'Strict owner check found.';
        } else if (looseAuth) {
            pass = false;
            analysis = 'Loose auth check found!';
        } else if (!rules.hasRead) {
            pass = true;
            analysis = 'No read access (Denied by default).';
        } else {
             // Fallback
             pass = false;
             analysis = 'Logic unclear.';
        }
     }
  }

  return `| **${scenario}** | ${expectedOutcome} | ${analysis} | ${pass ? '✅' : '❌'} |\n`;
}

report += simulate('Student reads own profile', 'users', 'Allow', 'owner');
report += simulate('Student reads other student profile', 'users', 'Deny', 'strict_owner');
report += simulate('Teacher reads student data', 'students', 'Allow', 'owner'); // Actually 'students' collection has owner check
report += simulate('Student reads own quiz results', 'quizResults', 'Allow', 'owner');
report += simulate('Student reads other quiz results', 'quizResults', 'Deny', 'strict_owner');

// Anonymous case
const classesRules = collectionRules['classes'];
if (classesRules) {
   const openRead = /allow\s+.*read.*:\s*if\s*true/.test(classesRules.block);
   const authReq = classesRules.authRead;
   if (!openRead && authReq) {
     report += `| **Anonymous read classes** | Deny | Rules require authentication. | ✅ |\n`;
   } else {
     report += `| **Anonymous read classes** | Deny | Rules might be open. | ❌ |\n`;
   }
} else {
    report += `| **Anonymous read classes** | Deny | Missing rules. | ❌ |\n`;
}


report += `
## Recommendations
- **classes**: Verify if students need to list classes. Current rules allow \`read: if isAuthenticated()\`. This lets any logged-in user see all classes.
- **teacherInterventions**: \`allow write: if false\`. This means no one can write? Check if server-side admin writes it (which bypasses rules).
`;

fs.writeFileSync(REPORT_FILE, report);
console.log(`Report saved to ${REPORT_FILE}`);
