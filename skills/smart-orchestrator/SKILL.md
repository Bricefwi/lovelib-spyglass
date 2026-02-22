---
name: smart-orchestrator
description: |
  Méta-compétence orchestratrice qui analyse le contexte et le prompt utilisateur pour sélectionner,
  chaîner et exécuter automatiquement les bonnes compétences parmi 11 skills intégrés.
  Use when: the user needs research (deep-research, notebooklm), database queries (postgres, mysql),
  Google Workspace operations (sheets, drive, docs), DevOps tasks (azure-devops), code delegation (jules),
  or complex autonomous tasks (manus). Also use when the prompt requires combining multiple skills
  in sequence (e.g., "research then store in Sheets", "query DB then create report").
  Triggers: orchestrer, combiner, automatiser, pipeline, workflow, multi-étapes, recherche + stockage,
  analyse + rapport, SQL + export, code review + rapport.
---

# Smart Orchestrator

Analyse intelligente du prompt utilisateur pour router, chaîner et exécuter les compétences optimales.

## Skills intégrés

| Skill | Catégorie | Usage principal |
|-------|-----------|-----------------|
| deep_research | Recherche | Recherche autonome multi-étapes via Gemini |
| notebooklm | Connaissances | Interrogation de notebooks/bases de connaissances |
| manus | Délégation | Tâches complexes autonomes avec traitement parallèle |
| jules | Développement | Délégation de tâches de code (bug fix, tests, PR review) |
| google_sheets | Google Workspace | Lecture/écriture de tableurs |
| google_drive | Google Workspace | Gestion de fichiers (upload, download, recherche) |
| google_docs | Google Workspace | Création/édition de documents |
| azure_devops | DevOps | Pipelines, work items, repos, wikis |
| postgres | Base de données | Requêtes SQL PostgreSQL (lecture seule) |
| mysql | Base de données | Requêtes SQL MySQL (lecture seule) |

## Workflow principal

L'orchestration suit ces étapes :

1. **Analyser le prompt** (run `scripts/router.py`)
2. **Vérifier l'environnement** (run `scripts/executor.py --check-env`)
3. **Exécuter le plan** selon le mode détecté (single, multi, chain)
4. **Collecter et livrer** les résultats

### Déterminer le mode d'exécution

Le routeur détecte automatiquement le mode optimal :

**Prompt simple (un seul skill) ?** → Mode `single` : exécuter le skill le mieux scoré.
**Prompt multi-besoins ?** → Mode `multi` : exécuter les skills par ordre de pertinence.
**Prompt avec chaînage explicite ?** → Mode `chain` : exécuter les skills en séquence avec passage de données.

## Commandes

### Analyser un prompt (sans exécuter)

```bash
python3 scripts/router.py --prompt "Votre demande ici"
python3 scripts/router.py --prompt "Votre demande" --json
```

### Vérifier les prérequis

```bash
python3 scripts/executor.py --check-env          # Tous les skills
python3 scripts/executor.py --check-env postgres  # Un skill spécifique
```

### Exécuter automatiquement

```bash
python3 scripts/executor.py --prompt "Votre demande" --auto
python3 scripts/executor.py --prompt "Votre demande" --auto --json
```

## Patterns de chaînage prédéfinis

Le routeur reconnaît ces combinaisons automatiquement :

| Pattern | Déclencheurs | Séquence |
|---------|-------------|----------|
| research_to_sheets | "recherche...sheets", "analyse...tableur" | deep_research → google_sheets |
| research_to_docs | "recherche...rapport", "étude...rédiger" | deep_research → google_docs |
| research_to_drive | "recherche...drive", "analyse...stocker" | deep_research → google_drive |
| db_to_sheets | "sql...sheets", "base...tableur" | postgres/mysql → google_sheets |
| db_to_docs | "sql...rapport", "base...document" | postgres/mysql → google_docs |
| full_pipeline | "pipeline complet", "analyse complète" | deep_research → DB → google_docs → google_drive |
| code_review_report | "review...rapport", "audit code" | jules → google_docs |
| devops_report | "devops...rapport", "sprint...report" | azure_devops → google_docs |

## Configuration des skills

Chaque skill nécessite des variables d'environnement spécifiques. Vérifier avec `--check-env`.

| Skill | Variables requises |
|-------|-------------------|
| deep_research | `GEMINI_API_KEY` |
| notebooklm | `GEMINI_API_KEY` |
| manus | `MANUS_API_KEY` |
| azure_devops | `AZURE_DEVOPS_ORG`, `AZURE_DEVOPS_PAT` |
| postgres | `DATABASE_URL` |
| mysql | `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD` |
| jules | Auth via `jules login` |
| google_* | Auth via `python3 scripts/google_*/auth.py login` |

## Utilisation des skills individuels

Pour les commandes détaillées de chaque skill intégré :

- **Deep Research** : See [references/deep-research.md](references/deep-research.md)
- **NotebookLM** : See [references/notebooklm.md](references/notebooklm.md)
- **Google Workspace** : See [references/google-workspace.md](references/google-workspace.md)
- **Bases de données** : See [references/databases.md](references/databases.md)
- **Azure DevOps** : See [references/azure-devops.md](references/azure-devops.md)
- **Jules & Manus** : See [references/delegation.md](references/delegation.md)

## Exemples d'utilisation

**Recherche simple :**
```
Prompt: "Recherche les tendances IA en 2025"
→ Mode: single | Skill: deep_research | Confiance: 60%
```

**Chaînage automatique :**
```
Prompt: "Recherche les tendances IA et stocke les résultats dans Sheets"
→ Mode: chain | Séquence: deep_research → google_sheets | Confiance: 85%
```

**Requête base de données :**
```
Prompt: "Requête SQL sur la base postgres pour les clients actifs"
→ Mode: single | Skill: postgres | Confiance: 45%
```

**Délégation de code :**
```
Prompt: "Jules review le PR et ajoute des tests"
→ Mode: single | Skill: jules | Confiance: 90%
```

## Ajout de nouveaux skills

Ajouter un skill au registre dans `scripts/router.py` :

```python
SKILL_REGISTRY["new_skill"] = {
    "name": "New Skill Name",
    "triggers": ["keyword1", "keyword2"],
    "capabilities": ["cap1", "cap2"],
    "script": "scripts/new_skill/main.py",
    "requires_env": ["API_KEY"],
    "priority": 3,
    "category": "category_name"
}
```

Placer les scripts dans `scripts/new_skill/` et ajouter les patterns de chaînage si nécessaire.
