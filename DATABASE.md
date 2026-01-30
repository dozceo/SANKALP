 # Database Integration Guide

## Overview

This guide explains how to integrate a real database into Sankalp, replacing the current mock data with persistent storage. The system is designed to be **database-agnostic** with clean data contracts.

---

## Current State (Mock Data)

### What's Mocked Right Now

**Frontend (`/api/intelligence/student/route.ts`):**
```typescript
const studentHistory: StudentHistory = {
  studentId: "demo_student",
  quizResults: [
    { topic: "Algebra", score: 0.35, timestamp: new Date(), ... }
  ],
  // ... mock data
};
```

**Why This Works:**
- API interface is stable (`StudentIntelligence` type)
- ML/ADK logic is real
- UI consumes real API responses
- Only the data source is mocked

---

## Database Options (Choose One)

### Option 1: Firebase (Recommended for Quick Start)
**Pros:** Already configured, serverless, real-time sync  
**Cons:** Vendor lock-in, less control

### Option 2: PostgreSQL + Prisma (Recommended for Production)
**Pros:** Full control, type-safe ORM, scalable  
**Cons:** Requires server setup

### Option 3: MongoDB + Mongoose
**Pros:** Flexible schema, good for unstructured data  
**Cons:** Less type-safe

---

## Schema Design

### Core Tables/Collections

#### 1. **students**
```prisma
model Student {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String
  registrationDate DateTime @default(now())
  lastLoginDate DateTime @updatedAt
  quizResults   QuizResult[]
  
  @@index([email])
}
```

#### 2. **quiz_results**
```prisma
model QuizResult {
  id                  String   @id @default(cuid())
  studentId           String
  topic               String
  score               Float    // 0.0 to 1.0
  timeSpent           Int      // seconds
  questionsAttempted  Int
  timestamp           DateTime @default(now())
  
  student Student @relation(fields: [studentId], references: [id])
  
  @@index([studentId, topic])
  @@index([timestamp])
}
```

#### 3. **ml_predictions** (Cache Layer)
```prisma
model MLPrediction {
  id                  String   @id @default(cuid())
  studentId           String
  topic               String
  masteryProbability  Float
  confidence          Float
  daysSinceRevision   Int
  createdAt           DateTime @default(now())
  expiresAt           DateTime // Invalidate after 1 hour
  
  @@index([studentId, topic])
  @@index([expiresAt])
}
```

#### 4. **adk_decisions** (Audit Trail)
```prisma
model ADKDecision {
  id          String   @id @default(cuid())
  studentId   String
  topic       String
  action      String   // URGENT_REVISION, SCHEDULED_REVISION, etc.
  priority    String   // HIGH, MEDIUM, LOW
  reasoning   String
  flags       String[] // ADK flags for analytics
  timestamp   DateTime @default(now())
  
  @@index([studentId])
  @@index([timestamp])
}
```

#### 5. **teacher_interventions**
```prisma
model TeacherIntervention {
  id              String   @id @default(cuid())
  studentId       String
  topic           String
  severity        String   // LOW, MEDIUM, HIGH, CRITICAL
  reason          String
  suggestedAction String
  resolved        Boolean  @default(false)
  createdAt       DateTime @default(now())
  
  @@index([studentId, resolved])
}
```

---

## Step-by-Step Integration (PostgreSQL + Prisma)

### Step 1: Install Dependencies

```bash
npm install prisma @prisma/client
npm install -D prisma
```

### Step 2: Initialize Prisma

```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma`
- `.env` (add `DATABASE_URL`)

### Step 3: Configure Database URL

**`.env.local`:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/sankalp?schema=public"
```

**For development (Docker):**
```bash
docker run --name sankalp-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
```

### Step 4: Define Schema

Copy the schema models above into `prisma/schema.prisma`.

### Step 5: Create Migration

```bash
npx prisma migrate dev --name init
```

### Step 6: Generate Prisma Client

```bash
npx prisma generate
```

---

## Code Changes Required

### Change 1: Create Database Client

**`src/lib/db.ts` (NEW FILE):**
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Change 2: Update Intelligence API

**`src/app/api/intelligence/student/route.ts`:**

**BEFORE (Mock Data):**
```typescript
const studentHistory: StudentHistory = {
  quizResults: [ /* mock data */ ],
  // ...
};
```

**AFTER (Real Database):**
```typescript
import { prisma } from '@/lib/db';

// Fetch real data
const student = await prisma.student.findUnique({
  where: { id: studentId },
  include: {
    quizResults: {
      orderBy: { timestamp: 'desc' },
      take: 100, // Last 100 quizzes
    },
  },
});

if (!student) {
  return NextResponse.json({ error: "Student not found" }, { status: 404 });
}

