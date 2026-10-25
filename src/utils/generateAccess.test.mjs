import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildGenerateDecision,
  normalizeAccessPayload,
  shouldBlockGeneration,
  shouldWarnRemaining
} from './generateAccess.js';

test('guest is blocked when free quota is exhausted', () => {
  assert.equal(
    shouldBlockGeneration({ licensed: false, generateRemaining: 0 }),
    true
  );
});

test('guest is warned when only one free generation remains', () => {
  assert.equal(
    shouldWarnRemaining({ licensed: false, generateRemaining: 1 }),
    true
  );
});

test('buildGenerateDecision returns blocked result when quota is gone', () => {
  const result = buildGenerateDecision({ licensed: false, generateRemaining: 0 });

  assert.deepEqual(result, {
    allowed: false,
    reason: 'FREE_LIMIT_REACHED'
  });
});

test('normalizeAccessPayload prefers nested access payload after commit', () => {
  const result = normalizeAccessPayload({
    ok: true,
    committed: true,
    access: {
      licensed: false,
      generateRemaining: 19
    }
  });

  assert.deepEqual(result, {
    licensed: false,
    generateRemaining: 19
  });
});
