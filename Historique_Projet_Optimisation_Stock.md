# Historique Complet du Projet : Optimisation Stock GDI

**Date de compilation** : 24 mars 2026

Ce document retrace l'intégralité des échanges, des développements et des itérations du projet d'application **Optimisation Stock GDI**, de la demande initiale à la version finale V3.5.

---

## Phase 1 : Demande Initiale et Création de la V1.0

### 1.1. La Demande Initiale

Le projet a débuté par une demande de création d'une application web pour l'optimisation des stocks, accompagnée de plusieurs fichiers de données factices (`Stock_FAKE_50000.xlsx`, `BC_FAKE_2024-2026_72000.xlsx`, etc.) et d'un cahier des charges détaillé (`Prompt_Manus_Optimisation_Stock_GDI_V3.1_Optimise.md`). L'objectif était de construire une application HTML autonome capable d'analyser ces données et de produire un fichier Excel de synthèse.

> **Utilisateur :** "Application Web Optimisation de Stock... Je te fournis des datas factices pour te permettre de mieux construire et appréhender l'attendu je te mets aussi une image du fichier Excel en de sortie à générer..."

### 1.2. Mon Approche

1.  **Analyse des Données** : J'ai d'abord analysé la structure de tous les fichiers Excel pour comprendre les colonnes, les types de données et les relations entre les fichiers.
2.  **Lecture des Compétences** : J'ai activé les compétences `excel-generator`, `clean-code-architect` et `cognitive-guardian` pour garantir un livrable de haute qualité.
3.  **Construction de la V1.0** : J'ai développé une première version complète de l'application en un seul fichier HTML, incluant le moteur de calcul, les 7 onglets, les 9 graphiques Chart.js et la logique d'export Excel.

### 1.3. Premiers Tests et Bugs Critiques

Lors des premiers tests avec les données factices, j'ai identifié plusieurs bugs critiques dans les calculs, notamment :

-   **Calcul de couverture erroné** : La formule utilisait la quantité au lieu de la valeur, alors que les consommations étaient en euros.
-   **Calcul du stock optimal incorrect**.

> **Moi :** "L'application charge les données et les calculs fonctionnent. J'ai identifié un bug critique dans le calcul de couverture (couvertureMois) et quelques améliorations nécessaires. Je corrige maintenant le code et améliore l'application complète."

J'ai procédé à une réécriture complète du fichier pour corriger ces bugs fondamentaux.

---

## Phase 2 : V3.2 - Intégration des Données Plateforme

### 2.1. L'Oubli Majeur

L'utilisateur s'est rendu compte d'un oubli majeur dans la demande initiale : les données de stock de la **plateforme logistique** n'avaient pas été fournies. Cela expliquait les écarts de totaux observés.

> **Utilisateur :** "Je viens de me rendre compte que pour la plateforme il me manque un fichier ! ! ! !!"

De nouveaux fichiers ont été fournis (`ArticlesMag_20plate_forme_Fake.xlsx`, `26-02-26-SUIVI-DES-MVTS-plateforme-Fake.xlsx`) ainsi qu'un prompt mis à jour (V3.2) et des glossaires.

### 2.2. Refonte pour la V3.2

Cette nouvelle information a nécessité une refonte importante de l'application pour :

1.  **Ajouter une zone d'upload** pour le fichier Stock Plateforme.
2.  **Fusionner les données** des stocks Magasin et Plateforme.
3.  **Adapter tous les calculs et KPIs** pour distinguer le stock "Local" du stock "Plateforme" et afficher le total consolidé par unité.
4.  **Intégrer toutes les corrections** demandées précédemment (mise en page Excel, filtres par unité, etc.).

---

## Phase 3 : V3.3 - Résolution du Problème de Performance

### 3.1. Le Gel de l'Application

Avec les données réelles, l'application V3.2 gelait et ne répondait plus.

> **Utilisateur :** "Nous rencontrons un problème majeur, lors de l'intégration du dernier fichier, la page est gelée et ne répond pas ou plus..."

### 3.2. Diagnostic et Optimisation

