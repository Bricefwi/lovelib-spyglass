# Relance Fournisseur — IMOTION Conseil

Application web HTML5 autonome de gestion des relances fournisseurs, développée pour le réseau RATP.

## Caractéristiques techniques

- **Single-file HTML** : un seul fichier `.html`, aucune dépendance externe
- **Librairies embarquées inline** : SheetJS (XLSX), PapaParse, Chart.js
- **Zéro connexion externe** : conforme aux contraintes de sécurité RATP
- **Pas de localStorage** : données en mémoire session uniquement
- **Compatible** : Edge / Chrome, ouverture par double-clic

## Modules fonctionnels

| Module | Description |
|--------|-------------|
| Accueil / KPIs | 4 cartes KPI animées, donut statuts, Top 10 fournisseurs, rappels du jour |
| Liste Relances | Tableau paginé (50 lignes/page), filtres multi-critères, drawer latéral, sélection multiple |
| Vue Fournisseur | Fiche synthèse 360°, contacts, actions groupées |
| Analytique | Top 20, heatmap Fournisseur×Magasin, barres empilées, efficacité par type d'action |
| Configuration | Paramètres, seuils de priorité, templates email éditables, export/import config |

## Utilisation

1. Ouvrir `RelanceFournisseur_v1.html` dans Edge ou Chrome
2. Sélectionner le mode (Gestionnaire / Consultation) et saisir ses initiales
3. Aller dans **Configuration** → charger le fichier BC en retard (.xlsx ou .csv)
4. Optionnel : charger le fichier d'actions existant (.json)
5. Naviguer dans les onglets pour piloter les relances

## Données de démonstration

Cliquer sur **"Charger données de démonstration"** dans Configuration pour injecter 50 lignes réalistes (fournisseurs, articles, magasins RATP, retards variés).

## Contraintes RATP respectées

- Aucun appel API externe
- Aucune macro VBA
- Aucun localStorage
- Librairies 100% embarquées inline
- Export/Import manuel via fichiers locaux

## Version

v1.0 — Février 2025  
*Développé pour Patrice — Gestionnaire Économique de Stock, IMOTION Conseil*
