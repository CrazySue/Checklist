# Liste de contrôle : Guide du développeur

> [!TIP]
> Ce document est un guide technique destiné aux développeurs : architecture, pipeline de construction, tests, ainsi que pièges et leçons apprises.  
> Pour la présentation du projet, les fonctionnalités et le téléchargement, voir le [README](https://github.com/CrazySue/Checklist/blob/main/docs/readme/README-fr.md).  

> Version actuelle : `Release v1.0.0` ｜ Dépôt : https://github.com/CrazySue/Checklist

---

## 🏗️ Vue d'ensemble de l'architecture

### 🧱 Structure à fichier unique

L'application est **un seul fichier HTML** (environ 40 MB), divisé de haut en bas en quatre couches :

| Zone | Contenu |
| --- | --- |
| `<style id="embedded-fonts">` dans `<head>` | 3 blocs `@font-face` (HarmonyOS Sans SC 400/500/700 + Material Symbols Rounded), intégrés en base64, `font-display:swap` |
| `<style>` principal dans `<head>` | Tout le CSS : jetons de design → styles des composants → animations → responsive (dont la barre latérale gauche en paysage via `html.landscape`) |
| `<body>` | Squelette de l'application : barre supérieure / barre de recherche / trois conteneurs de pages superposés en position absolue / barre inférieure + modales (sélection d'icônes, sélection de langue, Toast) |
| `<script>` | Tout le JavaScript (environ 3800 lignes) : état → utilitaires → i18n → thème/layout → rendu → formulaires → échange de données → paramètres → démarrage |

### 🔀 Flux de données

Un modèle hybride de **« état centralisé + fonctions de rendu + animation par manipulation directe du DOM »** :

```text
Interaction utilisateur
   │
   ├── Changement de données ──→ Store.save() (persistance localStorage)
   │                   └──→ Appel explicite de renderXxx() pour réafficher la zone concernée
   │
   └── Changement purement visuel (cocher, changement de page, ondulation) ──→ manipulation directe du DOM / des styles en ligne (pas de re-rendu)
```

> [!WARNING]
> Tout changement d'état impliquant une animation doit **manipuler directement le DOM** — ne déclenchez pas de re-rendu complet.

### 🗂️ Modèle d'état

Persisté sous la clé `localStorage` `checklist_app_state_v1` :

```js
state = {
  checklists: [
    { id, name, icon, resetHours,          // icon : 'auto' | nom d'icône
      items: [{ id, text, icon, done }],
      completedAt, createdAt }
  ],
  activeChecklistId: id | null,
  settings: {
    theme: 'auto' | 'light' | 'dark',
    itemHeight: 64,        // 56~120
    firstOnly: false,      // la hauteur personnalisée ne s'applique qu'au premier élément
    language: 'auto' | 'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'fr' | 'de' | 'es' | 'ru' | 'pt'
  }
}
```

L'état temporaire (non persisté) vit dans des variables au niveau du module : `currentPage`, `formMode` (`'new'|'edit'`), `formState`, `settingsFromPage`, `titleFlipDir`, `titleAnimToken`, `switchAnimToken`, `currentHomeView`, etc.

---

## 📂 Structure du dépôt (GitHub)

```text
.
├── .github/              Code de conduite et modèles d'issues
├── docs/                 Documentation
├── build/                Pipelines de correctifs, données maîtres des mots-clés et suites de tests
├── README.md             Fichier README
└── LICENSE.txt           Licence
```

---

## 🚀 Environnement et premiers pas avec les tests

### 📦 Prérequis

- Exécution de l'application : n'importe quel navigateur moderne / APK empaqueté avec HBuilderX ;
- Construction et tests : Node.js ≥ 16 (validé sur Node 24) ; `build/node_modules` embarque la dépendance jsdom.

### 🧪 Lancer les tests

```bash
node build/_extract099.js && node --check build/_check099.js   # vérification de la syntaxe
node build/_sim099.js                                          # simulation du comportement utilisateur (73 assertions)
node build/_smoke099.js && node build/_smoke099b.js            # tests de régression
```

Le tout doit afficher `ALL PASS` et `uncaught errors: 0` pour être considéré comme réussi.

---

## 🛠️ Pipeline de construction et workflow de développement

### 🔁 Pipeline de correctifs de version

Une mise à niveau de version = appliquer des scripts de correctifs Node au HTML de la version précédente. Le `apply(old, new, count)` de chaque script valide le nombre de correspondances et interrompt l'écriture si l'une d'elles ne correspond pas.

