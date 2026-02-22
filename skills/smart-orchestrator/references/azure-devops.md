# Azure DevOps

Interaction complète avec Azure DevOps : work items, repos, pipelines, wikis, test plans, recherche.

## Prérequis

```bash
export AZURE_DEVOPS_ORG="https://dev.azure.com/your-org"
export AZURE_DEVOPS_PAT="your-personal-access-token"
```

## Work Items (scripts/azure_devops/work_items.py)

```bash
# Créer
python3 scripts/azure_devops/work_items.py create --project MyProject --type "User Story" \
  --title "New feature" --description "Details here"

# Lire
python3 scripts/azure_devops/work_items.py get --id 42
python3 scripts/azure_devops/work_items.py list --project MyProject --type Bug --state Active

# Mettre à jour
python3 scripts/azure_devops/work_items.py update --id 42 --state Resolved --comment "Fixed"
```

## Repos (scripts/azure_devops/repos.py)

```bash
# Lister les repos
python3 scripts/azure_devops/repos.py list --project MyProject

# Pull Requests
python3 scripts/azure_devops/repos.py list-prs --project MyProject --repo my-repo --status active
python3 scripts/azure_devops/repos.py create-pr --project MyProject --repo my-repo \
  --source feature/new --target main --title "New feature"

# Diff
python3 scripts/azure_devops/repos.py get-diff --project MyProject --repo my-repo --base main --target feature/new
```

## Pipelines (scripts/azure_devops/pipelines.py)

```bash
# Lister les builds
python3 scripts/azure_devops/pipelines.py list-builds --project MyProject --top 5

# Lancer un pipeline
python3 scripts/azure_devops/pipelines.py run --project MyProject --pipeline-id 5 --branch develop

# Logs
python3 scripts/azure_devops/pipelines.py build-logs --project MyProject --build-id 100
```

## Recherche (scripts/azure_devops/search.py)

```bash
# Rechercher dans le code
python3 scripts/azure_devops/search.py code --project MyProject --query "TODO"

# Rechercher dans le wiki
python3 scripts/azure_devops/search.py wiki --project MyProject --query "deployment guide"

# Rechercher des work items
python3 scripts/azure_devops/search.py work-items --project MyProject --query "login bug"
```

## Wiki (scripts/azure_devops/wiki.py)

```bash
# Lister les wikis
python3 scripts/azure_devops/wiki.py list --project MyProject

# Lire une page
python3 scripts/azure_devops/wiki.py get-page --project MyProject --wiki-id MyProject.wiki --path /Home

# Créer/mettre à jour
python3 scripts/azure_devops/wiki.py create-or-update-page --project MyProject \
  --wiki-id MyProject.wiki --path /NewPage --content "# New Page"
```

## Sprints & Capacités (scripts/azure_devops/work.py)

```bash
# Itérations
python3 scripts/azure_devops/work.py list-iterations --project MyProject
python3 scripts/azure_devops/work.py team-iterations --project MyProject --team "MyTeam" --timeframe current

# Capacités
python3 scripts/azure_devops/work.py get-capacities --project MyProject --team "MyTeam" --iteration-id "guid"
```