Mon diagnostic a révélé un goulot d'étranglement critique : un **algorithme de complexité O(n²)** dans le calcul de la mutualisation, qui générait des centaines de millions d'opérations et bloquait le navigateur.

J'ai procédé à une nouvelle réécriture (V3.3) axée sur la performance :

-   **Pré-indexation des données** via des `Map` et `Set` pour des recherches en O(1).
-   **Rendu paresseux** des onglets (seul l'onglet actif est calculé et affiché).
-   **Traitement asynchrone** avec barres de progression pour ne pas geler l'interface utilisateur.

Ces optimisations ont permis de charger plus de 30 000 lignes en quelques secondes.

---

## Phase 4 : V3.4 - Correction de l'Écart de Valeur (1,3 M€)

### 4.1. L'Écart Inexpliqué

Malgré les optimisations, un écart de **1,32 M€** persistait entre la valeur de stock affichée par l'application (8,27 M€) et la valeur réelle dans les fichiers Excel (6,96 M€).

> **Utilisateur :** "non le résultat obtenu n'est pas conforme on obtient 8272883€. le problème n'est pas résolu !"

### 4.2. Diagnostic Final et Correction V3.4

L'enquête a révélé deux causes profondes :

1.  **Lignes en doublon** dans les fichiers sources qui gonflaient les totaux.
2.  L'application calculait systématiquement `Qté × CMP`, alors que la **valeur de stock réelle** se trouvait directement dans une colonne "Valeur Stock" (colonne O).

> **Utilisateur :** "Le problème vient du fait que dans les fichiers sources qui alimentent les analyses, il y a des lignes en doublons..."

La version V3.4 a intégré les corrections définitives :

-   **Dédoublonnage automatique** au chargement des fichiers.
-   **Lecture directe de la colonne "Valeur Stock"** avec un fallback sur `Qté × CMP` si la colonne est absente.
-   **Optimisation du levier Paramétrage** pour cibler un taux de service de 98% sur les classes A, B et C à haute rotation.

---

## Phase 5 : V3.5 - Paramétrage Différencié et Documentation

### 5.1. Demande d'Évolution Finale

La dernière demande visait à rendre le levier de paramétrage beaucoup plus intelligent en le différenciant selon 3 scénarios d'approvisionnement, et à produire une documentation technique complète.

> **Utilisateur :** "Attention le but est de faire baisser la valeur du stock : De recalculer le paramétrage pour les articles qui vont être mutualiser sur la plateforme... recalculer le paramétrage en magasin Local... recalculer le paramétrage des articles qui sont fourni par les fournisseurs externes..."

### 5.2. Livraison de la V3.5

La version finale V3.5 a implémenté cette logique complexe :

-   **Paramétrage différencié** (PLF, MAG-PLF, MAG-EXT) avec des délais et des couvertures cibles adaptés.
-   **Calcul de la Quantité Économique de Commande (QEC)** selon la formule de Wilson.
-   **Proposition de mise à jour du délai fournisseur** si un écart de plus de 20% est constaté avec le délai réel des bons de commande.
-   **Rédaction d'une documentation technique complète** au format Word et Markdown.

### 5.3. Livraison Finale

Le projet s'est conclu par la livraison de l'application V3.5 et de sa documentation sur le dépôt GitHub de l'utilisateur.

> **Moi :** "Application V3.5 et Documentation Technique livrées et poussées sur GitHub..."

> **Utilisateur :** "peux-tu me fournir l'adresse du dépôt GITHUB ?"

> **Moi :** "Voici l'adresse du dépôt GitHub : **https://github.com/Bricefwi/lovelib-spyglass**"


---

## Phase 6 : Retours Utilisateur Détaillés et Corrections Cumulées

### 6.1. Liste Complète des Retours Utilisateur

Au fil des itérations, l'utilisateur a fourni des retours précis qui ont guidé chaque version. Voici la synthèse exhaustive de ces demandes et de leur traitement :

| Retour | Version de correction | Statut |
|---|---|---|
| Filtrage par unité non appliqué à tous les onglets et exports | V3.2 | Corrigé |
| Fichier Excel de sortie visuellement illisible (pas de couleurs, pas de mise en page) | V3.2 | Corrigé |
| Colonne Dépréciation manquante dans Réforme et Paramétrage | V3.2 | Corrigé |
| Calcul du délai de mise à disposition à partir des dates BC | V3.2 / V3.5 | Corrigé |
| Quantité MAX = 999 999,99 par défaut | V3.2 | Corrigé |
| Export Excel individuel par onglet avec filtres appliqués | V3.2 | Corrigé |
| Exclusion des magasins 99, HS99 (TDE Plateforme) | V3.2 | Corrigé |
| Exclusion du magasin R-BAR (ESO Réparable) | V3.2 | Corrigé |
| Conservation des statuts 40 et 70 dans l'analyse | V3.4 | Corrigé |
| Exclusion des articles en statut 90 (Obsolète) | V3.4 | Corrigé |
| Magasin "NA" (Nanterre) correctement classé comme TDE | V3.2 | Vérifié (triple protection) |
| Fichier Stock Plateforme manquant (oubli initial) | V3.2 | Intégré |
| Gel de l'application avec les données réelles | V3.3 | Corrigé (optimisation O(n)) |
| Écart de valeur de stock de 1,3 M€ | V3.4 | Corrigé (doublons + colonne Valeur Stock) |
| Dédoublonnage automatique des fichiers sources | V3.4 | Corrigé |
| Paramétrage différencié (PLF / MAG-PLF / MAG-EXT) | V3.5 | Corrigé |
| Proposition de mise à jour du délai fournisseur | V3.5 | Corrigé |
| Taux de service cible 98% sur classes A, B, C haute rotation | V3.5 | Corrigé |
| Documentation technique Word | V3.5 | Livré |

### 6.2. Exclusions du Périmètre d'Analyse

L'un des points les plus discutés a été la définition précise du périmètre d'analyse. Voici les règles finales implémentées :

**Magasins exclus du périmètre local (traités comme "Plateforme")** :

| Magasin | Unité | Type | Raison de l'exclusion |
|---|---|---|---|
| 99 | TDE | Plateforme | Toul Réparables — plateforme TDE |
| HS99 | TDE | Plateforme | Toul Réparables HS — plateforme TDE |
| R-BAR | ESO | Plateforme | Réparable ESO — plateforme ESO |

**Articles exclus** :

| Critère | Raison |
|---|---|
| Statut = 90 | Articles obsolètes, ne doivent pas être analysés |
| Articles réparables en magasins réparables | Exclus du périmètre de stock consommable |

**Articles conservés** :

| Critère | Raison |
|---|---|
| Statut = 40 | Articles actifs à analyser |
| Statut = 70 (Inactif) | Articles inactifs mais à conserver dans l'analyse |

---

## Phase 7 : Synthèse des Interventions Techniques

### 7.1. Compétences Manus Activées

Tout au long du projet, les compétences suivantes ont été activées et utilisées :

| Compétence | Utilisation |
|---|---|
| **excel-generator** | Génération d'exports Excel professionnels avec mise en page, couleurs, filtres automatiques |
| **cognitive-guardian** | Validation des calculs, vérification de la cohérence logique, anti-hallucination |
| **clean-code-architect** | Revue de code, optimisation de performance, bonnes pratiques JavaScript |

### 7.2. Fichiers Fournis par l'Utilisateur

| Fichier | Taille | Description |
|---|---|---|
| `Prompt_Manus_Optimisation_Stock_GDI_V3.1_Optimise.md` | -- | Cahier des charges initial |
| `Prompt_Manus_Optimisation_Stock_GDI_V3.2.md` | -- | Cahier des charges mis à jour (avec plateforme) |
| `Stock_FAKE_50000.xlsx` | 50 000 lignes | Données factices de stock magasin |
| `BC_FAKE_2024-2026_72000.xlsx` | 72 000 lignes | Données factices de bons de commande |
| `Liste_sorties_retours_FAKE.xlsx` | 56 878 lignes | Données factices de mouvements magasin |
| `Réservation_FAKE_2026-02-23.xlsx` | 1 000 lignes | Données factices de réservations |
| `Dépréciation_FAKE_Dec2025.xlsx` | 50 505 lignes | Données factices de dépréciation |
| `ArticlesMag_20plate_forme_Fake.xlsx` | ~15 000 lignes | Données factices de stock plateforme |
| `26-02-26-SUIVI-DES-MVTS-plateforme-Fake.xlsx` | ~10 000 lignes | Données factices de mouvements plateforme |
| `Glossaire_ArticlesMagplateforme.xlsx` | -- | Glossaire des champs stock plateforme |
| `Glossaire_Suivi_Mouvements.xlsx` | -- | Glossaire des champs mouvements |

### 7.3. Livrables Finaux

| Livrable | Format | Emplacement |
|---|---|---|
| `Optimisation_Stock_GDI.html` | HTML autonome | GitHub : `Bricefwi/lovelib-spyglass` |
| `Documentation_Technique_V3.5.docx` | Word | GitHub : `Bricefwi/lovelib-spyglass` |
| `Documentation_Technique_V3.5.md` | Markdown | GitHub : `Bricefwi/lovelib-spyglass` |

---

## Annexe : Journal Chronologique des Échanges

### Échange 1 — Demande initiale

**Utilisateur** : Fournit le cahier des charges V3.1, 5 fichiers de données factices et 2 captures d'écran du fichier Excel de référence. Demande la création d'une application web d'optimisation de stock avec activation des compétences Manus.

**Manus** : Accuse réception. Analyse le cahier des charges, les données, et les images de référence. Active les compétences `excel-generator`, `clean-code-architect`, `cognitive-guardian`. Explore la structure des 5 fichiers Excel (colonnes, types, tailles). Construit la V1.0 de l'application HTML.

### Échange 2 — Premiers tests et bugs

**Manus** : Identifie des bugs critiques dans les calculs de couverture et de stock optimal. Corrige le code. Livre une version corrigée.

### Échange 3 — Exclusion des magasins

**Utilisateur** : "Attention les magasins TDE 99, HS99 sont à exclure !"

**Manus** : Implémente l'exclusion de 99 et HS99 du périmètre local.

### Échange 4 — Exclusion R-BAR

**Utilisateur** : "Réparable ESO / R-BAR aussi à exclure"

**Manus** : Ajoute R-BAR à la liste des magasins exclus. Implémente la logique à 3 niveaux (EXCLUDED_MAGS, isExcluded flag, filtrage dans tous les calculs).

### Échange 5 — Vérification magasin NA

**Utilisateur** : "Peux-tu vérifier que le magasin NA pour Nanterre fait bien partie du scope TDE ?"

**Manus** : Vérifie et confirme la triple protection en place (UNIT_MAP, classifyMag prioritaire, safeMag). NA = Nanterre est bien classé TDE/Magasin.

### Échange 6 — Confirmation exclusion R-BAR

**Utilisateur** : "Est-ce que R-BAR a bien été pris en compte ?"

**Manus** : Fournit la preuve complète avec les lignes de code et les tests en console confirmant l'exclusion.

### Échange 7 — Demande de lien application

**Utilisateur** : "Très bien mais je vois pas l'application ?"

**Manus** : Fournit le lien temporaire de la sandbox et le fichier HTML en pièce jointe.

### Échange 8 — Visibilité du lien

**Utilisateur** : "Visible que par moi ?"

**Manus** : Explique que le lien sandbox est temporaire. Propose GitHub Pages ou utilisation locale du fichier HTML.

### Échange 9 — Retours massifs après test avec données réelles

**Utilisateur** : Fournit une liste exhaustive de corrections : filtres non appliqués, Excel illisible, dépréciation manquante, délai BC, Qté MAX, export par onglet, écarts de valeurs, exclusion statut 90.

**Manus** : Analyse tous les retours. Planifie une réécriture complète. Intègre toutes les corrections dans la V3.2.

### Échange 10 — Conservation des statuts 40 et 70

**Utilisateur** : "Par contre il faudrait conserver le statut 70 inactif et 40 pour les articles"

**Manus** : Confirme : seul le statut 90 est exclu. Les statuts 40 et 70 sont conservés.

### Échange 11 — Oubli du fichier plateforme

**Utilisateur** : "Je viens de me rendre compte que pour la plateforme il me manque un fichier !"

**Manus** : Demande quel fichier manque. L'utilisateur fournit ensuite les fichiers plateforme, les glossaires et le prompt V3.2.

### Échange 12 — Fourniture des fichiers plateforme

**Utilisateur** : Fournit `ArticlesMag_20plate_forme_Fake.xlsx` et `26-02-26-SUIVI-DES-MVTS-plateforme-Fake.xlsx`.

**Manus** : Analyse les fichiers. Identifie les 6 magasins plateforme (210, 212, 216, 287, 289, 290). Intègre dans la V3.2.

### Échange 13 — Stock total = Magasin + Plateforme

**Utilisateur** : "Attention il faut compter le stock Magasin Plus plateforme = pour la valeur totale par unité !"

**Manus** : Confirme et intègre le calcul consolidé Magasin + Plateforme par unité.

### Échange 14 — Gel de l'application (V3.3)

**Utilisateur** : "Nous rencontrons un problème majeur, lors de l'intégration du dernier fichier, la page est gelée..."

**Manus** : Diagnostique l'algorithme O(n²). Réécrit l'application V3.3 avec pré-indexation, rendu paresseux et traitement asynchrone. Le gel est résolu.

### Échange 15 — Écart de valeur persistant (V3.4)

**Utilisateur** : "Le résultat obtenu n'est pas conforme, on obtient 8 272 883€. Le problème n'est pas résolu !"

**Manus** : Diagnostic approfondi. L'utilisateur identifie la cause : doublons dans les fichiers sources. Implémente le dédoublonnage automatique et la lecture directe de la colonne "Valeur Stock" dans la V3.4.

### Échange 16 — Paramétrage différencié (V3.5)

**Utilisateur** : "Le but est de faire baisser la valeur du stock : recalculer le paramétrage pour les articles mutualisés, les articles fournis par la plateforme, les articles fournis par les fournisseurs externes... Proposer une mise à jour du délai fournisseur... Réaliser une documentation technique Word."

**Manus** : Implémente les 3 scénarios de paramétrage (PLF, MAG-PLF, MAG-EXT), le QEC Wilson, la proposition de délai fournisseur, et rédige la documentation technique. Livre la V3.5.

### Échange 17 — Délai de mise à disposition

**Utilisateur** : "Le nouveau calcul du délai de mise à disposition se fait de la date de création du bon de commande à la date de la livraison des lignes de commande en nombre de jours."

**Manus** : Vérifie et confirme que le code utilise bien les colonnes `date commande` (col 21) et `Date de réception` (col 12) pour calculer le délai en jours.

### Échange 18 — Activation de toutes les compétences

**Utilisateur** : "Merci d'activer toutes les compétences mise à disposition"

**Manus** : Active et lit les compétences `excel-generator`, `cognitive-guardian`, `clean-code-architect`. Intègre leurs bonnes pratiques dans la V3.5.

### Échange 19 — Demande du lien GitHub

**Utilisateur** : "Peux-tu me fournir l'adresse du dépôt GitHub ?"

**Manus** : Fournit l'adresse : `https://github.com/Bricefwi/lovelib-spyglass`

### Échange 20 — Demande de compilation des échanges

**Utilisateur** : "Peux-tu me compiler un fichier MD de tous les échanges et tes interventions du début jusqu'au dernier échange."

**Manus** : Rédige le présent document.

---

## Conclusion

Ce projet a nécessité **5 versions majeures** (V1.0 → V3.5) et **20 échanges** pour aboutir à une application robuste, performante et conforme aux attentes. Les principaux défis ont été la gestion des données volumineuses (performance), la fiabilité des calculs (doublons, colonne Valeur Stock), et la complexité métier du paramétrage différencié (3 scénarios d'approvisionnement).

L'application finale est un fichier HTML autonome de ~1 260 lignes, capable de traiter plus de 50 000 lignes de stock en quelques secondes, avec 5 leviers d'optimisation, 9 graphiques interactifs et un export Excel professionnel multi-onglets.

**Dépôt GitHub** : [https://github.com/Bricefwi/lovelib-spyglass](https://github.com/Bricefwi/lovelib-spyglass)