| Script | Rôle |
| --- | --- |
| `upgrade_v09.js` + `patch_v09_css.js` + `keywords_v09.js` + `embed_font_v09.js` + `rebuild_v09.js` | 0.8.0 → 0.9.0 |
| `upgrade_v095.js` / `upgrade_v095b.js` | → 0.9.5 |
| `upgrade_v096.js` / `upgrade_v096b.js` | → 0.9.6 |
| `upgrade_v097.js` | → 0.9.7 |
| `upgrade_v098.js` | → 0.9.8 |
| `upgrade_v099.js` + `upgrade_v099b.js` + `upgrade_v099c.js` + `remove_icons_v099.js` | → 0.9.9 |
| `upgrade_v100.js` | → 1.0.0 |

### ✏️ La bonne façon de modifier le code

1. Modifiez directement le HTML de la version cible (fichier unique, WYSIWYG) ;
2. **Répercutez la modification dans le `upgrade_vXXX.js` correspondant** (pour pouvoir reconstruire en une commande depuis les anciennes versions) ;
3. Ne committez qu'une fois la vérification de syntaxe et la simulation/les tests de régression entièrement verts.

### 🎛️ Ajouter ou supprimer des icônes et des mots-clés

- Bibliothèque d'icônes : `ICON_LIBRARY` (clés de catégorie `daily / travel / shopping / sports / leisure / food / health / work / other`) ;
- Ajout d'une icône : ajouter le nom de l'icône au tableau de sa catégorie → ajouter `[icon, {langue: 'mot-clé|mot-clé'}]` dans `build/keywords_v09.js` → reconstruire le bloc `AUTO_ICON_KEYWORDS` ;
- Suppression d'une icône : la supprimer de la bibliothèque et des données de mots-clés, puis reconstruire (voir `remove_icons_v099.js`) ;
- Validation : ≥ 200 mots-clés par langue ; chaque nom d'icône doit exister dans la police intégrée et dans `ICON_LIBRARY`.

### 🌍 Ajouter une langue

Ajouter un nouveau dictionnaire à `I18N` (mêmes clés que les autres langues) → l'enregistrer dans `LANGUAGES` → compléter la bibliothèque de mots-clés à ≥ 200 mots → `getLang()` (auto → correspondance exacte → correspondance de préfixe → repli sur zh-CN).

---

## 🧩 Structure du code en détail

### 🎨 Jetons de design et couches CSS

```css
:root{
  --brand-1:#10172F; --brand-2:#283558; --brand-3:#525288; --brand-4:#A5A8BA;  /* quatre couleurs de marque */
  --md-primary:#525288; --md-primary-container:#E1E0FF; …                         /* palette dérivée de MD3 */
  --md-easing-standard / emphasized / accelerated / decelerated;                  /* jetons d'animation */
  --md-dur-short:150ms; --md-dur-medium:250ms; --md-dur-long:400ms;
}
```

Couches CSS : reset → polices → jetons → animation → squelette → barre supérieure → conteneurs de pages → éléments de liste → barre inférieure → boutons/FAB → formulaires → recherche → paramètres → modales/Toast → responsive. Le thème sombre est implémenté en surchargeant les variables via `[data-theme="dark"]` ; tous les changements de couleur passent par `*{transition-property:…;transition-duration:.25s}` pour une transition fluide.

### ⚙️ Carte des modules JS

| Zone | Fonctions clés |
| --- | --- |
| État | `Store` (load/save/set) |
| Utilitaires | `$` `$$` `el` `uid` `attachRipple` `initGlobalRipple` |
| Correspondance d'icônes | `normText` `latinMatch` `autoIconFor` `resolveIcon` |
| i18n | `getLang` `t` |
| Thème/layout | `applyTheme` `updateLayout` |
| Barre supérieure | `renderTopbar` `setTopbarTitle` |
| Accueil | `renderHome` `showHomeView` `completeItem` `resetChecklist` `checkAutoReset` |
| Barre inférieure/changement de page | `renderBottombar` `switchChecklist` `switchPage` |
| Formulaires | `openForm` `renderForm` `renderFormItems` `appendFormItem` `refreshChecklistIconRow` |
| Échange de données | `handleExport` `downloadViaAnchor` `finishImport` `handleImport` |
| Paramètres | `renderSettings` `toggleDropdown` `openLanguageMenu` |
| Modales | `openIconPicker` `renderIconPickerGrid` `selectIcon` |
| Navigation | `openSettingsFrom` `goBackFromSettings` `openExternal` |
| Utilitaires d'animation | `swapIcon` `popIcon` `smoothCenter` |
| Démarrage | `bindEvents` `updateStaticLabels` `init` |

