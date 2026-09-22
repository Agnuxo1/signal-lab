# Contrato de datos · `signal-lab/session@2`

## Identidad de sesión

Una sesión contiene:

| Campo | Tipo | Obligatorio | Significado |
| --- | --- | --- | --- |
| `id` | string | sí | identificador local estable |
| `schemaVersion` | string | sí | versión del contrato |
| `createdAt` | ISO-8601 | sí | instante de creación |
| `target.name` | string | sí | nombre humano declarado por el operador |
| `target.slug` | string | sí | nombre seguro para exportaciones |
| `detector.id` | string | sí | perfil de detector |
| `mode` | enum | sí | `audio-cable` o `hands-free` |
| `depthCm` | number | sí | profundidad de referencia |
| `captures` | array | sí | observaciones en orden de protocolo |

## Registro de captura

Cada elemento de `captures` incluye `orientation`, `step`, `durationExpectedSec`, `durationActualSec`, `mimeType`, `blobKey`, `source` y `quality`. Los valores de `orientation` son `flat`, `edge` y `tilted`. Los valores de `step` son `cross-sweep`, `vertical-pump`, `circle` y `zigzag`.

El esquema no presupone que una moneda tenga un tono único. La respuesta puede depender de orientación, velocidad, distancia a la bobina, mineralización, discriminación y cadena de audio. Por eso el protocolo registra el movimiento y no sólo el nombre del material.

## Invariantes de calidad

- Un ciclo completo contiene 12 tomas.
- La toma `zigzag` dura 15 s; las restantes, 10 s.
- La duración real se guarda aunque el operador cancele o el navegador finalice antes.
- El audio no se exporta como otro formato sin declarar la conversión.
- `quality=unreviewed` es el valor inicial; una revisión puede cambiarlo a `accepted`, `rejected` o `needs-review` en una versión futura.

## Evolución

Los cambios incompatibles incrementan `schemaVersion` y conservan un migrador documentado. Nunca se reutiliza un nombre de campo con otro significado.
