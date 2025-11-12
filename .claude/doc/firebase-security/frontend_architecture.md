# Firebase Security Integration Implementation Plan

## Overview
This document outlines the comprehensive security implementation for Firebase integration in the BlancAlergic-APP React + Vite application.

## Current State Analysis

### ✅ Security Measures Already in Place
- Environment variables properly excluded from Git (.gitignore)
- GitHub Actions workflow validates required environment variables
- Firebase config uses runtime environment variables (import.meta.env)
- Build process verifies Firebase configuration exists

### 🚨 Critical Security Issues Identified
1. **Exposed Firebase API Key**: API key visible in build verification step
2. **No Environment Separation**: Single Firebase project for dev/prod
3. **Missing Security Rules**: No evidence of Firestore/Storage security rules
4. **Overly Permissive Configuration**: Default permissions appear to be used

## Implementation Strategy

### Phase 1: Environment Separation & Configuration

#### 1.1 Firebase Project Setup
**Required Actions:**
- Create separate Firebase projects for each environment
  - Development: `blancalergic-app-dev`
  - Production: `blancalergic-app` (existing)
  - Testing: `blancalergic-app-test` (optional)

**Files to Create/Modify:**
```bash
# New Files:
- .env.example                    # Template for developers
- .env.development               # Development environment config
- scripts/setup-firebase.js      # Automated Firebase project setup

# Modify:
- .github/workflows/deploy.yaml  # Update to support multiple environments
- src/firebase/config.ts         # Enhance with environment detection
- vite.config.ts                 # Add environment-specific build configs
```

#### 1.2 Enhanced Environment Configuration

**New File: `.env.example`**
```env
# Firebase Configuration Template
# Copy to .env and fill with your values

# Development Firebase Project
VITE_FIREBASE_API_KEY=your_dev_api_key
VITE_FIREBASE_AUTH_DOMAIN=blancalergic-app-dev.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=blancalergic-app-dev
VITE_FIREBASE_STORAGE_BUCKET=blancalergic-app-dev.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_dev_sender_id
VITE_FIREBASE_APP_ID=your_dev_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_dev_measurement_id

# Environment
VITE_APP_ENV=development
```

**Enhanced: `src/firebase/config.ts`**
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

type Environment = 'development' | 'staging' | 'production';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

const getFirebaseConfig = (): FirebaseConfig => {
  const environment = (import.meta.env.VITE_APP_ENV || 'development') as Environment;

  const configs: Record<Environment, FirebaseConfig> = {
    development: {
      apiKey: import.meta.env.VITE_FIREBASE_DEV_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_DEV_AUTH_DOMAIN || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_DEV_PROJECT_ID || import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_DEV_STORAGE_BUCKET || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_DEV_MESSAGING_SENDER_ID || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_DEV_APP_ID || import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_DEV_MEASUREMENT_ID || import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    },
    staging: {
      // Staging configuration
      apiKey: import.meta.env.VITE_FIREBASE_STAGING_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_STAGING_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_STAGING_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STAGING_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_STAGING_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_STAGING_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_STAGING_MEASUREMENT_ID,
    },
    production: {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    }
  };

  const config = configs[environment];

  // Validate required fields
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missingFields = requiredFields.filter(field => !config[field as keyof FirebaseConfig]);

  if (missingFields.length > 0) {
    throw new Error(`Missing Firebase configuration for ${environment}: ${missingFields.join(', ')}`);
  }

  return config;
};

// Initialize Firebase
const firebaseConfig = getFirebaseConfig();
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configure auth
auth.languageCode = 'es';

// Development-specific settings
if (import.meta.env.DEV) {
  auth.settings.appVerificationDisabledForTesting = true;
  console.log('🔥 Firebase initialized in development mode');
}