### ✨ Système d'animation

- **Modèle de token d'interruption** : toutes les animations interruptibles (changement de page, titre, défilement, échange d'icônes) détiennent un token incrémental ; les rappels temporisés valident d'abord le token et se retirent silencieusement lorsqu'une nouvelle animation les interrompt ;
- **Changement de page / bascule** : l'ancien contenu glisse vers l'extérieur sur 40px en 150ms avec accélération + fondu sortant → le nouveau contenu glisse depuis la direction opposée sur 40px en 300ms avec décélération (même schéma dans `switchPage` et `switchChecklist`) ;
- **Retournement du titre** : le titre entier se retourne vers l'extérieur en 140ms → puis revient avec décélération en 240ms, la direction étant déterminée par le sens du changement de page (avant = vers le haut, arrière = vers le bas) ;
- **Page café** : l'apparition/disparition utilise `@keyframes` (fiable sur Android) ; lors d'un changement de liste de contrôle, il est traité comme un « élément de liste spécial » qui se retourne avec la zone de défilement (le chemin `instant` désactive sa propre animation) ;
- **FLIP** : cocher un élément de liste pilote la contraction de la hauteur via les transitions CSS, sans re-rendu complet.

---

## 📱 Empaquetage APK (HBuilderX)

### 📦 Étapes

Créer un nouveau projet 5+ App (nom de paquet `com.crazysue.checklist`) → y placer le HTML comme page d'entrée → modifier manifest.json → packaging cloud / packaging hors ligne → certificat → empaqueter.

### 🔌 API plus utilisées

