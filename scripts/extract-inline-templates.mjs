// scripts/extract-inline-templates.mjs
// One-shot tool for Phase B — extracts inline `template:` and `styles:` blocks
// from Angular @Component decorators into sibling .html / .scss files, then
// rewrites the .ts to reference them via templateUrl / styleUrl.
//
// Run: node scripts/extract-inline-templates.mjs

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';

const files = [
  // referentiel
  'src/app/features/referentiel/pages/referentiel-list/referentiel-list.component.ts',
  'src/app/features/referentiel/components/matiere-form-dialog/matiere-form-dialog.component.ts',
  'src/app/features/referentiel/components/ue-form-dialog/ue-form-dialog.component.ts',
  // notes
  'src/app/features/notes/pages/evaluations-list/evaluations-list.component.ts',
  'src/app/features/notes/pages/moyennes-classe/moyennes-classe.component.ts',
  'src/app/features/notes/pages/saisie-notes/saisie-notes.component.ts',
  'src/app/features/notes/components/evaluation-form-dialog/evaluation-form-dialog.component.ts',
  'src/app/features/notes/components/modifier-note-dialog/modifier-note-dialog.component.ts',
  // absences
  'src/app/features/absences/pages/absences-list/absences-list.component.ts',
  'src/app/features/absences/pages/appel/appel.component.ts',
  'src/app/features/absences/pages/alertes-absenteisme/alertes-absenteisme.component.ts',
  'src/app/features/absences/components/justificatif-dialog/justificatif-dialog.component.ts',
  'src/app/features/absences/components/valider-justificatif-dialog/valider-justificatif-dialog.component.ts',
  // edt
  'src/app/features/edt/pages/edt-calendrier/edt-calendrier.component.ts',
  'src/app/features/edt/pages/edt-couverture/edt-couverture.component.ts',
  'src/app/features/edt/components/conflits-dialog/conflits-dialog.component.ts',
  'src/app/features/edt/components/seance-detail-dialog/seance-detail-dialog.component.ts',
  'src/app/features/edt/components/seance-form-dialog/seance-form-dialog.component.ts',
  // etablissements
  'src/app/features/etablissements/pages/etablissements-list/etablissements-list.component.ts',
  'src/app/features/etablissements/pages/etablissement-detail/etablissement-detail.component.ts',
  'src/app/features/etablissements/components/annee-academique-form-dialog/annee-academique-form-dialog.component.ts',
  'src/app/features/etablissements/components/campus-form-dialog/campus-form-dialog.component.ts',
  'src/app/features/etablissements/components/etablissement-form-dialog/etablissement-form-dialog.component.ts',
  'src/app/features/etablissements/components/salle-form-dialog/salle-form-dialog.component.ts',
  // inscriptions
  'src/app/features/inscriptions/pages/inscriptions-list/inscriptions-list.component.ts',
  'src/app/features/inscriptions/pages/inscription-detail/inscription-detail.component.ts',
  'src/app/features/inscriptions/components/affectation-dialog/affectation-dialog.component.ts',
  'src/app/features/inscriptions/components/inscription-form-dialog/inscription-form-dialog.component.ts',
  'src/app/features/inscriptions/components/periodes-inscription/periodes-inscription.component.ts',
  'src/app/features/inscriptions/components/rejeter-dialog/rejeter-dialog.component.ts',
  // bulletins
  'src/app/features/bulletins/pages/bulletins-list/bulletins-list.component.ts',
  'src/app/features/bulletins/pages/deliberations-list/deliberations-list.component.ts',
  'src/app/features/bulletins/pages/deliberation-detail/deliberation-detail.component.ts',
  'src/app/features/bulletins/components/appreciation-dialog/appreciation-dialog.component.ts',
  'src/app/features/bulletins/components/create-deliberation-dialog/create-deliberation-dialog.component.ts',
  'src/app/features/bulletins/components/generer-bulletins-dialog/generer-bulletins-dialog.component.ts',
  'src/app/features/bulletins/components/signer-document-dialog/signer-document-dialog.component.ts',
  // structure
  'src/app/features/structure/pages/classes-list/classes-list.component.ts',
  'src/app/features/structure/pages/structure-tree/structure-tree.component.ts',
  'src/app/features/structure/components/classe-form-dialog/classe-form-dialog.component.ts',
  'src/app/features/structure/components/cycle-form-dialog/cycle-form-dialog.component.ts',
  'src/app/features/structure/components/filiere-form-dialog/filiere-form-dialog.component.ts',
  'src/app/features/structure/components/groupe-form-dialog/groupe-form-dialog.component.ts',
  'src/app/features/structure/components/niveau-form-dialog/niveau-form-dialog.component.ts',
  'src/app/features/structure/components/promotion-form-dialog/promotion-form-dialog.component.ts',
  // shared
  'src/app/shared/components/confirm-dialog/confirm-dialog.component.ts',
];

