import fs from 'fs';
import path from 'path';

const REPORT_PATH = path.join(process.cwd(), 'reports/FIRESTORE_SECURITY_COVERAGE.md');

// Types
type Auth = { uid: string; token?: any } | null;
type Resource = { data: any } | null;
type RequestResource = { data: any } | null;
type Method = 'get' | 'list' | 'create' | 'update' | 'delete';

class FirestoreSimulator {
  // Mock Database State for "exists" and "get" checks
  private db: Record<string, any> = {
    'teachers/teacher1': { uid: 'teacher1' },
    'teachers/teacher2': { uid: 'teacher2' },
    'classes/class1': { teacherId: 'teacher1', students: ['student1'] },
    'students/student1': { uid: 'student1', teacherId: 'teacher1' },
    'students/student2': { uid: 'student2', teacherId: 'teacher2' },
    'users/student1': { uid: 'student1' },
    'users/teacher1': { uid: 'teacher1' },
  };

  // Helper Functions from firestore.rules
  private isAuthenticated(auth: Auth): boolean {
    return auth !== null;
  }

  private isOwner(auth: Auth, userId: string): boolean {
    return this.isAuthenticated(auth) && auth!.uid === userId;
  }

  private isTeacher(auth: Auth): boolean {
    if (!this.isAuthenticated(auth)) return false;
    // exists(/databases/$(database)/documents/teachers/$(request.auth.uid));
    return !!this.db[`teachers/${auth!.uid}`];
  }

  private isTeacherOfClass(auth: Auth, classId: string): boolean {
    if (!this.isTeacher(auth)) return false;
    // get(/databases/$(database)/documents/classes/$(classId)).data.teacherId == request.auth.uid;
    const classData = this.db[`classes/${classId}`];
    return classData && classData.teacherId === auth!.uid;
  }

  // Router / Matcher
  public evaluate(path: string, method: Method, auth: Auth, resource: Resource, requestResource: RequestResource): string {
    const segments = path.split('/').filter(s => s);
    const collection = segments[0];
    const docId = segments[1];

    try {
      // /users/{userId}
      if (collection === 'users' && docId) {
        if (method === 'get' || method === 'list') return this.isOwner(auth, docId) ? 'ALLOW' : 'DENY';
        if (method === 'create') return this.isAuthenticated(auth) ? 'ALLOW' : 'DENY';
        if (method === 'update') return this.isOwner(auth, docId) ? 'ALLOW' : 'DENY';
        return 'DENY'; // Default
      }

      // /teachers/{teacherId}
      if (collection === 'teachers' && docId) {
        if (method === 'get' || method === 'list') return this.isOwner(auth, docId) ? 'ALLOW' : 'DENY';
        if (method === 'create' || method === 'update' || method === 'delete') return this.isOwner(auth, docId) ? 'ALLOW' : 'DENY'; // write
        return 'DENY';
      }

      // /classes/{classId}
      if (collection === 'classes' && docId) {
        if (method === 'get' || method === 'list') return this.isAuthenticated(auth) ? 'ALLOW' : 'DENY';
        if (method === 'create') return this.isTeacher(auth) ? 'ALLOW' : 'DENY';
        if (method === 'update' || method === 'delete') return this.isTeacherOfClass(auth, docId) ? 'ALLOW' : 'DENY';
        return 'DENY';
      }

      // /students/{studentId}
      if (collection === 'students' && docId) {
        // allow read: if isOwner(studentId) || (isTeacher() && resource.data.teacherId == request.auth.uid);
        if (method === 'get' || method === 'list') {
            const isOwn = this.isOwner(auth, docId);
            // Simulate resource lookup if passed, or use mock DB
            const studentData = resource ? resource.data : this.db[`students/${docId}`];
            const isTeacherAuth = this.isTeacher(auth);
            const isTeacherOfStudent = isTeacherAuth && studentData && studentData.teacherId === auth?.uid;

            return (isOwn || isTeacherOfStudent) ? 'ALLOW' : 'DENY';
        }
        if (method === 'create' || method === 'update') return this.isOwner(auth, docId) ? 'ALLOW' : 'DENY';
        return 'DENY';
      }

      // /quizResults/{resultId}
      if (collection === 'quizResults' && docId) {
         // allow read: if isAuthenticated() && (resource.data.studentId == request.auth.uid || resource.data.teacherId == request.auth.uid);
         if (method === 'get' || method === 'list') {
             if (!this.isAuthenticated(auth)) return 'DENY';
             const resData = resource?.data || {};
             // Logic depends on resource data being present
             if (resData.studentId === auth?.uid || resData.teacherId === auth?.uid) return 'ALLOW';
             return 'DENY';
         }
         // allow create: if isAuthenticated() && request.resource.data.studentId == request.auth.uid;
         if (method === 'create') {
             if (!this.isAuthenticated(auth)) return 'DENY';
             if (requestResource?.data?.studentId === auth?.uid) return 'ALLOW';
             return 'DENY';
         }
         return 'DENY';
      }

      return 'DENY (No Match)';
    } catch (e) {
      return `ERROR: ${e}`;
    }
  }
}

