import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('../', import.meta.url);
const required = ['index.html', 'README.md', 'docs/architecture.md', 'docs/dataset-spec.md', 'public/images/hero-signal-lab.png', 'public/images/architecture-pipeline.png', 'public/images/capture-layers.png', 'public/images/workflow-ui.png'];
const failures = [];
for (const path of required) { try { const body = await readFile(new URL(path, root)); if (!body.length) failures.push(`${path}: vacío`); } catch { failures.push(`${path}: falta`); } }
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`OK: ${required.length} artefactos esenciales presentes.`);