// Find the matching closing backtick from `start`, honoring `\\` escapes.
function findClosingBacktick(src, start) {
  let i = start;
  while (i < src.length) {
    const c = src[i];
    if (c === '\\') { i += 2; continue; }
    if (c === '`') return i;
    i++;
  }
  return -1;
}

// Dedent block by the smallest leading-space indent across non-blank lines.
function dedent(text) {
  const lines = text.split('\n');
  let min = Infinity;
  for (const line of lines) {
    if (line.trim() === '') continue;
    const m = line.match(/^( *)/);
    min = Math.min(min, m[1].length);
  }
  if (min === Infinity || min === 0) return text;
  return lines.map(l => (l.length >= min ? l.slice(min) : l)).join('\n');
}

function normalizeBlock(content) {
  // Strip leading newline(s), ensure trailing newline.
  return dedent(content).replace(/^\n+/, '').replace(/\n+$/, '') + '\n';
}

function processFile(rel) {
  const full = resolve(rel);
  if (!existsSync(full)) {
    console.error(`SKIP (missing): ${rel}`);
    return 'missing';
  }
  const src = readFileSync(full, 'utf8');

  // Locate template: `
  const tplDecl = src.match(/template:\s*`/);
  if (!tplDecl) {
    console.error(`SKIP (no inline template): ${rel}`);
    return 'no-template';
  }
  const tplBodyStart = tplDecl.index + tplDecl[0].length;
  const tplBodyEnd = findClosingBacktick(src, tplBodyStart);
  if (tplBodyEnd < 0) {
    console.error(`FAIL (unterminated template): ${rel}`);
    return 'fail';
  }
  const tplContent = src.substring(tplBodyStart, tplBodyEnd);

  // Locate styles: [`  (optional)
  const stylesDecl = src.match(/styles:\s*\[\s*`/);
  let stylesContent = null;
  let stylesStart = -1, stylesEndExclusive = -1;
  if (stylesDecl) {
    const stBodyStart = stylesDecl.index + stylesDecl[0].length;
    const stBodyEnd = findClosingBacktick(src, stBodyStart);
    if (stBodyEnd < 0) {
      console.error(`FAIL (unterminated styles): ${rel}`);
      return 'fail';
    }
    stylesContent = src.substring(stBodyStart, stBodyEnd);
    stylesStart = stylesDecl.index;
    // Find the closing ] after the body backtick (allow whitespace).
    let j = stBodyEnd + 1;
    while (j < src.length && /\s/.test(src[j])) j++;
    if (src[j] !== ']') {
      console.error(`FAIL (missing ']' after styles): ${rel}`);
      return 'fail';
    }
    stylesEndExclusive = j + 1;
  }

  // Bounds of template block to replace (including trailing comma if present).
  let tplEnd = tplBodyEnd + 1;
  if (src[tplEnd] === ',') tplEnd++;

  // Same for styles.
  let stEnd = stylesEndExclusive;
  if (stEnd > -1 && src[stEnd] === ',') stEnd++;

  const tsBase = basename(rel, '.ts');                  // e.g. foo.component
  const dir = dirname(full);
  const htmlPath = resolve(dir, `${tsBase}.html`);
  const scssPath = resolve(dir, `${tsBase}.scss`);

  // Write extracted files.
  writeFileSync(htmlPath, normalizeBlock(tplContent), 'utf8');
  if (stylesContent !== null) {
    writeFileSync(scssPath, normalizeBlock(stylesContent), 'utf8');
  }

  // Build replacements (apply in reverse to preserve indices).
  const repl = [];
  repl.push({
    start: tplDecl.index,
    end: tplEnd,
    text: `templateUrl: './${tsBase}.html',`,
  });
  if (stylesContent !== null) {
    repl.push({
      start: stylesStart,
      end: stEnd,
      // No trailing comma — preserves original behavior since `styles` was
      // the last property and had no trailing comma either.
      text: `styleUrl: './${tsBase}.scss'`,
    });
  }
  repl.sort((a, b) => b.start - a.start);

  let out = src;
  for (const r of repl) {
    out = out.substring(0, r.start) + r.text + out.substring(r.end);
  }
  writeFileSync(full, out, 'utf8');
  console.log(`OK: ${rel}${stylesContent === null ? ' (no styles)' : ''}`);
  return 'ok';
}

const counts = { ok: 0, missing: 0, 'no-template': 0, fail: 0 };
for (const f of files) {
  const r = processFile(f);
  counts[r] = (counts[r] || 0) + 1;
}
console.log(`\nSummary: ${counts.ok} ok, ${counts.missing} missing, ${counts['no-template']} no-template, ${counts.fail} fail`);
process.exit(counts.fail > 0 ? 1 : 0);
