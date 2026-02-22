# Délégation (Jules & Manus)

Skills de délégation pour exécution asynchrone de tâches complexes.

## Jules (Google) — Tâches de code

Délègue des tâches de développement à l'agent Jules sur des repos GitHub. Crée des PRs automatiquement.

### Setup

```bash
which jules || npm install -g @google/jules
jules login
jules remote list --repo
```

### Créer des tâches

```bash
jules new "Fix auth bug"                                   # Repo auto-détecté
jules new --repo owner/repo "Add unit tests"               # Repo spécifique
jules new --repo owner/repo --parallel 3 "Implement X"     # Sessions parallèles
cat task.md | jules new --repo owner/repo                  # Depuis stdin
```

### Surveiller et récupérer

```bash
jules remote list --session                                # Toutes les sessions
jules remote pull --session <id>                           # Voir le diff
jules remote pull --session <id> --apply                   # Appliquer localement
jules teleport <id>                                        # Clone + apply
```

### Enrichir avec le contexte Git

```bash
BRANCH=$(git branch --show-current)
RECENT_FILES=$(git diff --name-only HEAD~3 2>/dev/null | head -10 | tr '\n' ', ')
jules new "Fix bug in auth. Context: branch=$BRANCH, files: $RECENT_FILES"
```

### Templates courants

```bash
# Ajouter des tests
FILES=$(git diff --name-only HEAD~3 | grep -E '\.(js|ts|py)$' | head -5 | tr '\n' ', ')
jules new "Add unit tests for: $FILES. Include edge cases and mocks."

# Ajouter de la documentation
jules new "Add documentation comments to: $FILES. Include descriptions, params, returns."

# Corriger le lint
jules new "Fix all linting errors. Run linter, identify issues, fix while maintaining functionality."

# Review PR
PR_INFO=$(gh pr view 123 --json title,body,files --jq '"\(.title)\n\(.body)\nFiles: \(.files[].path)"')
jules new "Review this PR for bugs, security, improvements: $PR_INFO"
```

### Appliquer et committer

```bash
git checkout -b "jules/$SESSION_ID"
jules remote pull --session "$SESSION_ID" --apply
git add -A && git commit -m "feat: $TASK_DESC (Jules session: $SESSION_ID)"
git push -u origin "jules/$SESSION_ID"
gh pr create --title "$TASK_DESC" --body "Jules session $SESSION_ID"
```

## Manus Agent — Tâches complexes

Délègue des tâches complexes et longues à l'agent Manus pour exécution autonome.

### Setup

```bash
export MANUS_API_KEY=your-key
```

### Créer une tâche

```bash
curl -s -X POST "https://api.manus.ai/v1/tasks" \
  -H "API_KEY:$MANUS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Your research prompt", "model": "manus-1.6-max"}'
```

### Vérifier le statut

```bash
curl -s -X GET "https://api.manus.ai/v1/tasks/{task_id}" \
  -H "API_KEY:$MANUS_API_KEY" | jq '{status, output}'
```

### Exemples de prompts efficaces

**Comparaison produit :**
```
Find the best 4K monitors for Mac with Thunderbolt and 120Hz+.
Focus on BenQ, Samsung, Dell, LG. Only models from last year.
Compare specs, prices, Mac features. Output comparison table.
```

**Analyse financière :**
```
Analyze [TICKER] stock: profile, performance, technical indicators,
valuation, insider activity. Include price chart for past year.
```

**Étude de marché :**
```
Research the [industry] market: key players, size, growth trends,
developments, competitive landscape. Focus on [region/segment].
```

### Référence API complète

Voir `references/api.md` pour la documentation exhaustive des endpoints Manus.
