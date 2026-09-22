# Contribuir a Signal Lab

## Principios

1. Preserva los datos y decisiones históricas: si cambia el protocolo, crea una versión nueva.
2. Mantén el dominio independiente del navegador; los adaptadores son la frontera para MediaRecorder, IndexedDB y futuros dispositivos.
3. No añadas un campo de manifest sin documentarlo en `docs/dataset-spec.md`.
4. Explica las limitaciones de medición y no conviertas una correlación en una identificación segura.

## Flujo local

```bash
npm test
npm run check
npm start
```

Las pruebas actuales se ejecutan sin acceso al micrófono y cubren el protocolo, la creación de sesiones y la validación del manifest. Las pruebas manuales del navegador deben comprobar permiso, selección de entrada, cancelación y exportación.

## Pull requests

Incluye objetivo, cambios de contrato, verificación ejecutada y cualquier riesgo de compatibilidad con sesiones guardadas. Las imágenes del README deben ser deliberadas: evita añadir recursos pesados sin explicar su propósito.