const studentHistory: StudentHistory = {
  studentId: student.id,
  quizResults: student.quizResults.map((qr) => ({
    topic: qr.topic,
    score: qr.score,
    timestamp: qr.timestamp,
    timeSpent: qr.timeSpent,
    questionsAttempted: qr.questionsAttempted,
  })),
  lastLoginDate: student.lastLoginDate,
  registrationDate: student.registrationDate,
};
```

### Change 3: Save Quiz Results

**When student completes quiz:**
```typescript
// src/app/api/quiz/submit/route.ts
await prisma.quizResult.create({
  data: {
    studentId: session.user.id,
    topic: quizData.topic,
    score: calculateScore(quizData.answers),
    timeSpent: quizData.duration,
    questionsAttempted: quizData.answers.length,
  },
});
```

### Change 4: Cache ML Predictions (Optional)

```typescript
// Check cache first
const cached = await prisma.mLPrediction.findFirst({
  where: {
    studentId,
    topic,
    expiresAt: { gt: new Date() },
  },
});

if (cached) {
  return { /* use cached prediction */ };
}

// Make fresh prediction
const mlPrediction = await predictMastery(features);

// Cache it
await prisma.mLPrediction.create({
  data: {
    studentId,
    topic,
    masteryProbability: mlPrediction.mastery_probability,
    confidence: mlPrediction.confidence,
    daysSinceRevision: features.days_since_last_revision,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  },
});
```

### Change 5: Log ADK Decisions

```typescript
// After ADK decision
await prisma.aDKDecision.create({
  data: {
    studentId,
    topic,
    action: adkDecision.action,
    priority: adkDecision.priority,
    reasoning: adkDecision.reasoning,
    flags: adkDecision.adkFlags,
  },
});
```

### Change 6: Teacher Interventions

```typescript
const intervention = makeInterventionDecision(context);

if (intervention) {
  await prisma.teacherIntervention.create({
    data: {
      studentId: intervention.studentId,
      topic: intervention.topic,
      severity: intervention.severity,
      reason: intervention.reason,
      suggestedAction: intervention.suggestedAction,
    },
  });
}
```

---

## Data Migration Plan

### Phase 1: Development Testing
1. Set up local PostgreSQL
2. Run migrations
3. Seed with test data
4. Update API routes
5. Test with Prisma Studio (`npx prisma studio`)

### Phase 2: Production Deployment
1. Set up production database (Railway, Supabase, AWS RDS)
2. Run migrations on production
3. Update `DATABASE_URL` in production env
4. Deploy Next.js app
5. Monitor for errors

---

## Testing Database Integration

### 1. Seed Test Data

**`prisma/seed.ts`:**
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const student = await prisma.student.create({
    data: {
      email: 'test@example.com',
      name: 'Alex Test',
      quizResults: {
        create: [
          {
            topic: 'Algebra',
            score: 0.35,
            timeSpent: 180,
            questionsAttempted: 10,
          },
          // ... more quiz results
        ],
      },
    },
  });

  console.log('✅ Seeded student:', student.id);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
```

Run: `npx prisma db seed`

### 2. Test API Endpoint

```bash
curl http://localhost:3000/api/intelligence/student?studentId=<real-id>
```

Should return real data from database.

---

## Removing All Mock Data (Checklist)

- [ ] `src/app/api/intelligence/student/route.ts` - Replace mock `studentHistory`
- [ ] `src/app/(main)/home/page.tsx` - Already using API, no changes needed
- [ ] `src/components/LearningStateCard.tsx` - No mock data, uses API
- [ ] `src/components/TopicMasteryGrid.tsx` - No mock data, uses API
- [ ] Add authentication (NextAuth.js) to get real `studentId`
- [ ] Create quiz submission endpoint that saves to DB
- [ ] Update any hardcoded student names ("Alex") to fetch from DB

---

## Production Recommendations

### 1. Use Connection Pooling
```typescript
// For serverless (Vercel)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // for migrations
}
```

### 2. Add Database Indexes
Already defined in schema above for performance.

### 3. Implement Caching
Use Redis or Prisma caching for ML predictions.

### 4. Add Migrations to CI/CD
```bash
# In deployment pipeline
npx prisma migrate deploy
```

### 5. Monitor Query Performance
```typescript
prisma.$on('query', (e) => {
  console.log('Query:', e.query);
  console.log('Duration:', e.duration, 'ms');
});
```

---

## Database Hosting Options

| Provider | Free Tier | Best For |
|----------|-----------|----------|
| **Supabase** | Yes (500MB) | Quick start, PostgreSQL + auth |
| **Railway** | Yes ($5 credit) | Easy deployment, auto-scaling |
| **PlanetScale** | Yes (5GB) | MySQL, serverless |
| **AWS RDS** | No | Enterprise, full control |
| **Vercel Postgres** | Yes (256MB) | Tight integration with Next.js |

---

## Questions to Decide

1. **Authentication:** NextAuth.js or Firebase Auth?
2. **Database:** PostgreSQL or MongoDB?
3. **Hosting:** Where to deploy? (Vercel + Supabase is easiest)
4. **File Storage:** For quiz images/PDFs - AWS S3 or Vercel Blob?

Once decided, follow the steps above to integrate. The architecture is ready - just swap the data source!
