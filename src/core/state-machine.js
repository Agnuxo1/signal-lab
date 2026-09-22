import { addCapture, advancePlan, createSession } from './domain.js';

export const initialState = Object.freeze({ session: null, isRecording: false, elapsedSec: 0, error: null, lastEvent: null });

export function reduce(state, event) {
  try {
    switch (event.type) {
      case 'SESSION_CREATED': return { ...state, session: createSession(event.input), lastEvent: event.type, error: null };
      case 'RECORDING_STARTED': return { ...state, isRecording: true, elapsedSec: 0, lastEvent: event.type, error: null };
      case 'TICK': return { ...state, elapsedSec: event.elapsedSec };
      case 'RECORDING_SAVED': return { ...state, session: advancePlan(addCapture(state.session, event.capture)), isRecording: false, elapsedSec: 0, lastEvent: event.type };
      case 'RECORDING_CANCELLED': return { ...state, isRecording: false, elapsedSec: 0, lastEvent: event.type };
      case 'SESSION_RESET': return { ...initialState, lastEvent: event.type };
      default: return { ...state, error: `Evento no soportado: ${event.type}` };
    }
  } catch (error) {
    return { ...state, error: error.message, lastEvent: event.type };
  }
}
