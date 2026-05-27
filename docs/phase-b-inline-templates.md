# Phase B — Extraction des templates inline

> **À ouvrir dans une session Claude Code dédiée.** Ne pas mélanger avec du
> travail feature/design — c'est du churn mécanique à scope défini.

## Objectif

Extraire les templates Angular `template: \`…\`` (et leur `styles: [\`…\`]`
éventuel) vers des fichiers `.html` / `.scss` séparés, alignés sur la
convention déjà appliquée dans `main-layout`, `navbar`, `sidebar`,
`route-loading-overlay` (templateUrl + styleUrl).

## Inventaire — 50 composants détectés

Comptage par `Grep "template:\\s*\`"` sur `src/`. Le chiffre informel
« 46 » de précédentes conversations est à 4 unités de l'inventaire réel ;
voir la section **Exclusions possibles** plus bas pour arbitrer.

Total cumulé : **~11 363 lignes** TS+template à scinder. Triés ici par
feature, ligne count entre crochets.

### Triviaux (à arbitrer — peut-être à laisser inline)

- `src/app/app.component.ts` [11] — juste `<router-outlet />`
- `src/app/shared/components/confirm-dialog/confirm-dialog.component.ts` [44]

### features/absences (5)

- `pages/absences-list/absences-list.component.ts` [379]
- `pages/appel/appel.component.ts` [384]
- `pages/alertes-absenteisme/alertes-absenteisme.component.ts` [255]
- `components/justificatif-dialog/justificatif-dialog.component.ts` [106]
- `components/valider-justificatif-dialog/valider-justificatif-dialog.component.ts` [107]

### features/bulletins (7)

- `pages/bulletins-list/bulletins-list.component.ts` [500]
- `pages/deliberations-list/deliberations-list.component.ts` [171]
- `pages/deliberation-detail/deliberation-detail.component.ts` [579]
- `components/appreciation-dialog/appreciation-dialog.component.ts` [83]
- `components/create-deliberation-dialog/create-deliberation-dialog.component.ts` [120]
- `components/generer-bulletins-dialog/generer-bulletins-dialog.component.ts` [77]
- `components/signer-document-dialog/signer-document-dialog.component.ts` [66]

### features/edt (5)

- `pages/edt-calendrier/edt-calendrier.component.ts` [417]
- `pages/edt-couverture/edt-couverture.component.ts` [167]
- `components/conflits-dialog/conflits-dialog.component.ts` [85]
- `components/seance-detail-dialog/seance-detail-dialog.component.ts` [186]
- `components/seance-form-dialog/seance-form-dialog.component.ts` [141]

### features/enseignants (3)

- `pages/enseignants-list/enseignants-list.component.ts` [441]
- `components/affectation-dialog/affectation-dialog.component.ts` [89]
- `components/enseignant-form-dialog/enseignant-form-dialog.component.ts` [186]

### features/etablissements (6)

- `pages/etablissements-list/etablissements-list.component.ts` [279]
- `pages/etablissement-detail/etablissement-detail.component.ts` [412]
- `components/annee-academique-form-dialog/annee-academique-form-dialog.component.ts` [97]
- `components/campus-form-dialog/campus-form-dialog.component.ts` [86]
- `components/etablissement-form-dialog/etablissement-form-dialog.component.ts` [135]
- `components/salle-form-dialog/salle-form-dialog.component.ts` [126]

### features/inscriptions (6)

- `pages/inscriptions-list/inscriptions-list.component.ts` [500]
- `pages/inscription-detail/inscription-detail.component.ts` [438]
- `components/affectation-dialog/affectation-dialog.component.ts` [76]
- `components/inscription-form-dialog/inscription-form-dialog.component.ts` [281]
- `components/periodes-inscription/periodes-inscription.component.ts` [230]
- `components/rejeter-dialog/rejeter-dialog.component.ts` [65]

### features/notes (5)

- `pages/evaluations-list/evaluations-list.component.ts` [400]
- `pages/moyennes-classe/moyennes-classe.component.ts` [276]
- `pages/saisie-notes/saisie-notes.component.ts` [538]
- `components/evaluation-form-dialog/evaluation-form-dialog.component.ts` [166]
- `components/modifier-note-dialog/modifier-note-dialog.component.ts` [73]

### features/referentiel (3)

- `pages/referentiel-list/referentiel-list.component.ts` [635]
- `components/matiere-form-dialog/matiere-form-dialog.component.ts` [281]
- `components/ue-form-dialog/ue-form-dialog.component.ts` [232]

### features/structure (8)

- `pages/classes-list/classes-list.component.ts` [297]
- `pages/structure-tree/structure-tree.component.ts` [519]
- `components/classe-form-dialog/classe-form-dialog.component.ts` [126]
- `components/cycle-form-dialog/cycle-form-dialog.component.ts` [108]
- `components/filiere-form-dialog/filiere-form-dialog.component.ts` [102]
- `components/groupe-form-dialog/groupe-form-dialog.component.ts` [98]
- `components/niveau-form-dialog/niveau-form-dialog.component.ts` [79]
- `components/promotion-form-dialog/promotion-form-dialog.component.ts` [114]

