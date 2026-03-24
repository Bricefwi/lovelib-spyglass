# Documentation Technique — Optimisation Stock GDI V3.5

**Auteur** : Manus AI
**Date** : 24 mars 2026

## 1. Introduction

Ce document décrit l'architecture technique, les sources de données, les règles de calcul et la méthodologie de l'application **Optimisation Stock GDI V3.5**. Cette application est un outil d'aide à la décision conçu pour analyser les stocks, identifier les potentiels d'économies et proposer des stratégies de réapprovisionnement optimisées.

L'application est un fichier HTML unique et autonome qui s'exécute entièrement côté client dans le navigateur web. Aucune donnée n'est transmise à un serveur, garantissant une confidentialité totale.

## 2. Fichiers d'Entrée

L'application prend en charge jusqu'à 6 fichiers Excel (`.xlsx`) pour une analyse complète. Seuls les deux premiers sont obligatoires.

| Fichier | Obligatoire | Description | Clé de jointure |
|---|---|---|---|
| **Stock Magasin** | **Oui** | État des stocks des magasins locaux. | `Code Article` + `Magasin` |
| **Stock Plateforme** | **Oui** | État des stocks des magasins plateforme (210, 212, 216, 287, 289, 290). | `Code Article` + `Magasin` |
| Mouvements Magasin | Non | Historique des sorties/retours pour les magasins locaux. | `Code Article` + `Magasin` |
| Mouvements PLF | Non | Historique des mouvements pour les magasins plateforme. | `Code Article` + `Magasin` |
| Bons de Commande | Non | Historique des commandes pour calculer les délais de livraison réels. | `Code Article` |
| Dépréciation | Non | Fichier des provisions comptables pour identifier les articles dépréciés. | `Code Article` + `Magasin` |

### 2.1. Dédoublonnage Automatique

Au chargement, les fichiers **Stock Magasin**, **Stock Plateforme** et **Dépréciation** sont automatiquement dédoublonnés sur la clé `Code Article + Magasin`. La première ligne rencontrée est conservée, les suivantes sont ignorées. Le nombre de doublons supprimés est affiché dans l'interface pour information.

## 3. Analyses et Leviers d'Optimisation

L'application agrège les données et calcule 5 leviers d'optimisation principaux.

### 3.1. Levier 1 : Réforme des Stocks Dormants

- **Définition** : Articles sans aucune consommation (sortie) sur les 3 dernières années (N, N-1, N-2).
- **Priorité** : Haute (>1000€), Moyenne (100-1000€), Basse (<100€).

### 3.2. Levier 2 : Réforme des Stocks à Faible Activité

- **Définition** : Articles sans consommation sur les 2 dernières années (N, N-1) mais avec une consommation antérieure.

### 3.3. Levier 3 : Re-paramétrage Différencié (98% Taux de Service)

Ce levier est le plus complexe. Il recalcule le stock optimal et le seuil de réapprovisionnement pour les articles en surstock (couverture > 24 mois) en fonction de 3 scénarios d'approvisionnement, avec un objectif de **taux de service de 98%**.

#### Scénarios de Paramétrage

| Scénario | Description | Délai Retenu | Cible Couverture |
|---|---|---|---|
| **PLF** | Article stocké en plateforme. | Délai PLF (défaut 15j) | 4-6 mois |
| **MAG-PLF** | Article en magasin local, fourni par la plateforme. | Délai interne (défaut 10j) | 2-4 mois |
| **MAG-EXT** | Article en magasin local, fourni par un fournisseur externe. | Délai réel BC ou délai théorique | 2-4 mois |

#### Formules de Calcul

- **Stock de Sécurité** : `CMM (qté) * (Délai Retenu / 30) * Z`
  - `Z` est le coefficient de sécurité pour le taux de service cible (Z=2.05 pour 98%).
- **Stock Optimal** : `CMM (qté) * Cible Couverture (mois)`
- **Seuil de Réapprovisionnement** : `Stock Optimal + Stock de Sécurité`
- **Quantité Économique de Commande (QEC)** : Formule de Wilson `sqrt(2 * D * S / H)`
  - `D` : Demande annuelle en quantité.
  - `S` : Coût de passation de commande (fixé à 50€).
  - `H` : Coût de possession du stock (fixé à 25% du Coût Moyen Pondéré).

#### Proposition de Mise à Jour du Délai Fournisseur

Si un article a au moins 3 bons de commande et que l'écart entre le délai théorique (fichier Stock) et le délai réel médian (fichier BC) est supérieur à 20%, l'application propose le délai réel comme nouvelle valeur de référence.

### 3.4. Levier 4 : Mutualisation Inter-Magasins

- **Définition** : Articles présents dans au moins 2 magasins locaux, hors articles à réformer.
- **Économie potentielle** : Estimée à 15% de la valeur totale des articles mutualisables.

### 3.5. Levier 5 : Articles Non Rattachés

Articles présents dans les fichiers mais non rattachés à une unité ou à un magasin connu.

## 4. Éléments de Sortie

### 4.1. Interface Utilisateur

L'application présente les résultats sous forme de 7 onglets interactifs :

1.  **Synthèse** : Vue d'ensemble des KPIs, jauges par unité, et synthèse des 5 leviers.
2.  **Pareto ABC** : Classification des articles par valeur (A: 80%, B: 15%, C: 5%).
3.  **Réforme** : Liste des articles dormants et à faible activité.
4.  **Mutualisation** : Liste des articles mutualisables.
5.  **Paramétrage** : Détail des articles à re-paramétrer avec les 3 scénarios.
6.  **Détail Magasin** : Vue détaillée par article et par magasin.
7.  **Méthodologie** : Résumé des règles de calcul.

### 4.2. Exports Excel

L'utilisateur peut exporter les données de deux manières :

- **Export Complet** : Un fichier Excel unique contenant tous les onglets, avec une mise en page professionnelle (couleurs, filtres, formats).
- **Export par Onglet** : Chaque onglet peut être exporté individuellement. L'export respecte les filtres appliqués dans l'interface (filtre par unité, recherche).

## 5. Architecture et Technologies

- **Langage** : HTML5, CSS3, JavaScript (ES6+)
- **Librairies** :
  - **SheetJS (xlsx.full.min.js)** : Pour la lecture des fichiers Excel.
  - **Chart.js** : Pour la génération des 9 graphiques interactifs.
- **Dépendances** : Aucune. Le fichier est 100% autonome.