export default app;
```

### Phase 2: Firebase Security Rules Implementation

#### 2.1 Firestore Security Rules
**New File: `firestore.rules`**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isValidEmail(email) {
      return email.matches('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');
    }

    // Users collection - only own user data
    match /users/{userId} {
      allow read, write: if isOwner(userId);
      allow create: if isAuthenticated() &&
        isOwner(userId) &&
        isValidEmail(resource.data.email);
    }

    // Medical records - strict access control
    match /medicalRecords/{recordId} {
      allow read, write: if isOwner(resource.data.userId);
      allow create: if isAuthenticated() &&
        isOwner(request.resource.data.userId);
    }

    // Allergy data - public read, authenticated write
    match /allergies/{allergyId} {
      allow read: if true; // Public read access
      allow write: if isAuthenticated(); // Only authenticated users can write
      allow update: if isAuthenticated() &&
        (isOwner(resource.data.createdBy) || isAdmin());
    }

    // User-specific allergy profiles
    match /userAllergies/{userId} {
      allow read, write: if isOwner(userId);
      allow create: if isAuthenticated() && isOwner(userId);
    }

    // Emergency contacts - only user access
    match /emergencyContacts/{contactId} {
      allow read, write: if isOwner(resource.data.userId);
      allow create: if isAuthenticated() &&
        isOwner(request.resource.data.userId);
    }

    // App settings - only own settings
    match /settings/{userId} {
      allow read, write: if isOwner(userId);
    }

    // Admin functions
    function isAdmin() {
      return isAuthenticated() &&
        request.auth.token.email == 'admin@blancalergic.com';
    }

    // Admin-only collections
    match /admin/{document} {
      allow read, write: if isAdmin();
    }
  }
}
```

#### 2.2 Firebase Storage Security Rules
**New File: `storage.rules`**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isValidImageType() {
      return request.resource.contentType.matches('image/.*');
    }

    function isValidDocumentType() {
      return request.resource.contentType.matches('application/pdf') ||
             request.resource.contentType.matches('image/.*');
    }

    // Profile images - user-specific
    match /profile-images/{userId}/{allPaths=**} {
      allow read: if true; // Public profile images
      allow write: if isOwner(userId) && isValidImageType() &&
        request.resource.size < 2 * 1024 * 1024; // 2MB limit
    }

    // Medical documents - strict access control
    match /medical-documents/{userId}/{allPaths=**} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId) && isValidDocumentType() &&
        request.resource.size < 10 * 1024 * 1024; // 10MB limit
    }

    // Temporary uploads - time-limited access
    match /temp-uploads/{userId}/{uploadId}/{allPaths=**} {
      allow read, write: if isOwner(userId) &&
        request.time < resource.timeCreated + duration('1h');
    }
  }
}
```

### Phase 3: Enhanced GitHub Actions Workflow

#### 3.1 Updated Deployment Configuration
**Modified: `.github/workflows/deploy.yaml`**
```yaml
name: Deploy

on:
  push:
    branches:
      - main
      - develop
  workflow_dispatch:

env:
  NODE_ENV: ${{ github.ref == 'refs/heads/main' && 'production' || 'development' }}

