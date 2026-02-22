# Google Workspace (Sheets, Drive, Docs)

Intégration légère avec authentification OAuth standalone.

## Authentification (commune)

```bash
# Login (ouvre le navigateur)
python3 scripts/google_sheets/auth.py login
python3 scripts/google_drive/auth.py login
python3 scripts/google_docs/auth.py login

# Vérifier le statut
python3 scripts/google_sheets/auth.py status
```

## Google Sheets

### Lecture

```bash
# Lire une feuille complète
python3 scripts/google_sheets/sheets.py get <spreadsheet_id>

# Lire une plage spécifique
python3 scripts/google_sheets/sheets.py get <spreadsheet_id> --range "Sheet1!A1:D10"

# Chercher une feuille
python3 scripts/google_sheets/sheets.py search "quarterly report"

# Métadonnées
python3 scripts/google_sheets/sheets.py info <spreadsheet_id>
```

### Écriture

```bash
# Mettre à jour des cellules
python3 scripts/google_sheets/sheets.py update <spreadsheet_id> --range "Sheet1!A1" --values '[["Header1","Header2"],["val1","val2"]]'

# Ajouter des lignes
python3 scripts/google_sheets/sheets.py append <spreadsheet_id> --range "Sheet1!A:B" --values '[["new1","new2"]]'

# Mode RAW (pas d'interprétation)
python3 scripts/google_sheets/sheets.py update <spreadsheet_id> --range "A1" --values '[["=SUM(B:B)"]]' --raw
```

### Notation A1

- `Sheet1!A1:B10` — Plage A1 à B10
- `Sheet1!A:A` — Colonne A entière
- `Sheet1!1:1` — Ligne 1 entière

## Google Drive

### Lecture

```bash
# Rechercher des fichiers
python3 scripts/google_drive/drive.py search "quarterly report"
python3 scripts/google_drive/drive.py search "title:budget"

# Trouver un dossier
python3 scripts/google_drive/drive.py find-folder "Project Documents"

# Lister les fichiers
python3 scripts/google_drive/drive.py list
python3 scripts/google_drive/drive.py list <folder_id> --limit 20

# Télécharger
python3 scripts/google_drive/drive.py download <file_id> ./downloads/report.pdf
```

### Écriture

```bash
# Upload
python3 scripts/google_drive/drive.py upload ~/report.pdf
python3 scripts/google_drive/drive.py upload ~/report.pdf --folder <folder_id>

# Créer un dossier
python3 scripts/google_drive/drive.py create-folder "Project Documents"

# Déplacer, copier, renommer
python3 scripts/google_drive/drive.py move <file_id> <dest_folder_id>
python3 scripts/google_drive/drive.py copy <file_id> --name "Copy"
python3 scripts/google_drive/drive.py rename <file_id> "New Name.pdf"

# Supprimer (corbeille)
python3 scripts/google_drive/drive.py trash <file_id>
```

## Google Docs

### Lecture

```bash
# Chercher un document
python3 scripts/google_docs/docs.py search "meeting notes"

# Lire le contenu
python3 scripts/google_docs/docs.py get <doc_id>
```

### Écriture

```bash
# Créer un document
python3 scripts/google_docs/docs.py create "Mon Rapport" --content "# Titre\n\nContenu ici"

# Remplacer du texte
python3 scripts/google_docs/docs.py replace <doc_id> --find "ancien" --replace "nouveau"

# Ajouter du texte
python3 scripts/google_docs/docs.py append <doc_id> --text "Nouveau paragraphe"
```
