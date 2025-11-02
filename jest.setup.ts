import '@testing-library/jest-dom';

import '@testing-library/jest-dom';

// Use actual DATABASE_URL for integration tests
// (will fall back to .env.local if not set)
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://garritwulf_user:garritwulf_secure_pass_2025@localhost:5432/garritwulf_db';
}

// Mock Stripe keys for tests (unless running integration tests with real Stripe)
if (!process.env.STRIPE_SECRET_KEY) {
  process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
}
if (!process.env.STRIPE_PUBLISHABLE_KEY) {
  process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_mock';
}
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock';
}
if (!process.env.SETTINGS_ENCRYPTION_KEY) {
  process.env.SETTINGS_ENCRYPTION_KEY = '5db77b08dc0c7e54c52dd89024fc687fee0cbb2347c0730a3eafdd18622e4951';
}
