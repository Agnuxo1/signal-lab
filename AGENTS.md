# Signal Lab contributor guide

Signal Lab is a browser-first capture tool and an experimental cognitive architecture for metal-detector audio. Keep the capture protocol deterministic and preserve the provenance of every recording.

## Source of truth

- Product contract: `docs/architecture.md`
- Recording and metadata contract: `docs/dataset-spec.md`
- Field protocol: `docs/recording-protocol.md`
- Runtime code: `src/core`, `src/adapters`, `src/ui`, `src/main.js`
- Legacy decisions: `versions/v1-legacy/README.md`

## Working rules

- Do not delete historical protocol definitions; add a versioned document instead.
- Keep browser-only integrations behind `src/adapters` so the domain can be tested in Node.
- Any new metadata field must be documented and included in export validation.
- Audio capture is local by default. Never upload recordings without an explicit user action.
- Run `npm test` and `npm run check` before publishing.
