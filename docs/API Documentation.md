# 🚀 API Documentation

> Complete reference for all SANKALP API endpoints

---

## 📋 Quick Reference

| Category | Endpoints | Status |
|----------|-----------|--------|
| [[#Student APIs]] | 3 | ✅ Complete |
| [[#Teacher APIs]] | 4 | ✅ Complete |
| [[#User APIs]] | 2 | ✅ Complete |
| [[#Activity APIs]] | 1 | ✅ Complete |
| [[#Quiz APIs]] | 1 | 🚧 Partial |
| [[#Class APIs]] | 2 | 📝 Planned |

---

## 🎓 Student APIs

### GET `/api/student`
Fetch student data by ID.

**Query Parameters**:
```typescript
{
  studentId: string  // Firebase UID
}
```

**Response** (200):
```json
{
  "success": true,
  "student": {
    "id": "abc123",
    "name": "John Doe",
    "grade": 10,
    "email": "john@example.com",
    "topics": ["Math", "Physics"],
    "masteryScores": {
      "algebra": 0.85,
      "calculus": 0.65
    },
    "onboardingCompleted": true
  }
}
```

**Error** (404):
```json
{
  "error": "Student not found"
}
```

**Implementation**: `src/app/api/student/route.ts`

---

### POST `/api/student/onboard`
Save student onboarding data.

**Request Body**:
```json
{
  "userId": "abc123",
  "name": "John Doe",
  "grade": 10,
  "subjects": ["Math", "Physics", "Chemistry"],
  "learningGoals": "Ace JEE Advanced",
  "dailyStudyTime": "3-4 hours",
  "classCode": "CLASS123" // optional
}
```

**Response** (201):
```json
{
  "success": true,
  "studentId": "abc123"
}
```

**Implementation**: `src/app/api/student/onboard/route.ts`

---

### GET `/api/student/graph`
Fetch brain map graph data.

**Query Parameters**:
```typescript
{
  studentId: string
}
```

**Response** (200):
```json
{
  "success": true,
  "nodes": [
    {
      "id": "algebra",
      "label": "Algebra",
      "type": "topic",
      "mastery": 0.85,
      "color": "#4CAF50"
    }
  ],
  "links": [
    {
      "source": "algebra",
      "target": "calculus",
      "strength": 0.7
    }
  ]
}
```

**Implementation**: `src/app/api/student/graph/route.ts`

---

## 👨‍🏫 Teacher APIs

### GET `/api/teacher`
Fetch teacher data by ID.

**Query Parameters**:
```typescript
{
  teacherId: string
}
```

**Response** (200):
```json
{
  "success": true,
  "teacher": {
    "id": "teacher123",
    "name": "Dr. Smith",
    "email": "smith@school.edu",
    "school": "High School ABC",
    "subjects": ["Mathematics", "Physics"],
    "grades": [9, 10, 11],
    "classIds": ["class1", "class2"],
    "onboardingCompleted": true
  }
}
```

**Implementation**: `src/app/api/teacher/route.ts`

---

### POST `/api/teacher/onboard`
Save teacher onboarding data.

**Request Body**:
```json
{
  "userId": "teacher123",
  "name": "Dr. Smith",
  "subjectsTaught": ["Math", "Physics"],
  "gradeLevels": [9, 10, 11, 12],
  "schoolName": "High School ABC",
  "expectedClassSize": "20-30 students"
}
```

**Implementation**: `src/app/api/teacher/onboard/route.ts`

---

### GET `/api/teacher/students`
Get list of students for a teacher.

**Query Parameters**:
```typescript
{
  teacherId: string
}
```

**Response** (200):
```json
{
  "success": true,
  "students": [
    {
      "id": "student1",
      "name": "John Doe",
      "grade": 10,
      "avgMastery": 75,
      "dropoutRisk": "low"
    }
  ]
}
```

**Implementation**: `src/app/api/teacher/students/route.ts`

---

### GET `/api/teacher/graph`
Get class network graph.

**Query Parameters**:
```typescript
{
  teacherId: string
}
```

**Response** (200):
```json
{
  "success": true,
  "nodes": [...],
  "links": [...]
}
```

**Implementation**: `src/app/api/teacher/graph/route.ts`

---

## 👤 User APIs

### GET `/api/users/[userId]`
Fetch user data by ID.

**Path Parameters**:
- `userId`: Firebase UID

**Response** (200):
```json
{
  "success": true,
  "uid": "abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "student",
  "createdAt": "2026-01-20T10:00:00Z"
}
```

**Implementation**: `src/app/api/users/[userId]/route.ts`

---

### POST `/api/users/create`
Create new user document.

**Request Body**:
```json
{
  "uid": "abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "student"
}
```

**Implementation**: `src/app/api/users/create/route.ts`

---

## 📊 Activity APIs

### POST `/api/activity/log`
Log user activity events.

**Batch Format** (from EventTracker):
```json
{
  "events": [
    {
      "id": "event-uuid",
      "studentId": "abc123",
      "sessionId": "session-uuid",
      "timestamp": 1706713200000,
      "action": {
        "type": "click",
        "target": "submit-quiz-btn",
        "context": "quiz-page"
      },
      "timing": {
        "clickTime": 1234
      },
      "data": {
        "completed": true
      },
      "metadata": {
        "deviceType": "desktop",
        "online": true,
        "retryCount": 0
      }
    }
  ]
}
```

**Legacy Format** (backwards compatible):
```json
{
  "studentId": "abc123",
  "sessionId": "session-uuid",
  "activityType": "quiz_submit",
  "details": {
    "score": 85,
    "timeSpent": 600
  }
}
```

**Response** (201):
```json
{
  "success": true,
  "processed": 1,
  "logIds": ["log-id-1"]
}
```

**Implementation**: `src/app/api/activity/log/route.ts`

---

## 📝 Quiz APIs

### POST `/api/quiz/submit`
Submit quiz answers.

**Status**: 🚧 Partial (needs question generation)

**Request Body**:
```json
{
  "studentId": "abc123",
  "quizId": "quiz-uuid",
  "answers": [
    {
      "questionId": "q1",
      "answer": "B"
    }
  ],
  "timeSpent": 600
}
```

**Implementation**: `src/app/api/quiz/submit/route.ts`

---

## 🏫 Class APIs (Planned)

### POST `/api/classes/create`
Create a new class.

**Status**: 📝 Not yet implemented

**Planned Request**:
```json
{
  "teacherId": "teacher123",
  "className": "Physics Grade 10",
  "subject": "Physics",
  "grade": 10
}
```

**Planned Response**:
```json
{
  "success": true,
  "classId": "class-uuid",
  "classCode": "PHYS10A"
}
```

---

### POST `/api/classes/join`
Join a class with code.

**Status**: 📝 Not yet implemented

**Planned Request**:
```json
{
  "studentId": "abc123",
  "classCode": "PHYS10A"
}
```

---

## 🔐 Authentication

### Current Implementation
All API routes use **query parameter** or **request body** authentication:
```typescript
const { studentId } = searchParams.get('studentId');
// OR
const { studentId } = await req.json();
```

### Planned Enhancement
Token-based authentication:
```typescript
const token = req.headers.get('Authorization');
const uid = await verifyToken(token);
```

---

## 🚨 Error Handling

### Error Response Format
```json
{
  "error": "Error message",
  "code": "ERROR_CODE", // optional
  "details": {} // optional
}
```

### Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success (GET) | Data retrieved |
| 201 | Created (POST) | Resource created |
| 400 | Bad Request | Missing required field |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Database error |

---

## 📊 Rate Limiting

**Status**: 📝 Not yet implemented

**Planned**:
- 100 requests per minute per user
- 1000 requests per hour per IP
- Exponential backoff for retry

---

## 🧪 Testing APIs

### Local Development
```bash
# Start dev server
npm run dev

# Test endpoint
curl http://localhost:3000/api/student?studentId=abc123
```

### Production
```bash
Base URL: https://sankalp-prerollout.web.app
```

---

## 🔗 Related Docs

- [[Architecture Map]]
- [[Database Schema]]
- [[Features Overview]]

---

*API docs last updated: 2026-01-31*
