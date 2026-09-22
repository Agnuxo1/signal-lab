import { CAPTURE_MODES, CAPTURE_STEPS, DETECTOR_PROFILES, ORIENTATIONS, currentCapturePlan } from '../core/domain.js';

const $ = (selector) => document.querySelector(selector);

export function renderProfileOptions(selectedId) {
  const select = $('#detector-profile');
  if (!select) return;
  select.innerHTML = Object.values(DETECTOR_PROFILES).map((profile) => `<option value="${profile.id}" ${profile.id === selectedId ? 'selected' : ''}>${profile.name} · ${profile.frequencyKHz} kHz</option>`).join('');
}

export function renderModeOptions(selectedId) {
  const select = $('#capture-mode');
  if (!select) return;
  select.innerHTML = Object.values(CAPTURE_MODES).map((mode) => `<option value="${mode.id}" ${mode.id === selectedId ? 'selected' : ''}>${mode.label}</option>`).join('');
}

export function renderPlan(state) {
  const session = state.session;
  const empty = $('#plan-empty');
  const panel = $('#plan-panel');
  if (!session) { empty?.classList.remove('hidden'); panel?.classList.add('hidden'); return; }
  empty?.classList.add('hidden'); panel?.classList.remove('hidden');
  const plan = currentCapturePlan(session);
  const percent = Math.min(100, Math.round((session.captures.length / plan.total) * 100));
  $('#session-target').textContent = session.target.name;
  $('#session-detector').textContent = session.detector.profile.name;
  $('#session-mode').textContent = session.mode === 'audio-cable' ? 'Cable' : 'Manos libres';
  $('#session-depth').textContent = `${session.depthCm} cm`;
  $('#session-progress').textContent = `${session.captures.length}/${plan.total}`;
  $('#progress-bar').style.width = `${percent}%`;
  $('#current-orientation').textContent = plan.orientation.label;
  $('#current-step').textContent = plan.step.label;
  $('#current-cue').textContent = plan.step.cue;
  $('#duration-label').textContent = `${plan.step.seconds} s`;
  $('#step-counter').textContent = `Toma ${session.captures.length + 1} de ${plan.total}`;
  $('#capture-start').disabled = state.isRecording || session.status === 'complete';
  $('#capture-start').textContent = state.isRecording ? 'Grabando…' : session.status === 'complete' ? 'Ciclo completo' : 'Iniciar toma';
  $('#capture-cancel').disabled = !state.isRecording;
  $('#timer').textContent = state.isRecording ? `${state.elapsedSec.toFixed(1)} s` : '0.0 s';
  $('#audio-status').textContent = state.error || (state.isRecording ? 'Capturando audio local…' : 'Listo para la siguiente toma.');
  $('#audio-status').classList.toggle('error', Boolean(state.error));
  const list = $('#capture-list');
  list.innerHTML = session.captures.length ? session.captures.slice().reverse().map((capture) => `<li><span>${capture.index + 1}. ${labelFor(capture.orientation, ORIENTATIONS)} · ${labelFor(capture.step, CAPTURE_STEPS)}</span><small>${capture.durationActualSec.toFixed(1)} s · ${capture.quality}</small></li>`).join('') : '<li class="muted">Aún no hay tomas guardadas.</li>';
}

function labelFor(id, collection) { return collection.find((entry) => entry.id === id)?.short || collection.find((entry) => entry.id === id)?.label || id; }

export function renderSessions(sessions) {
  const list = $('#saved-sessions');
  if (!list) return;
  list.innerHTML = sessions.length ? sessions.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6).map((session) => `<li><div><strong>${session.target.name}</strong><small>${session.detector.profile.name} · ${session.captures.length} tomas</small></div><span>${new Date(session.createdAt).toLocaleDateString('es-ES')}</span></li>`).join('') : '<li class="muted">Las sesiones guardadas aparecerán aquí.</li>';
}

export function showToast(message, tone = 'info') { const toast = $('#toast'); toast.textContent = message; toast.dataset.tone = tone; toast.classList.add('show'); window.clearTimeout(showToast.timer); showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 3600); }
