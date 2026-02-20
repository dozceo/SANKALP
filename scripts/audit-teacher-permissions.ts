
import fs from 'fs';
import path from 'path';

const FILES_TO_AUDIT = [
  'src/app/api/teacher/students/route.ts',
  'src/app/api/teacher/graph/route.ts'
];

async function auditTeacherPermissions() {
  console.log('Starting Teacher Permission Audit...');

  const reportPath = path.join(process.cwd(), 'reports', 'TEACHER_PERMISSION_BOUNDARY_REPORT.md');
  const reportDir = path.dirname(reportPath);

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  let reportContent = `# Teacher Permission Boundary Report

## Overview
This report audits the API endpoints for teacher-specific features to ensure proper Role-Based Access Control (RBAC) is enforced.

## Methodology
- Static analysis of API route handlers.
- Searching for authentication (\`auth()\`, \`currentUser()\`) and authorization (\`role === 'teacher'\`) checks.
- Verification of IDOR (Insecure Direct Object Reference) vulnerabilities.

## Findings

`;

  for (const file of FILES_TO_AUDIT) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');

      reportContent += `### Analysis of \`${file}\`\n\n`;

      // Check for Auth
      const hasAuth = content.includes('auth()') || content.includes('currentUser()') || content.includes('getServerSession');
      // Check for Role Check
      const hasRoleCheck = content.includes("role === 'teacher'") || content.includes('role == "teacher"') || content.includes('isTeacher');

      // Check for IDOR risk (using query param without validation)
      const usesQueryParam = content.includes('searchParams.get(\'teacherId\')');

      if (!hasAuth) {
        reportContent += `- ❌ **CRITICAL**: No authentication check detected. The endpoint appears to be public.\n`;
      } else {
        reportContent += `- ✅ Authentication check detected.\n`;
      }

      if (!hasRoleCheck) {
        reportContent += `- ❌ **CRITICAL**: No role validation detected. Any authenticated user (including students) might access this.\n`;
      } else {
        reportContent += `- ✅ Role validation detected.\n`;
      }

      if (usesQueryParam && !hasRoleCheck) {
        reportContent += `- ❌ **HIGH RISK**: IDOR Vulnerability. The endpoint uses \`teacherId\` from query parameters without verifying if the current user *is* that teacher.\n`;
      }

      reportContent += `\n`;
    } else {
      reportContent += `### Analysis of \`${file}\`\n\n- ⚠️ File not found.\n\n`;
    }
  }

  reportContent += `## Recommendations

1.  **Implement Auth Guard**:
    - Wrap all teacher routes with an authentication check.
    \`\`\`typescript
    const session = await auth();
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });
    \`\`\`

2.  **Enforce RBAC**:
    - Verify the user's role.
    \`\`\`typescript
    if (session.user.role !== 'teacher') return new NextResponse('Forbidden', { status: 403 });
    \`\`\`

3.  **Prevent IDOR**:
    - Do not trust \`teacherId\` from the client query params for authorization.
    - Instead, use \`session.user.id\` as the source of truth for fetching data.
    - Or, if \`teacherId\` is needed (e.g. admin viewing a teacher), verify that \`session.user.id === teacherId\` or \`session.user.role === 'admin'\`.

`;

  fs.writeFileSync(reportPath, reportContent);
  console.log(`Report generated at ${reportPath}`);
}

auditTeacherPermissions().catch(console.error);
