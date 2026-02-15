import { initializeTestEnvironment, assertFails, assertSucceeds, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ID = 'demo-sankalp-hackathon';

async function runTests() {
  console.log('🔥 Initializing Firestore Rules Test Environment...');

  let testEnv: RulesTestEnvironment;
  try {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules: fs.readFileSync(path.resolve('firestore.rules'), 'utf8'),
        host: '127.0.0.1',
        port: 8080
      },
    });
  } catch (e) {
    console.error('❌ Failed to initialize test environment. Is the emulator running on port 8080?');
    console.error(e);
    process.exit(1);
  }

  console.log('✅ Environment initialized.');

  const runTest = async (name: string, testFn: () => Promise<void>) => {
    try {
      await testFn();
      console.log(`✅ PASS: ${name}`);
    } catch (e) {
      console.error(`❌ FAIL: ${name}`, e);
    }
  };

  try {
    // Test 1: Unauthenticated user cannot read anything
    await runTest('Unauthenticated user cannot read users', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      await assertFails(db.collection('users').doc('user1').get());
    });

    // Test 2: Student can read own profile
    await runTest('Student can read own profile', async () => {
      const db = testEnv.authenticatedContext('student1').firestore();
      await assertSucceeds(db.collection('users').doc('student1').get());
    });

    // Test 3: Student cannot read other student profile
    await runTest('Student cannot read other student profile', async () => {
      const db = testEnv.authenticatedContext('student1').firestore();
      await assertFails(db.collection('users').doc('student2').get());
    });

    // Test 4: Teacher can read student in their class
    await runTest('Teacher can read student in their class', async () => {
      // Setup data bypassing rules
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await db.collection('teachers').doc('teacher1').set({ role: 'teacher' });
        await db.collection('classes').doc('class1').set({ teacherId: 'teacher1' });
        // The rule checks: isTeacher() && resource.data.teacherId == request.auth.uid
        // isTeacher() checks exists(/databases/$(database)/documents/teachers/$(request.auth.uid))
        await db.collection('students').doc('student1').set({ teacherId: 'teacher1' });
      });

      const teacherDb = testEnv.authenticatedContext('teacher1').firestore();
      await assertSucceeds(teacherDb.collection('students').doc('student1').get());
    });

    // Test 5: Teacher cannot read student not in their class
    await runTest('Teacher cannot read student not in their class', async () => {
      // Setup data
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await db.collection('students').doc('student2').set({ teacherId: 'teacher2' });
      });

      const teacherDb = testEnv.authenticatedContext('teacher1').firestore();
      await assertFails(teacherDb.collection('students').doc('student2').get());
    });

  } finally {
    await testEnv.cleanup();
    console.log('🧹 Cleanup done.');
    // Force exit as cleanup might hang if emulator connection persists
    process.exit(0);
  }
}

runTests().catch((e) => {
    console.error(e);
    process.exit(1);
});