jobs:
  build:
    name: Build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repo
        uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        uses: bahmutov/npm-install@v1

      - name: Set environment variables
        run: |
          echo "VITE_APP_ENV=${{ env.NODE_ENV }}" >> .env.production

          if [[ "${{ env.NODE_ENV }}" == "production" ]]; then
            echo "VITE_FIREBASE_API_KEY=${{ secrets.FIREBASE_PROD_API_KEY }}" >> .env.production
            echo "VITE_FIREBASE_AUTH_DOMAIN=${{ secrets.FIREBASE_PROD_AUTH_DOMAIN }}" >> .env.production
            echo "VITE_FIREBASE_PROJECT_ID=${{ secrets.FIREBASE_PROD_PROJECT_ID }}" >> .env.production
            echo "VITE_FIREBASE_STORAGE_BUCKET=${{ secrets.FIREBASE_PROD_STORAGE_BUCKET }}" >> .env.production
            echo "VITE_FIREBASE_MESSAGING_SENDER_ID=${{ secrets.FIREBASE_PROD_MESSAGING_SENDER_ID }}" >> .env.production
            echo "VITE_FIREBASE_APP_ID=${{ secrets.FIREBASE_PROD_APP_ID }}" >> .env.production
            echo "VITE_FIREBASE_MEASUREMENT_ID=${{ secrets.FIREBASE_PROD_MEASUREMENT_ID }}" >> .env.production
          else
            echo "VITE_FIREBASE_API_KEY=${{ secrets.FIREBASE_DEV_API_KEY }}" >> .env.production
            echo "VITE_FIREBASE_AUTH_DOMAIN=${{ secrets.FIREBASE_DEV_AUTH_DOMAIN }}" >> .env.production
            echo "VITE_FIREBASE_PROJECT_ID=${{ secrets.FIREBASE_DEV_PROJECT_ID }}" >> .env.production
            echo "VITE_FIREBASE_STORAGE_BUCKET=${{ secrets.FIREBASE_DEV_STORAGE_BUCKET }}" >> .env.production
            echo "VITE_FIREBASE_MESSAGING_SENDER_ID=${{ secrets.FIREBASE_DEV_MESSAGING_SENDER_ID }}" >> .env.production
            echo "VITE_FIREBASE_APP_ID=${{ secrets.FIREBASE_DEV_APP_ID }}" >> .env.production
            echo "VITE_FIREBASE_MEASUREMENT_ID=${{ secrets.FIREBASE_DEV_MEASUREMENT_ID }}" >> .env.production
          fi

      - name: Verify Firebase configuration
        run: |
          echo "🔥 Verifying configuración de Firebase para ${{ env.NODE_ENV }}..."
          required_vars=("VITE_FIREBASE_API_KEY" "VITE_FIREBASE_AUTH_DOMAIN" "VITE_FIREBASE_PROJECT_ID" "VITE_FIREBASE_APP_ID")

          for var in "${required_vars[@]}"; do
            if [[ -z "${!var}" ]]; then
              echo "❌ Falta variable de entorno: $var"
              exit 1
            fi
          done
          echo "✅ Variables de entorno verificadas"

      - name: Build project
        run: npm run build

      - name: Security audit of build
        run: |
          echo "🔒 Realizando auditoría de seguridad del build..."

          # Check for exposed secrets
          if grep -r "AIzaSy" dist/; then
            echo "❌ Se detectaron claves de API expuestas en el build"
            exit 1
          fi

          # Verify no development data in production
          if [[ "${{ env.NODE_ENV }}" == "production" ]]; then
            if grep -r "dev-" dist/ || grep -r "localhost" dist/; then
              echo "❌ Se detectaron datos de desarrollo en el build de producción"
              exit 1
            fi
          fi

          echo "✅ Auditoría de seguridad completada"

      - name: Optimize build
        run: |
          echo "🚀 Optimizando build para producción..."
          # Additional optimizations
          find dist -name "*.js" -exec gzip -k {} \;
          find dist -name "*.css" -exec gzip -k {} \;
          echo "✅ Build optimizado"

      - name: Upload build files
        uses: actions/upload-artifact@v4
        with:
          name: build-files-${{ github.sha }}
          path: ./dist
          retention-days: 30

  deploy:
    name: Deploy
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Download artifact
        uses: actions/download-artifact@v4
        with:
          name: build-files-${{ github.sha }}
          path: ./dist

      - name: Deploy Firebase rules
        run: |
          echo "🔥 Desplegando reglas de seguridad de Firebase..."
          npm install -g firebase-tools
          firebase deploy --only firestore:rules,storage --project blancalergic-app
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist

  deploy-staging:
    name: Deploy to Staging
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'

    steps:
      - name: Download artifact
        uses: actions/download-artifact@v4
        with:
          name: build-files-${{ github.sha }}
          path: ./dist

      - name: Deploy to Staging
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          destination_dir: develop
```

### Phase 4: API Key Security Enhancement

#### 4.1 Firebase API Key Configuration
**Security Restrictions to Implement:**

```javascript
// Firebase Console -> Project Settings -> API Keys
// Configure for each environment:

Development API Key Restrictions:
- Application restrictions:
  - HTTP referrers: localhost:*, 127.0.0.1:*
  - IP addresses: Development team IPs
- API restrictions: Only enable required APIs
  - ✓ Identity Toolkit API
  - ✓ Cloud Firestore API
  - ✓ Firebase Storage API
  - ✗ Google Maps API (disable if not needed)

Production API Key Restrictions:
- Application restrictions:
  - HTTP referrers: https://sergiohb21.github.io/BlancAlergic-APP/*
  - IP addresses: (leave empty for web apps)
- API restrictions: Same as development
- Additional restrictions:
  - Rate limiting: 100 requests per minute per IP
  - Geographic restrictions: Required countries only
```

#### 4.2 Enhanced Authentication Configuration
**New File: `src/firebase/auth-config.ts`**
```typescript
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export const authConfig = {
  // Password policy
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },

  // Session management
  sessionTimeout: 30 * 60 * 1000, // 30 minutes

  // Rate limiting
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes

  // Email verification
  requireEmailVerification: true,

  // Multi-factor authentication
  enableMFA: process.env.NODE_ENV === 'production',
};

