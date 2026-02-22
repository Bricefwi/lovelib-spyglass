# NotebookLM

Interrogation et gestion de notebooks Google NotebookLM avec auth persistante.

## Prérequis

```bash
export GEMINI_API_KEY=your-key
```

## Commandes

### Gestion des notebooks

```bash
# Lister les notebooks
python3 scripts/notebooklm/notebook_manager.py list

# Créer un notebook
python3 scripts/notebooklm/notebook_manager.py create "Mon Notebook"

# Ajouter une source
python3 scripts/notebooklm/notebook_manager.py add-source <notebook_id> <url_or_file>
```

### Poser des questions

```bash
# Question simple
python3 scripts/notebooklm/ask_question.py <notebook_id> "Quelle est la conclusion principale ?"

# Question avec contexte
python3 scripts/notebooklm/ask_question.py <notebook_id> "Résume les points clés" --format bullet
```

### Gestion des remotes

```bash
# Synchroniser les sources
python3 scripts/notebooklm/remote_manager.py sync <notebook_id>
```

## Référence complète des commandes

Voir le fichier `references/commands.md` pour la documentation exhaustive.
