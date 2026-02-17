
// Set dummy API key to prevent Genkit initialization error
process.env.GOOGLE_GENAI_API_KEY = 'dummy';
process.env.GEMINI_API_KEY = 'dummy';

// Set dummy Firebase config to prevent admin initialization error
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'demo-project';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
