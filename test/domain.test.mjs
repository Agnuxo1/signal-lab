import test from 'node:test';
import assert from 'node:assert/strict';
import { CAPTURE_STEPS, ORIENTATIONS, addCapture, createSession, currentCapturePlan, slugify, validateSession } from '../src/core/domain.js';

test('slugify produce identificadores de dataset estables', () => assert.equal(slugify('Anillo de plata / 925'), 'anillo-de-plata-925'));
test('un ciclo comienza con 12 tomas y la primera orientación', () => { const session = createSession({ target: '1 euro', detectorId: 'tx-850', mode: 'audio-cable', depthCm: 5 }); const plan = currentCapturePlan(session); assert.equal(plan.total, ORIENTATIONS.length * CAPTURE_STEPS.length); assert.equal(plan.orientation.id, 'flat'); assert.equal(plan.step.id, 'cross-sweep'); });
test('las capturas conservan metadatos y validan el manifest', () => { let session = createSession({ target: '5 céntimos', depthCm: 5 }); session = addCapture(session, { blobKey: 'session/0', durationActualSec: 10, mimeType: 'audio/webm' }); const result = validateSession(session); assert.equal(result.valid, true); assert.equal(session.captures[0].step, 'cross-sweep'); });
