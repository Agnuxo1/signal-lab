export const APP_VERSION = '2.0.0';

export const DETECTOR_PROFILES = Object.freeze({
  tx850: {
    id: 'tx-850',
    name: 'TX-850',
    family: 'Fisher/First Texas style VLF',
    frequencyKHz: 19,
    connector: 'GX16-5 roscado',
    notes: 'Referencia de laboratorio para captura por cable y manos libres.'
  },
  gc1065: {
    id: 'gc-1065-generico',
    name: 'GC-1065 Genérico',
    family: 'GC-1065 OEM analógico',
    frequencyKHz: 6.6,
    connector: '5 pines roscado (verificar lote)',
    notes: 'Respuesta de tono sencillo; documentar DISC y sensibilidad.'
  }
});

export const CAPTURE_MODES = Object.freeze({
  cable: { id: 'audio-cable', label: 'Cable de audio', description: 'Entrada de línea/micrófono con captura directa.' },
  handsFree: { id: 'hands-free', label: 'Manos libres', description: 'Micrófono del teléfono u ordenador; menos sensible.' }
});

export const CAPTURE_STEPS = Object.freeze([
  { id: 'cross-sweep', short: 'Adelante / atrás', label: 'Pasa el detector adelante y atrás sobre el objetivo.', seconds: 10, cue: 'Barrido lento, centrado y paralelo al suelo.' },
  { id: 'vertical-pump', short: 'Arriba / abajo', label: 'Desde el centro, sube hasta perder la señal y baja casi hasta el suelo.', seconds: 10, cue: 'Mantén el objetivo alineado con el centro de la bobina.' },
  { id: 'circle', short: 'Círculos', label: 'Haz círculos alrededor del objetivo lo más cerca del suelo posible.', seconds: 10, cue: 'Completa varias orientaciones sin golpear el suelo.' },
  { id: 'zigzag', short: 'Zigzag 50 cm', label: 'Aléjate 50 cm y haz una pasada lenta en zigzag sobre el objetivo hasta dejarlo atrás 50 cm.', seconds: 15, cue: 'Un recorrido continuo y estable, sin pausas.' }
]);

export const ORIENTATIONS = Object.freeze([
  { id: 'flat', label: 'Tumbada' },
  { id: 'edge', label: 'De canto' },
  { id: 'tilted', label: 'Semi-tumbada / semi-de canto' }
]);

export const DEPTHS_CM = Object.freeze([5, 10, 15, 20, 25]);

export function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'objetivo';
}

export function createSession(input = {}) {
  const target = String(input.target || '').trim();
  if (!target) throw new Error('El objetivo necesita un nombre.');
  const detectorId = input.detectorId || DETECTOR_PROFILES.tx850.id;
  const mode = input.mode || CAPTURE_MODES.cable.id;
  const depthCm = Number(input.depthCm || 5);
  if (!Object.values(DETECTOR_PROFILES).some((p) => p.id === detectorId)) throw new Error('Perfil de detector no válido.');
  if (!Object.values(CAPTURE_MODES).some((p) => p.id === mode)) throw new Error('Modo de captura no válido.');
  if (!Number.isFinite(depthCm) || depthCm <= 0) throw new Error('La profundidad debe ser positiva.');
  return {
    id: `sl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    schemaVersion: APP_VERSION,
    createdAt: new Date().toISOString(),
    target: { name: target, slug: slugify(target) },
    detector: { id: detectorId, profile: DETECTOR_PROFILES[Object.keys(DETECTOR_PROFILES).find((key) => DETECTOR_PROFILES[key].id === detectorId)] },
    mode,
    depthCm,
    orientationIndex: 0,
    stepIndex: 0,
    captures: [],
    notes: String(input.notes || '').trim(),
    status: 'draft'
  };
}

export function currentCapturePlan(session) {
  const orientation = ORIENTATIONS[session.orientationIndex] || ORIENTATIONS[0];
  const step = CAPTURE_STEPS[session.stepIndex] || CAPTURE_STEPS[0];
  return { orientation, step, total: ORIENTATIONS.length * CAPTURE_STEPS.length, completed: session.captures.length };
}

export function addCapture(session, capture) {
  const plan = currentCapturePlan(session);
  const record = {
    id: `${session.id}-${plan.orientation.id}-${plan.step.id}-${session.captures.length + 1}`,
    index: session.captures.length,
    createdAt: new Date().toISOString(),
    target: session.target,
    detectorId: session.detector.id,
    mode: session.mode,
    depthCm: session.depthCm,
    orientation: plan.orientation.id,
    step: plan.step.id,
    durationExpectedSec: plan.step.seconds,
    durationActualSec: Number(capture.durationActualSec || plan.step.seconds),
    mimeType: capture.mimeType || 'audio/webm',
    blobKey: capture.blobKey || null,
    sampleRate: capture.sampleRate || null,
    inputDeviceLabel: capture.inputDeviceLabel || null,
    source: capture.source || 'browser-mediarecorder',
    quality: capture.quality || 'unreviewed',
    checksum: capture.checksum || null
  };
  return { ...session, captures: [...session.captures, record], status: 'recording' };
}

export function advancePlan(session) {
  const next = { ...session };
  if (next.stepIndex < CAPTURE_STEPS.length - 1) next.stepIndex += 1;
  else if (next.orientationIndex < ORIENTATIONS.length - 1) { next.orientationIndex += 1; next.stepIndex = 0; }
  else next.status = 'complete';
  return next;
}

export function validateSession(session) {
  const issues = [];
  if (!session?.target?.name) issues.push('Falta el nombre del objetivo.');
  if (!session?.detector?.id) issues.push('Falta el perfil del detector.');
  if (!Number.isFinite(Number(session?.depthCm))) issues.push('Falta una profundidad válida.');
  if (!Array.isArray(session?.captures)) issues.push('La colección de grabaciones no es válida.');
  for (const [index, capture] of (session?.captures || []).entries()) {
    for (const field of ['orientation', 'step', 'durationActualSec', 'mimeType']) if (capture[field] === undefined || capture[field] === null || capture[field] === '') issues.push(`Grabación ${index + 1}: falta ${field}.`);
  }
  return { valid: issues.length === 0, issues };
}
