#!/usr/bin/env node

/**
 * Check Environment Variables
 * 
 * Walidacja zmiennych środowiskowych - fail-fast bez Zod.
 * Uruchom: node scripts/check-env.js
 * 
 * @example
 * pnpm check:env
 * node scripts/check-env.js
 */

// =============================================================================
// Konfiguracja - lista wymaganych zmiennych
// =============================================================================

/** Zmienne wymagane dla Web */
const WEB_REQUIRED = ['DATABASE_URL'];

/** Zmienne wymagane dla Worker */
const WORKER_REQUIRED = ['DATABASE_URL', 'GENERATION_ENABLED'];

/** Wszystkie znane zmienne (do sprawdzenia) */
const KNOWN_VARS = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'R2_ACCOUNT_ID',
  'R2_PUBLIC_URL',
  'OPENAI_API_KEY',
  'GENERATION_ENABLED',
  'MAX_PAGES_PER_DAY',
  'MAX_JOB_RETRIES',
  'MAX_CONCURRENT_WORKERS',
  'MAX_ASSET_SIZE_BYTES',
  'MAX_QUEUE_SIZE',
  'JOB_TIMEOUT_SECONDS',
  'BATCH_SIZE',
  'DAILY_BUDGET_USD',
  'API_RATE_LIMIT',
  'JWT_SECRET',
  'LOG_LEVEL',
];

// =============================================================================
// Walidacja
// =============================================================================

/**
 * Sprawdza czy zmienna jest ustawiona (niepusta)
 */
function isSet(value) {
  return value !== undefined && value !== null && value.trim() !== '';
}

/**
 * Sprawdza czy wszystkie wymagane zmienne są ustawione
 */
function validateEnv(required = WEB_REQUIRED) {
  const missing = [];
  const present = [];
  
  for (const key of required) {
    const value = process.env[key];
    if (!isSet(value)) {
      missing.push(key);
    } else {
      present.push(key);
    }
  }
  
  // Ignoruj zmienne systemowe Windows i Node.js
  const SYSTEM_PREFIXES = [
    'npm_', 'NODE_', 'TERM_', 'SHELL_', 'USER_', 'HOME_', 'PATH_',
    'LANG', 'LC_', 'TZ', 'GIT_', 'VSCODE_', 'CLINE_', 'COLORTERM',
    // Windows system variables
    'WINDIR', 'SYSTEMROOT', 'TEMP', 'TMP', 'USERPROFILE', 'HOMEPATH',
    'PROGRAMFILES', 'PROGRAMDATA', 'APPDATA', 'LOCALAPPDATA', 'COMPUTERNAME',
    'USERNAME', 'USERDOMAIN', 'LOGONSERVER', 'SESSIONNAME', 'PROCESSOR_',
    'NUMBER_OF_PROCESSORS', 'OS', 'PATHEXT', 'COMSPEC', 'SYSTEMDRIVE',
    'CommonProgramFiles', 'ProgramFiles', 'OneDrive', 'ERLANG_HOME', 'NVM_',
    'D7VISION_', 'ASL_LOG', 'CHROME_', 'FPS_', 'ZES_', 'XAMPP', 'PHP_',
    'FLUTTERFIRE_', 'CRAKPAD_', 'DOCKER_', 'CI_'
  ];
  
  // Sprawdź też nieznane zmienne (potencjalne literówki)
  const unknown = [];
  for (const key of Object.keys(process.env)) {
    if (KNOWN_VARS.includes(key)) continue;
    if (key.startsWith('npm_') || key.startsWith('NODE_')) continue;
    
    // Pomiń zmienne systemowe
    const isSystemVar = SYSTEM_PREFIXES.some(prefix => 
      key.startsWith(prefix) || key.includes('PROFILE') || key.includes('PATH')
    );
    if (!isSystemVar) {
      unknown.push(key);
    }
  }
  
  return { missing, present, unknown };
}

/**
 * Wyświetla wynik weryfikacji
 */
function printResult(result) {
  console.log('\n========================================');
  console.log('🔍 Environment Variables Check');
  console.log('========================================\n');
  
  if (result.missing.length === 0 && result.unknown.length === 0) {
    console.log('✅ All required environment variables are set!\n');
    console.log('   Present variables:', result.present.join(', '));
    console.log('\n');
    return true;
  }
  
  if (result.missing.length > 0) {
    console.log('❌ MISSING REQUIRED VARIABLES:');
    console.log('   - ' + result.missing.join('\n   - '));
    console.log('\n');
  }
  
  if (result.unknown.length > 0) {
    console.log('⚠️  UNKNOWN VARIABLES (possible typos):');
    console.log('   - ' + result.unknown.join('\n   - '));
    console.log('\n');
  }
  
  console.log('📋 Available known variables:');
  console.log('   ' + KNOWN_VARS.join(', '));
  console.log('\n');
  
  console.log('📖 See docs/SETUP_PORTALS.md for instructions.');
  console.log('📋 Copy .env.example to .env and fill in the values.\n');
  
  return false;
}

// =============================================================================
// Main
// =============================================================================

function main() {
  // Pobierz argumenty
  const args = process.argv.slice(2);
  const type = args[0] || 'web'; // web, worker, or all
  
  let required;
  switch (type) {
    case 'worker':
      required = WORKER_REQUIRED;
      console.log('🔧 Checking WORKER environment...\n');
      break;
    case 'all':
      required = [...new Set([...WEB_REQUIRED, ...WORKER_REQUIRED])];
      console.log('🔧 Checking ALL environment...\n');
      break;
    case 'web':
    default:
      required = WEB_REQUIRED;
      console.log('🔧 Checking WEB environment...\n');
      break;
  }
  
  const result = validateEnv(required);
  const success = printResult(result);
  
  if (success) {
    console.log('✅ Environment is valid!\n');
    process.exit(0);
  } else {
    console.log('❌ Environment validation FAILED!\n');
    process.exit(1);
  }
}

// Uruchom
main();
