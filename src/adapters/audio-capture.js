export class AudioCaptureAdapter {
  constructor({ onTick = () => {}, onState = () => {} } = {}) {
    this.onTick = onTick;
    this.onState = onState;
    this.stream = null;
    this.recorder = null;
    this.chunks = [];
    this.startedAt = 0;
    this.timer = null;
    this.inputDeviceLabel = null;
  }

  async start({ durationSec, preferredDeviceId } = {}) {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) throw new Error('Este navegador no ofrece captura de audio compatible.');
    if (this.recorder) throw new Error('Ya hay una grabación activa.');
    const constraints = { audio: preferredDeviceId ? { deviceId: { exact: preferredDeviceId }, echoCancellation: false, noiseSuppression: false, autoGainControl: false } : { echoCancellation: false, noiseSuppression: false, autoGainControl: false } };
    this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    this.inputDeviceLabel = this.stream.getAudioTracks()[0]?.label || null;
    const inputDeviceLabel = this.inputDeviceLabel;
    const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'].find((type) => MediaRecorder.isTypeSupported(type)) || '';
    this.recorder = new MediaRecorder(this.stream, mimeType ? { mimeType } : undefined);
    this.chunks = [];
    this.startedAt = performance.now();
    this.onState('recording');
    this.recorder.ondataavailable = (event) => { if (event.data.size) this.chunks.push(event.data); };
    const result = new Promise((resolve, reject) => {
      this.recorder.onerror = () => reject(this.recorder.error || new Error('Fallo de MediaRecorder.'));
      this.recorder.onstop = () => {
        const durationActualSec = Math.max(0, (performance.now() - this.startedAt) / 1000);
        const blob = new Blob(this.chunks, { type: mimeType || 'audio/webm' });
        resolve({ blob, mimeType: blob.type, durationActualSec, inputDeviceLabel, source: 'browser-mediarecorder' });
      };
    });
    this.recorder.start(250);
    this.timer = window.setInterval(() => {
      const elapsedSec = (performance.now() - this.startedAt) / 1000;
      this.onTick(elapsedSec);
      if (elapsedSec >= durationSec) this.stop();
    }, 100);
    return result;
  }

  stop() {
    if (!this.recorder) return;
    window.clearInterval(this.timer);
    this.timer = null;
    this.recorder.stop();
    for (const track of this.stream?.getTracks?.() || []) track.stop();
    this.stream = null;
    this.recorder = null;
    this.inputDeviceLabel = null;
    this.onState('idle');
  }

  cancel() { this.stop(); this.chunks = []; }
}

export async function listAudioInputs() {
  if (!navigator.mediaDevices?.enumerateDevices) return [];
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((device) => device.kind === 'audioinput').map((device) => ({ id: device.deviceId, label: device.label || 'Entrada de audio' }));
}