function runSimulation() {
  const sim = new FirestoreSimulator();
  const scenarios = [
    // Users Collection
    { name: 'Student reads own profile', path: 'users/student1', method: 'get', auth: { uid: 'student1' }, resource: null, expect: 'ALLOW' },
    { name: 'Student reads other profile', path: 'users/student2', method: 'get', auth: { uid: 'student1' }, resource: null, expect: 'DENY' },
    { name: 'Teacher reads student profile (users)', path: 'users/student1', method: 'get', auth: { uid: 'teacher1' }, resource: null, expect: 'DENY' }, // Private user data

    // Classes Collection
    { name: 'Student reads class', path: 'classes/class1', method: 'get', auth: { uid: 'student1' }, resource: null, expect: 'ALLOW' },
    { name: 'Teacher creates class', path: 'classes/newClass', method: 'create', auth: { uid: 'teacher1' }, resource: null, expect: 'ALLOW' },
    { name: 'Student creates class', path: 'classes/newClass', method: 'create', auth: { uid: 'student1' }, resource: null, expect: 'DENY' },
    { name: 'Teacher updates own class', path: 'classes/class1', method: 'update', auth: { uid: 'teacher1' }, resource: null, expect: 'ALLOW' },
    { name: 'Teacher updates other class', path: 'classes/class1', method: 'update', auth: { uid: 'teacher2' }, resource: null, expect: 'DENY' },

    // Students Collection (Profile/Data linked to teacher)
    { name: 'Student reads own student data', path: 'students/student1', method: 'get', auth: { uid: 'student1' }, resource: null, expect: 'ALLOW' },
    { name: 'Student reads other student data', path: 'students/student2', method: 'get', auth: { uid: 'student1' }, resource: null, expect: 'DENY' },
    { name: 'Teacher reads own student data', path: 'students/student1', method: 'get', auth: { uid: 'teacher1' }, resource: { data: { uid: 'student1', teacherId: 'teacher1' } }, expect: 'ALLOW' },
    { name: 'Teacher reads other student data', path: 'students/student2', method: 'get', auth: { uid: 'teacher1' }, resource: { data: { uid: 'student2', teacherId: 'teacher2' } }, expect: 'DENY' },

    // Quiz Results
    { name: 'Student reads own quiz result', path: 'quizResults/q1', method: 'get', auth: { uid: 'student1' }, resource: { data: { studentId: 'student1' } }, expect: 'ALLOW' },
    { name: 'Student reads other quiz result', path: 'quizResults/q2', method: 'get', auth: { uid: 'student1' }, resource: { data: { studentId: 'student2' } }, expect: 'DENY' },
    { name: 'Teacher reads student quiz result', path: 'quizResults/q1', method: 'get', auth: { uid: 'teacher1' }, resource: { data: { studentId: 'student1', teacherId: 'teacher1' } }, expect: 'ALLOW' },
    { name: 'Student creates quiz result for self', path: 'quizResults/new', method: 'create', auth: { uid: 'student1' }, requestResource: { data: { studentId: 'student1' } }, expect: 'ALLOW' },
    { name: 'Student creates quiz result for other', path: 'quizResults/new', method: 'create', auth: { uid: 'student1' }, requestResource: { data: { studentId: 'student2' } }, expect: 'DENY' },
  ];

  let report = `# Firestore Security Rules Coverage Simulation

**Date:** ${new Date().toISOString()}

This report details the results of simulating Firestore security rules against various access scenarios.

| Scenario | Path | Method | User Role | Expected | Actual | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
`;

  let passed = 0;
  let failed = 0;

  scenarios.forEach(s => {
    const result = sim.evaluate(s.path, s.method as Method, s.auth, s.resource || null, s.requestResource || null);
    const status = result === s.expect ? '✅ PASS' : '❌ FAIL';
    if (result === s.expect) passed++; else failed++;

    const role = s.auth ? (s.auth.uid.startsWith('teacher') ? 'Teacher' : 'Student') : 'Unauth';

    report += `| ${s.name} | \`${s.path}\` | \`${s.method}\` | ${role} | ${s.expect} | ${result} | ${status} |\n`;
  });

  report += `\n## Summary\n\n- **Total Scenarios:** ${scenarios.length}\n- **Passed:** ${passed}\n- **Failed:** ${failed}\n\n`;

  if (failed === 0) {
    report += `**Conclusion:** The security rules logic appears consistent with the intended access control model.\n`;
  } else {
    report += `**Conclusion:** ⚠️ logic deviations detected. Review the Failed scenarios.\n`;
  }

  fs.writeFileSync(REPORT_PATH, report);
  console.log(`Report generated at ${REPORT_PATH}`);
}

runSimulation();
