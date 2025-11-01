-- ============================================================================
-- Schema Compliance Verification Script
-- ============================================================================
-- This script verifies that the database schema matches the expected structure
-- for the analytics functions to work correctly.
--
-- Run this BEFORE applying the migration to identify any schema mismatches.
-- ============================================================================

\pset border 2
\pset format wrapped

\echo '============================================================================'
\echo 'Schema Compliance Verification'
\echo '============================================================================'
\echo ''

-- ============================================================================
-- Check 1: learning_sessions table
-- ============================================================================
\echo '============================================================================'
\echo 'Check 1: learning_sessions table'
\echo '============================================================================'
\echo 'Expected columns: id, user_id, word_id, session_date, session_type'
\echo 'NOT expected: vocabulary_id'
\echo ''

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'learning_sessions'
ORDER BY ordinal_position;

\echo ''
\echo 'Checking for old column name (vocabulary_id):'
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'learning_sessions' 
            AND column_name = 'vocabulary_id'
        ) THEN '⚠️  WARNING: Old column "vocabulary_id" still exists!'
        ELSE '✓ OK: No "vocabulary_id" column found (correct)'
    END AS status;

\echo ''
\echo 'Checking for new column name (word_id):'
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'learning_sessions' 
            AND column_name = 'word_id'
        ) THEN '✓ OK: Column "word_id" exists (correct)'
        ELSE '⚠️  WARNING: Expected column "word_id" not found!'
    END AS status;

\echo ''

-- ============================================================================
-- Check 2: user_mistakes table
-- ============================================================================
\echo '============================================================================'
\echo 'Check 2: user_mistakes table'
\echo '============================================================================'
\echo 'Expected columns: id, user_id, word_id, created_at'
\echo 'NOT expected: vocabulary_id, mistake_date'
\echo ''

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'user_mistakes'
ORDER BY ordinal_position;

\echo ''
\echo 'Checking for old column names:'
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_mistakes' 
            AND column_name = 'vocabulary_id'
        ) THEN '⚠️  WARNING: Old column "vocabulary_id" still exists!'
        ELSE '✓ OK: No "vocabulary_id" column found (correct)'
    END AS vocabulary_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_mistakes' 
            AND column_name = 'mistake_date'
        ) THEN '⚠️  WARNING: Old column "mistake_date" still exists!'
        ELSE '✓ OK: No "mistake_date" column found (correct)'
    END AS date_status;

\echo ''
\echo 'Checking for new column names:'
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_mistakes' 
            AND column_name = 'word_id'
        ) THEN '✓ OK: Column "word_id" exists (correct)'
        ELSE '⚠️  WARNING: Expected column "word_id" not found!'
    END AS word_id_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_mistakes' 
            AND column_name = 'created_at'
        ) THEN '✓ OK: Column "created_at" exists (correct)'
        ELSE '⚠️  WARNING: Expected column "created_at" not found!'
    END AS created_at_status;

\echo ''

-- ============================================================================
-- Check 3: vocabulary table
-- ============================================================================
\echo '============================================================================'
\echo 'Check 3: vocabulary table'
\echo '============================================================================'
\echo 'Expected columns: id, word, translation'
\echo 'NOT expected: german_word, english_translation, difficulty_level'
\echo ''

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'vocabulary'
ORDER BY ordinal_position;

\echo ''
\echo 'Checking for old column names:'
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'vocabulary' 
            AND column_name = 'german_word'
        ) THEN '⚠️  WARNING: Old column "german_word" still exists!'
        ELSE '✓ OK: No "german_word" column found (correct)'
    END AS german_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'vocabulary' 
            AND column_name = 'english_translation'
        ) THEN '⚠️  WARNING: Old column "english_translation" still exists!'
        ELSE '✓ OK: No "english_translation" column found (correct)'
    END AS translation_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'vocabulary' 
            AND column_name = 'difficulty_level'
        ) THEN '⚠️  WARNING: Column "difficulty_level" should NOT be in vocabulary table!'
        ELSE '✓ OK: No "difficulty_level" in vocabulary (correct)'
    END AS difficulty_status;

\echo ''
\echo 'Checking for new column names:'
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'vocabulary' 
            AND column_name = 'word'
        ) THEN '✓ OK: Column "word" exists (correct)'
        ELSE '⚠️  WARNING: Expected column "word" not found!'
    END AS word_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'vocabulary' 
            AND column_name = 'translation'
        ) THEN '✓ OK: Column "translation" exists (correct)'
        ELSE '⚠️  WARNING: Expected column "translation" not found!'
    END AS translation_status;

\echo ''

-- ============================================================================
-- Check 4: user_progress table
-- ============================================================================
\echo '============================================================================'
\echo 'Check 4: user_progress table'
\echo '============================================================================'
\echo 'Expected columns: id, user_id, word_id (or vocabulary_id), difficulty_level'
\echo 'difficulty_level should be HERE (not in vocabulary table)'
\echo ''

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'user_progress'
ORDER BY ordinal_position;

\echo ''
\echo 'Checking for difficulty_level column:'
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_progress' 
            AND column_name = 'difficulty_level'
        ) THEN '✓ OK: Column "difficulty_level" exists in user_progress (correct)'
        ELSE '⚠️  WARNING: Expected "difficulty_level" not found in user_progress!'
    END AS status;

\echo ''

-- ============================================================================
-- Check 5: users table
-- ============================================================================
\echo '============================================================================'
\echo 'Check 5: users table'
\echo '============================================================================'
\echo 'Expected columns: id, name, phone_number'
\echo ''

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'users'
ORDER BY ordinal_position;

\echo ''

-- ============================================================================
-- Check 6: Foreign Key Relationships
-- ============================================================================
\echo '============================================================================'
\echo 'Check 6: Foreign Key Relationships'
\echo '============================================================================'

\echo 'All foreign keys in the database:'
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND tc.table_name IN ('learning_sessions', 'user_mistakes', 'user_progress')
ORDER BY tc.table_name, kcu.column_name;

\echo ''

-- ============================================================================
-- Check 7: Sample Data Validation
-- ============================================================================
\echo '============================================================================'
\echo 'Check 7: Sample Data Validation'
\echo '============================================================================'

\echo 'Table row counts:'
SELECT 
    'users' AS table_name, COUNT(*) AS row_count FROM users
UNION ALL
SELECT 
    'vocabulary', COUNT(*) FROM vocabulary
UNION ALL
SELECT 
    'learning_sessions', COUNT(*) FROM learning_sessions
UNION ALL
SELECT 
    'user_mistakes', COUNT(*) FROM user_mistakes
UNION ALL
SELECT 
    'user_progress', COUNT(*) FROM user_progress;

\echo ''

-- ============================================================================
-- Summary
-- ============================================================================
\echo '============================================================================'
\echo 'SUMMARY'
\echo '============================================================================'
\echo ''
\echo 'Required schema for analytics functions:'
\echo '  1. learning_sessions.word_id (not vocabulary_id)'
\echo '  2. user_mistakes.word_id (not vocabulary_id)'
\echo '  3. user_mistakes.created_at (not mistake_date)'
\echo '  4. vocabulary.word and vocabulary.translation'
\echo '  5. user_progress.difficulty_level (not in vocabulary)'
\echo ''
\echo 'If any warnings appear above, the schema needs to be updated before'
\echo 'running the analytics function migration.'
\echo '============================================================================'