| API | Usage |
| --- | --- |
| `plus.io.requestFileSystem(plus.io.PRIVATE_DOC, …)` | Export de .checklist vers le répertoire privé de l'application (**ne pas revenir à l'approche du répertoire public**) |
| `plus.runtime.openURL(url)` | Ouvre les liens externes dans le navigateur par défaut du système |
| `plus.os.name` | Détection de la plateforme (l'import Android **sans** filtre `accept`) |

### ⚠️ Liste des pièges de plateforme

- L'entrée de fichier Android doit retirer `accept`, sinon tous les fichiers sont inaccessibles dans le sélecteur système ;
- L'écriture dans le dossier Download public sous Android 10+ (chemin File / MediaStore / SAF) échoue totalement sur certains appareils (fichiers de 0 octet) — la v1.0 est finalement revenue au répertoire privé de l'application ;
- `window.open(url,'_blank','noopener')` ouvre deux onglets — pour les liens externes, utiliser des ancres ou `plus.runtime.openURL` ;
- `scrollTo({behavior:'smooth'})` échoue silencieusement dans les anciens WebView — le défilement personnalisé utilise rAF + easing en écrivant directement dans `scrollTop` ;
- `screen.orientation` reflète le moniteur plutôt que la fenêtre — le portrait/paysage n'est déterminé que par le ratio de la fenêtre elle-même ;
- Les animations critiques d'apparition/disparition utilisent `@keyframes` plutôt qu'une transition « état initial → bascule de classe » ;
- inline-block réduit les espaces de tête — les suffixes de titre restent en inline ;
- Retirer l'ondulation immédiatement au pointerup semble trop rapide — après le relâchement, la laisser se jouer jusqu'à la fin.

---

## 🧠 Décisions techniques clés et pièges

| Thème | Décision | Justification |
| --- | --- | --- |
| Modèle d'orientation des pages | Les pages Nouveau/Paramètres glissent toujours depuis la droite ; les pages de liste de contrôle depuis la gauche ; le « retour » depuis Paramètres vers Nouveau inverse la direction | Correspond au modèle mental de l'utilisateur |
| État final de l'animation du titre | Le titre entier (nom + « Liste de contrôle ») se retourne verticalement d'un bloc, appliqué à toutes les pages | L'approche initiale à double voie « retournement du nom + déplacement du suffixe » souffrait de problèmes récurrents de téléportation/chevauchement |
| Page café | Se retourne avec la zone de défilement lors d'un changement ; lors d'une réinitialisation, glisse vers le bas + fondu sortant | Aspect unifié du changement de page |
| Ligne vide automatique | La fin comporte toujours une ligne automatique sans bouton de suppression ; vider l'élément précédent la supprime en animation ; vider le premier élément ne le supprime jamais | Équilibre entre l'expérience de saisie et « pas de boutons invisibles » |
| Export | Répertoire privé de l'application (APK) / téléchargement par ancre (Web) | Fiable sur toutes les versions d'Android |
| Mots-clés d'icônes | 630+ mots par langue, langue courante prioritaire avec repli sur l'anglais, correspondance de mots entiers pour les écritures occidentales | Équilibre entre taux de correspondance et faux positifs |

---

## 🧪 Guide des tests

### 🧰 Chaîne d'outils

- **jsdom** : retire les ressources base64 avant le chargement du HTML pour accélérer ; `beforeParse` injecte les graines d'état et les polyfills (`scrollIntoView`/`matchMedia`/`URL.createObjectURL`, etc.) ;
- **`_sim099.js`** : simulation de comportement — de vrais événements DOM pilotent des parcours utilisateur complets, et les états intermédiaires des animations sont échantillonnés pour vérifier le minutage ;
- **`_smoke099.js` / `_smoke099b.js`** : régression fonctionnelle + vérifications au niveau des chaînes de code.

### 📝 Exemple de cas de simulation

```js
// beforeParse : graine d'état + mock de la géométrie de mise en page
window.localStorage.setItem('checklist_app_state_v1', JSON.stringify(state));
window.Element.prototype.getBoundingClientRect = function(){ /* retourner selon les besoins */ };
// vrais événements + assertions par échantillonnage des états intermédiaires
input.focus(); input.value='boire de l'eau';
input.dispatchEvent(new w.Event('input', {bubbles:true}));
await sleep(60); check('suppression animée de la ligne vide automatique', !!document.querySelector('.form-item.removing'));
```

### ✅ Liste de contrôle avant publication

- [ ] `node --check` passe la vérification de syntaxe ;
- [ ] `_sim099.js` entièrement vert 2 fois de suite ;
- [ ] `_smoke099.js` et `_smoke099b.js` entièrement verts ;
- [ ] grep confirme le numéro de version, les résidus d'éléments supprimés et les marqueurs d'API clés ;
- [ ] Vérification sur appareil réel : export/import/liens externes/clair-sombre/portrait-paysage/retournement du titre/ondulation.

---

## 🎨 Référence rapide des spécifications de design (MD3)

- Couleurs du thème : `#10172F` `#283558` `#525288` `#A5A8BA` ; le clair est dérivé de la graine `#525288`, le sombre de la graine `#283558` ;
- Couches d'état : hover 8% / active 12% de noir transparent ;
- Police : HarmonyOS Sans SC (400/500/700, **pas de sous-ensemble** — le contenu utilisateur peut contenir n'importe quel caractère han) ;
- Icônes : Material Symbols Rounded (police variable, `font-variation-settings` contrôle FILL/wght), elles doivent provenir de Google Fonts ;
- Animation : seuls le retournement et le fondu entrants, l'ondulation et le zoom sont autorisés ; l'apparition/disparition de nulle part est interdite ; les easings et les durées passent toujours par les jetons ;
- Interrupteur : spécification 0.8.0 (off 12px / on 24px), pas d'étirement à l'appui, transition non linéaire emphasized.

---

## 📜 Historique des versions

| Version | Points clés |
| ----- | ------------------------------------------------------------------------- |
| 0.7.0 | Première version utilisable (trop volumineuse pour être téléversée sur GitHub) |
| 0.8.0 | Base de référence de la première revue |
| 0.9.0 | Focus sur la barre inférieure, changement de page avec la page café, navigation dans la page d'édition, catégories d'icônes localisées, 200+ mots-clés/langue, export .checklist, bouton de sponsoring, rognage de l'ondulation, barre latérale gauche en paysage, Bold intégré |
| 0.9.5 | Règles de sens du changement de page, retournement édition↔nouveau, spécification de l'interrupteur, lignes vides automatiques, animation de déplacement du titre |
| 0.9.6 | Sens du retour depuis les paramètres, export/import Android, retournement vertical du titre, transition sombre, réécriture de la détection paysage |
| 0.9.7 | Minutage de l'animation du titre, fondu sortant de la page café, rognage des lignes vides, retour de l'interrupteur à la spécification 0.8.0, fusion des crédits |
| 0.9.8 | Centrage du focus Android, import sans accept, chaîne d'export à trois niveaux, chorégraphie unifiée du titre, ondulation plus rapide, optimisation des performances |
| 0.9.9 | Retournement du titre entier sur toutes les pages, animation de changement de page unifiée à 40px, nettoyage des icônes, transition de thème sur tous les éléments, défilement de focus avec easing, interruption rapide |
| 1.0.0 | Export revenu au répertoire privé, interruption rapide des menus déroulants, nettoyage du code mort, optimisation du démarrage —— 🎉 version officielle |
