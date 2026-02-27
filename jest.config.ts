import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
     '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: [
      '<rootDir>/node_modules/',
      '<rootDir>/.next/',
      '<rootDir>/e2e/',
      '<rootDir>/src/ai/adk/decision-engine.test.ts',
      '<rootDir>/src/ai/flows/schema.test.ts',
      '<rootDir>/src/ai/flows/schema-regression.test.ts',
      '<rootDir>/src/ml/features/student_features.test.ts',
      '<rootDir>/src/ai/adk/decision-engine-regression.test.ts',
      '<rootDir>/scripts/audit-teacher-rbac.test.ts',
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!(jose|jwks-rsa|firebase-admin|lucide-react)/)',
  ],
}

export default createJestConfig(config)