export class AuthSecurityService {
  private auth = getAuth();

  async secureSignIn(email: string, password: string) {
    // Input validation
    if (!this.validateEmail(email)) {
      throw new Error('Email inválido');
    }

    if (!this.validatePassword(password)) {
      throw new Error('Contraseña no cumple con los requisitos de seguridad');
    }

    // Rate limiting check (implement with your logic)
    if (await this.isRateLimited(email)) {
      throw new Error('Demasiados intentos. Intente más tarde.');
    }

    try {
      return await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      await this.logSecurityEvent('login_attempt_failed', { email, error: error.message });
      throw error;
    }
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  private validatePassword(password: string): boolean {
    const policy = authConfig.passwordPolicy;
    return password.length >= policy.minLength &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /\d/.test(password) &&
           /[!@#$%^&*]/.test(password);
  }

  private async isRateLimited(email: string): Promise<boolean> {
    // Implement rate limiting logic
    // Could use Firebase Firestore or Redis for tracking attempts
    return false;
  }

  private async logSecurityEvent(event: string, data: any) {
    // Log security events for monitoring
    console.log('Security Event:', event, data);
    // In production, send to security monitoring service
  }
}
```

### Phase 5: Monitoring & Error Handling

#### 5.1 Security Monitoring
**New File: `src/firebase/security-monitoring.ts`**
```typescript
interface SecurityEvent {
  type: 'auth_event' | 'data_access' | 'suspicious_activity';
  userId?: string;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
  details: Record<string, any>;
}

export class SecurityMonitor {
  private events: SecurityEvent[] = [];

  logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>) {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
    };

    this.events.push(securityEvent);

    // Send to monitoring service in production
    if (import.meta.env.PROD) {
      this.sendToMonitoringService(securityEvent);
    }

    // Check for suspicious patterns
    this.analyzeForSuspiciousActivity(securityEvent);
  }

  private analyzeForSuspiciousActivity(event: SecurityEvent) {
    // Implement suspicious activity detection
    const recentEvents = this.events.filter(e =>
      e.timestamp > new Date(Date.now() - 60 * 60 * 1000) // Last hour
    );

    // Multiple failed login attempts
    const failedLogins = recentEvents.filter(e =>
      e.type === 'auth_event' && e.details.action === 'login_failed'
    );

    if (failedLogins.length > 5) {
      this.triggerSecurityAlert('multiple_failed_logins', failedLogins);
    }
  }

  private triggerSecurityAlert(alertType: string, events: SecurityEvent[]) {
    console.warn('Security Alert:', alertType, events);
    // In production, send alerts to security team
  }

  private sendToMonitoringService(event: SecurityEvent) {
    // Integration with your monitoring service
    // Firebase Functions, Sentry, etc.
  }
}
```

### Phase 6: Testing & Validation

#### 6.1 Security Testing
**New File: `src/__tests__/security.test.ts`**
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthSecurityService } from '../firebase/auth-config';
import { SecurityMonitor } from '../firebase/security-monitoring';

describe('Firebase Security', () => {
  let authSecurity: AuthSecurityService;
  let monitor: SecurityMonitor;

  beforeEach(() => {
    authSecurity = new AuthSecurityService();
    monitor = new SecurityMonitor();
  });

  describe('Email Validation', () => {
    it('should validate correct email formats', () => {
      expect(authSecurity['validateEmail']('user@example.com')).toBe(true);
      expect(authSecurity['validateEmail']('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(authSecurity['validateEmail']('invalid')).toBe(false);
      expect(authSecurity['validateEmail']('user@')).toBe(false);
      expect(authSecurity['validateEmail']('@domain.com')).toBe(false);
    });
  });

  describe('Password Validation', () => {
    it('should validate strong passwords', () => {
      expect(authSecurity['validatePassword']('StrongP@ssw0rd')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(authSecurity['validatePassword']('weak')).toBe(false);
      expect(authSecurity['validatePassword']('nouppercase1')).toBe(false);
      expect(authSecurity['validatePassword']('NOLOWERCASE1')).toBe(false);
      expect(authSecurity['validatePassword']('NoNumberOrSpecial')).toBe(false);
    });
  });

  describe('Security Event Monitoring', () => {
    it('should log security events', () => {
      const event = {
        type: 'auth_event' as const,
        userId: 'test-user',
        details: { action: 'login_success' }
      };

      monitor.logSecurityEvent(event);

      expect(monitor['events']).toHaveLength(1);
      expect(monitor['events'][0].type).toBe('auth_event');
    });
  });
});
```

