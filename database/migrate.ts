/**
 * Tatito Financial Services — Node.js Migration Runner
 * Executes sequential PostgreSQL schema migrations tracking applied versions in schema_migrations.
 */

import { initPostgres, isPostgresConnected } from './db.ts';

async function run() {
  console.log('[Migration Runner] Checking PostgreSQL connection and applying migrations...');
  const connected = await initPostgres();
  if (connected) {
    console.log('[Migration Runner] All migrations applied successfully.');
    process.exit(0);
  } else {
    console.warn('[Migration Runner] PostgreSQL is not currently connected. No migrations applied to live DB.');
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('[Migration Runner Error]:', err);
  process.exit(1);
});