## Exclusions possibles

| Fichier | Lignes | Décision suggérée |
|---|---|---|
| `app.component.ts` | 11 | **Skip** — `<router-outlet />` seul, l'extraction ajoute plus de bruit qu'elle n'enlève. |
| `confirm-dialog.component.ts` | 44 | Marginal (~15 lignes template). Skip si on tient à 46, extraire sinon par cohérence. |

Pour aligner exactement sur « 46 », il faudrait skip 4 fichiers — choix
restant à l'arbitrage. Recommandation : être systématique et tout
extraire sauf `app.component.ts` (donc **49**).

## Plan d'attaque mécanique

Pour chaque fichier, procédure identique :

1. **Localiser** le bloc `template: \`…\`` dans le décorateur `@Component`.
2. **Créer** `{name}.component.html` à côté du `.ts`, y coller le contenu
   du template (sans les backticks).
3. Si le décorateur contient `styles: [\`…\`]` :
   - **Créer** `{name}.component.scss` à côté, y coller le contenu CSS
     (sans backticks ni tableau).
   - Remplacer `styles: [\`…\`]` par `styleUrl: './{name}.component.scss'`.
4. **Remplacer** `template: \`…\`` par `templateUrl: './{name}.component.html'`.
5. **Vérifier** que `imports` du composant est inchangé (les imports
   n'ont aucune raison de bouger).
6. **Indenter** le HTML proprement (le template inline était souvent
   indenté de 4–6 niveaux dans le `.ts`, le `.html` doit repartir à 0).

### Pattern cible (référence)

```ts
@Component({
  selector: 'app-x',
  standalone: true,
  imports: [/* inchangé */],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './x.component.html',
  styleUrl: './x.component.scss',
})
export class XComponent { /* … */ }
```

Conformes au pattern dans le repo :
[main-layout.component.ts](../src/app/layout/main-layout/main-layout.component.ts),
[navbar.component.ts](../src/app/shared/components/navbar/navbar.component.ts),
[sidebar.component.ts](../src/app/shared/components/sidebar/sidebar.component.ts),
[route-loading-overlay.component.ts](../src/app/shared/components/route-loading-overlay/route-loading-overlay.component.ts).

## Risques & pièges

- **`$localize`** : les balises `i18n="@@xxx"` doivent rester
  inchangées dans le HTML — pas de re-encoding HTML, pas de fuite de
  backslash.
- **Interpolation `${…}` dans les backticks TS** : ne devrait pas exister
  dans un template Angular (Angular utilise `{{ }}`). Si on en croise,
  c'est un bug existant à signaler, pas à corriger silencieusement.
- **`:host` dans `styles: [\`…\`]`** : à conserver tel quel dans le
  `.scss` — fonctionne pareil.
- **Imports `CommonModule`, `MatXxxModule`, etc.** : ne pas y toucher.
- **Strict null checks sur signal templates** : pas de risque, on ne
  change que du texte.
- **Tests** : il n'y a pas de tests unitaires sur ces composants à ce
  jour (à vérifier en début de session). Pas d'impact attendu.

## Ordre suggéré

Procéder feature par feature, de la plus petite à la plus grosse, pour
amortir les risques et avoir des points de commit propres :

1. `enseignants` (3) — warmup
2. `referentiel` (3)
3. `notes` (5)
4. `absences` (5)
5. `edt` (5)
6. `etablissements` (6)
7. `inscriptions` (6)
8. `bulletins` (7)
9. `structure` (8)
10. shared (`confirm-dialog`) si retenu

Commit après chaque feature : `chore(<feature>): extract inline templates`.

## Critères de validation

À chaque commit :

- `npm run build` passe sans erreur ni nouveau warning.
- `Grep "template:\\s*\`" src/app/features/<feature>` retourne 0 match.
- Lancement `ng serve` + navigation manuelle vers les pages de la
  feature (smoke test visuel).

À la fin :

- `Grep "template:\\s*\`" src/app` ne doit retourner que les fichiers
  explicitement exclus (`app.component.ts` au minimum).
- `Grep "styles:\\s*\\[" src/app` doit retourner 0 (ou seulement les
  exclusions).

## Hors-scope (ne PAS faire dans cette phase)

- Refactor du contenu HTML (pas de Material → standalone, pas de
  cleanup de classes, pas de renommage de variables).
- Refactor du SCSS (pas de migration vers variables CSS, pas de
  consolidation).
- Migration de signals, control flow `@if`/`@for`, OnPush, etc.
- Ajout/suppression de fonctionnalités.

Si quelque chose semble « tentant à corriger en passant », **noter
ailleurs et ne pas toucher**. Le but de la session est zéro
modification fonctionnelle.
