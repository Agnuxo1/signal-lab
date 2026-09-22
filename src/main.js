import { CAPTURE_MODES, DETECTOR_PROFILES, createSession, currentCapturePlan, validateSession } from './core/domain.js';
import { initialState, reduce } from './core/state-machine.js';
import { AudioCaptureAdapter, listAudioInputs } from './adapters/audio-capture.js';
import { downloadBlob, downloadJson, getBlob, listSessions, saveBlob, saveSession } from './adapters/persistence.js';
import { renderModeOptions, renderPlan, renderProfileOptions, renderSessions, showToast } from './ui/render.js';

let state = initialState;
let audioInputs = [];
const recorder = new AudioCaptureAdapter({ onTick: (elapsedSec) => dispatch({ type: 'TICK', elapsedSec }), onState: () => render() });

function dispatch(event) { state = reduce(state, event); render(); }

function render() { renderPlan(state); }

async function refreshInputs() {
  try { audioInputs = await listAudioInputs(); const select = document.querySelector('#audio-input'); select.innerHTML = '<option value="">Predeterminada del navegador</option>' + audioInputs.map((input) => `<option value="${input.id}">${input.label}</option>`).join(''); } catch { showToast('No se pudo consultar las entradas de audio.', 'warning'); }
}

function createFromForm() {
  const input = { target: document.querySelector('#target-name').value, detectorId: document.querySelector('#detector-profile').value, mode: document.querySelector('#capture-mode').value, depthCm: Number(document.querySelector('#depth-cm').value), notes: document.querySelector('#session-notes').value };
  dispatch({ type: 'SESSION_CREATED', input });
  if (state.error) showToast(state.error, 'error'); else { showToast('Sesión preparada. La primera toma ya está definida.', 'success'); document.querySelector('#target-name').value = ''; }
}

async function startRecording() {
  if (!state.session || state.isRecording || state.session.status === 'complete') return;
  dispatch({ type: 'RECORDING_STARTED' });
  try {
    const plan = currentCapturePlan(state.session);
    const raw = await recorder.start({ durationSec: plan.step.seconds, preferredDeviceId: document.querySelector('#audio-input').value || undefined });
    const blobKey = `${state.session.id}/${state.session.captures.length}`;
    await saveBlob(blobKey, raw.blob);
    dispatch({ type: 'RECORDING_SAVED', capture: { ...raw, blobKey } });
    await saveSession(state.session);
    showToast(state.session.status === 'complete' ? 'Ciclo completo guardado.' : 'Toma guardada localmente.', 'success');
  } catch (error) {
    recorder.cancel();
    dispatch({ type: 'RECORDING_CANCELLED' });
    showToast(error.message || 'No se pudo iniciar la captura.', 'error');
  }
}

async function exportSession() {
  if (!state.session) return showToast('Crea o carga una sesión antes de exportar.', 'warning');
  const validation = validateSession(state.session);
  if (!validation.valid) return showToast(validation.issues[0], 'error');
  downloadJson(`${state.session.target.slug}-${state.session.detector.id}-manifest.json`, state.session);
  showToast('Manifest JSON exportado. Los audios quedan disponibles en el almacenamiento local.', 'success');
}

async function exportLastAudio() {
  const last = state.session?.captures?.at(-1);
  if (!last?.blobKey) return showToast('Todavía no hay una toma con audio.', 'warning');
  const blob = await getBlob(last.blobKey);
  if (blob) downloadBlob(`${state.session.target.slug}-${last.orientation}-${last.step}.webm`, blob);
}

function bind() {
  renderProfileOptions(DETECTOR_PROFILES.tx850.id); renderModeOptions(CAPTURE_MODES.cable.id); render();
  document.querySelector('#session-form').addEventListener('submit', (event) => { event.preventDefault(); createFromForm(); });
  document.querySelector('#capture-start').addEventListener('click', startRecording);
  document.querySelector('#capture-cancel').addEventListener('click', () => { recorder.cancel(); dispatch({ type: 'RECORDING_CANCELLED' }); showToast('Grabación cancelada.', 'warning'); });
  document.querySelector('#export-manifest').addEventListener('click', exportSession);
  document.querySelector('#export-audio').addEventListener('click', exportLastAudio);
  document.querySelector('#refresh-inputs').addEventListener('click', refreshInputs);
  document.querySelector('#new-session').addEventListener('click', () => { dispatch({ type: 'SESSION_RESET' }); showToast('Sesión reiniciada.', 'info'); });
  refreshInputs();
  listSessions().then(renderSessions).catch(() => renderSessions([]));
}

bind();