## Implementation Timeline

### Week 1: Environment Setup
- [ ] Create separate Firebase projects (dev/prod)
- [ ] Set up GitHub Secrets for all environments
- [ ] Update environment configuration files
- [ ] Test environment switching

### Week 2: Security Rules Implementation
- [ ] Implement Firestore security rules
- [ ] Implement Storage security rules
- [ ] Deploy security rules via CI/CD
- [ ] Test rule enforcement

### Week 3: Enhanced Authentication
- [ ] Implement AuthSecurityService
- [ ] Add rate limiting and monitoring
- [ ] Update authentication flows
- [ ] Add security monitoring

### Week 4: Testing & Deployment
- [ ] Implement comprehensive security tests
- [ ] Test all security measures in staging
- [ ] Deploy to production
- [ ] Set up ongoing monitoring

## Security Checklist

### Pre-Deployment Checklist
- [ ] Separate Firebase projects created for dev/prod
- [ ] API key restrictions configured in Firebase console
- [ ] Security rules deployed and tested
- [ ] Environment variables configured in GitHub Secrets
- [ ] Security monitoring implemented
- [ ] Rate limiting configured
- [ ] Email verification enabled
- [ ] Password policies enforced
- [ ] Error handling implemented
- [ ] Logging and monitoring set up

### Post-Deployment Checklist
- [ ] Monitor for security events
- [ ] Review Firebase usage metrics
- [ ] Test authentication flows
- [ ] Verify data access controls
- [ ] Check for exposed credentials
- [ ] Monitor API key usage
- [ ] Review error rates
- [ ] Test disaster recovery procedures

## Required GitHub Secrets

```yaml
# Development Environment
FIREBASE_DEV_API_KEY: "dev-project-api-key"
FIREBASE_DEV_AUTH_DOMAIN: "blancalergic-app-dev.firebaseapp.com"
FIREBASE_DEV_PROJECT_ID: "blancalergic-app-dev"
FIREBASE_DEV_STORAGE_BUCKET: "blancalergic-app-dev.firebasestorage.app"
FIREBASE_DEV_MESSAGING_SENDER_ID: "dev-sender-id"
FIREBASE_DEV_APP_ID: "dev-app-id"
FIREBASE_DEV_MEASUREMENT_ID: "dev-measurement-id"

# Production Environment
FIREBASE_PROD_API_KEY: "prod-project-api-key"
FIREBASE_PROD_AUTH_DOMAIN: "blancalergic-app.firebaseapp.com"
FIREBASE_PROD_PROJECT_ID: "blancalergic-app"
FIREBASE_PROD_STORAGE_BUCKET: "blancalergic-app.firebasestorage.app"
FIREBASE_PROD_MESSAGING_SENDER_ID: "prod-sender-id"
FIREBASE_PROD_APP_ID: "prod-app-id"
FIREBASE_PROD_MEASUREMENT_ID: "prod-measurement-id"

# Additional Security
FIREBASE_TOKEN: "firebase-cli-token"
```

## Ongoing Security Maintenance

### Monthly Tasks
- [ ] Review Firebase usage metrics
- [ ] Audit security events
- [ ] Update API key restrictions if needed
- [ ] Rotate API keys quarterly
- [ ] Review and update security rules

### Quarterly Tasks
- [ ] Full security audit
- [ ] Penetration testing
- [ ] Update dependencies
- [ ] Review monitoring alerts
- [ ] Update documentation

## Emergency Response Plan

### If API Key is Compromised
1. Immediately restrict the compromised API key in Firebase console
2. Create a new API key with updated restrictions
3. Update GitHub Secrets
4. Redeploy application
5. Monitor for unusual activity

### If Security Breach Detected
1. Immediately restrict all access
2. Force password resets for all users
3. Enable enhanced monitoring
4. Review all security logs
5. Report incident to appropriate authorities

This comprehensive implementation plan ensures that your Firebase integration follows industry best practices for security while maintaining the functionality required for the BlancAlergic-APP.