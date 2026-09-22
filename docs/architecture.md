# Arquitectura avanzada · v2

## Objetivo

Separar la observación de la interpretación. Una sesión representa una secuencia de tomas de un objetivo bajo un detector, una profundidad y un modo de captura. Cada toma es una observación con audio y contexto verificable.

## Flujo de datos

```text
Formulario de sesión
        ↓
  core/domain.js  ── crea el plan 3×4 y valida invariantes
        ↓
  state-machine   ── transiciones explícitas de UI
        ↓
  AudioCaptureAdapter ── MediaRecorder + entrada seleccionada
        ↓                         ↓
  Blob en IndexedDB          registro de manifest
        └────────────── exportación explícita ──────────────┘
```

## Principios cognitivos

### Observación antes de inferencia

La aplicación no etiqueta el metal detectado por su cuenta. Guarda el nombre del objetivo declarado por el operador y marca la calidad de la toma como `unreviewed` hasta que una persona la revise.

### Memoria con procedencia

El `schemaVersion`, el perfil del detector, el modo, la profundidad, la orientación, la maniobra, el tipo MIME y la duración real acompañan a cada captura. El blob puede vivir en almacenamiento local, en un ZIP exportado o en un pipeline externo, pero el identificador de la toma no cambia.

### Separación de adaptadores

El dominio no conoce `navigator`, `MediaRecorder` ni IndexedDB. Esto permite probar la lógica con Node y cambiar el origen de señal en el futuro (archivo WAV, interfaz USB, Web Serial o una app móvil) sin reescribir el protocolo.

### Estado explícito

Las transiciones principales son `SESSION_CREATED`, `RECORDING_STARTED`, `TICK`, `RECORDING_SAVED`, `RECORDING_CANCELLED` y `SESSION_RESET`. Un evento desconocido no muta el plan; devuelve un error visible.

## Decisiones y límites

- IndexedDB es la memoria primaria de la primera versión porque evita servidor y permite blobs binarios.
- `MediaRecorder` produce WebM/Opus cuando el navegador lo soporta; el tipo MIME queda declarado para no fingir que el audio es WAV.
- La captura desactiva cancelación de eco, supresión de ruido y control automático de ganancia cuando el navegador lo permite; aun así, el hardware y el sistema operativo pueden aplicar su propia ruta.
- El procesamiento de características y el clasificador quedan fuera del runtime de captura hasta disponer de un conjunto de datos revisado.
