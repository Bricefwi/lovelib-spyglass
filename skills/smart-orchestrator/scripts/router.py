#!/usr/bin/env python3
"""
Smart Orchestrator - Routeur Intelligent
Analyse un prompt utilisateur et détermine quels skills activer,
dans quel ordre, et avec quels paramètres.

Usage:
    python3 scripts/router.py --prompt "Recherche les tendances IA et stocke dans Sheets"
    python3 scripts/router.py --prompt "Requête SQL sur la base clients" --context "postgres"
    python3 scripts/router.py --analyze-only --prompt "..."
"""

import argparse
import json
import sys
import re
from typing import List, Dict, Tuple

# ─── Registre des Skills ───────────────────────────────────────────────
SKILL_REGISTRY = {
    "deep_research": {
        "name": "Deep Research (Gemini)",
        "triggers": [
            "recherche", "research", "analyse de marché", "market analysis",
            "veille", "étude", "investigation", "benchmark", "comparatif",
            "literature review", "due diligence", "tendances", "trends",
            "état de l'art", "competitive", "concurrentiel"
        ],
        "capabilities": ["research", "analysis", "synthesis", "report"],
        "script": "scripts/deep_research/research.py",
        "requires_env": ["GEMINI_API_KEY"],
        "priority": 1,
        "category": "research"
    },
    "notebooklm": {
        "name": "NotebookLM",
        "triggers": [
            "notebook", "notebooklm", "mes notes", "my notes",
            "knowledge base", "base de connaissances", "carnet",
            "interroger mes documents", "query documents"
        ],
        "capabilities": ["query", "knowledge_management", "notes"],
        "script": "scripts/notebooklm/ask_question.py",
        "requires_env": ["GEMINI_API_KEY"],
        "priority": 2,
        "category": "knowledge"
    },
    "manus": {
        "name": "Manus Agent",
        "triggers": [
            "manus", "déléguer", "delegate", "tâche complexe",
            "complex task", "autonome", "autonomous", "long-running",
            "rapport complet", "comprehensive report", "multi-source"
        ],
        "capabilities": ["delegation", "complex_tasks", "parallel_processing"],
        "script": None,
        "api_base": "https://api.manus.ai",
        "requires_env": ["MANUS_API_KEY"],
        "priority": 3,
        "category": "delegation"
    },
    "jules": {
        "name": "Jules (Google)",
        "triggers": [
            "jules", "fix bug", "corriger", "code review", "pull request",
            "pr", "tests", "documentation code", "refactoring",
            "lint", "ajouter des tests", "add tests", "debug"
        ],
        "capabilities": ["coding", "bug_fix", "testing", "code_review"],
        "script": None,
        "cli": "jules",
        "requires_env": [],
        "priority": 2,
        "category": "development"
    },
    "google_sheets": {
        "name": "Google Sheets",
        "triggers": [
            "sheets", "tableur", "spreadsheet", "feuille de calcul",
            "cellule", "cell", "colonne", "column", "ligne", "row",
            "données tabulaires", "tabular data", "csv", "excel",
            "stocker dans sheets", "store in sheets"
        ],
        "capabilities": ["data_storage", "tabular", "read_write"],
        "script": "scripts/google_sheets/sheets.py",
        "requires_env": [],
        "priority": 4,
        "category": "google_workspace"
    },
    "google_drive": {
        "name": "Google Drive",
        "triggers": [
            "drive", "fichier", "file", "dossier", "folder",
            "upload", "download", "télécharger", "stocker",
            "partager", "share", "organiser", "chercher fichier"
        ],
        "capabilities": ["file_management", "storage", "sharing"],
        "script": "scripts/google_drive/drive.py",
        "requires_env": [],
        "priority": 5,
        "category": "google_workspace"
    },
    "google_docs": {
        "name": "Google Docs",
        "triggers": [
            "docs", "document", "rédiger", "write", "rapport",
            "report", "article", "memo", "note", "créer un doc",
            "create document", "éditer document", "edit document"
        ],
        "capabilities": ["document_creation", "editing", "formatting"],
        "script": "scripts/google_docs/docs.py",
        "requires_env": [],
        "priority": 4,
        "category": "google_workspace"
    },
    "azure_devops": {
        "name": "Azure DevOps",
        "triggers": [
            "azure", "devops", "pipeline", "build", "release",
            "work item", "sprint", "iteration", "wiki devops",
            "repos azure", "test plan", "ci/cd", "board"
        ],
        "capabilities": ["devops", "ci_cd", "project_management", "repos"],
        "script": "scripts/azure_devops/",
        "requires_env": ["AZURE_DEVOPS_ORG", "AZURE_DEVOPS_PAT"],
        "priority": 3,
        "category": "development"
    },
    "postgres": {
        "name": "PostgreSQL",
        "triggers": [
            "postgres", "postgresql", "pg", "base de données postgres",
            "requête sql postgres", "sql query postgres",
            "database postgres", "table postgres"
        ],
        "capabilities": ["database", "sql_query", "data_retrieval"],
        "script": "scripts/postgres/query.py",
        "requires_env": ["DATABASE_URL"],
        "priority": 3,
        "category": "database"
    },
    "mysql": {
        "name": "MySQL",
        "triggers": [
            "mysql", "mariadb", "base de données mysql",
            "requête sql mysql", "sql query mysql",
            "database mysql", "table mysql"
        ],
        "capabilities": ["database", "sql_query", "data_retrieval"],
        "script": "scripts/mysql/query.py",
        "requires_env": ["MYSQL_HOST", "MYSQL_USER", "MYSQL_PASSWORD"],
        "priority": 3,
        "category": "database"
    }
}

# ─── Patterns de chaînage ──────────────────────────────────────────────
CHAIN_PATTERNS = {
    "research_to_sheets": {
        "description": "Recherche puis stockage dans Sheets",
        "pattern": ["deep_research", "google_sheets"],
        "triggers": ["recherche.*sheets", "research.*store", "analyse.*tableur",
                      "tendances.*sheets", "benchmark.*sheets"]
    },
    "research_to_docs": {
        "description": "Recherche puis rédaction de rapport",
        "pattern": ["deep_research", "google_docs"],
        "triggers": ["recherche.*rapport", "research.*report", "analyse.*document",
                      "étude.*rédiger", "research.*write"]
    },
    "research_to_drive": {
        "description": "Recherche puis stockage dans Drive",
        "pattern": ["deep_research", "google_drive"],
        "triggers": ["recherche.*drive", "research.*save", "analyse.*stocker"]
    },
    "db_to_sheets": {
        "description": "Requête DB puis export Sheets",
        "pattern": ["postgres|mysql", "google_sheets"],
        "triggers": ["sql.*sheets", "base.*tableur", "database.*export",
                      "requête.*sheets", "données.*sheets"]
    },
    "db_to_docs": {
        "description": "Requête DB puis rapport",
        "pattern": ["postgres|mysql", "google_docs"],
        "triggers": ["sql.*rapport", "base.*document", "database.*report"]
    },
    "full_pipeline": {
        "description": "Recherche + Analyse DB + Rapport + Stockage",
        "pattern": ["deep_research", "postgres|mysql", "google_docs", "google_drive"],
        "triggers": ["pipeline complet", "full pipeline", "analyse complète",
                      "comprehensive analysis"]
    },
    "code_review_report": {
        "description": "Review code puis rapport",
        "pattern": ["jules", "google_docs"],
        "triggers": ["review.*rapport", "audit code.*document", "code review.*report"]
    },
    "devops_report": {
        "description": "Status DevOps puis rapport",
        "pattern": ["azure_devops", "google_docs"],
        "triggers": ["devops.*rapport", "sprint.*report", "pipeline.*status.*report"]
    }
}


def normalize_text(text: str) -> str:
    """Normalise le texte pour la correspondance."""
    text = text.lower().strip()
    text = re.sub(r'[àáâãäå]', 'a', text)
    text = re.sub(r'[èéêë]', 'e', text)
    text = re.sub(r'[ìíîï]', 'i', text)
    text = re.sub(r'[òóôõö]', 'o', text)
    text = re.sub(r'[ùúûü]', 'u', text)
    text = re.sub(r'[ç]', 'c', text)
    return text


def score_skill(skill_id: str, skill_info: dict, prompt: str, context: str = "") -> float:
    """Calcule un score de pertinence pour un skill donné."""
    normalized_prompt = normalize_text(prompt + " " + context)
    score = 0.0

    # Score par triggers (correspondance directe)
    for trigger in skill_info["triggers"]:
        trigger_norm = normalize_text(trigger)
        if trigger_norm in normalized_prompt:
            # Bonus si le trigger est un mot complet
            if re.search(r'\b' + re.escape(trigger_norm) + r'\b', normalized_prompt):
                score += 3.0
            else:
                score += 1.5

    # Score par catégorie contextuelle
    category_hints = {
        "research": ["pourquoi", "comment", "quoi", "analyser", "comprendre", "explorer", "trouver"],
        "database": ["sql", "requete", "query", "table", "base", "donnees", "data"],
        "google_workspace": ["google", "partager", "collaborer", "en ligne", "cloud"],
        "development": ["code", "git", "github", "repo", "bug", "feature", "deploy"],
        "delegation": ["complexe", "long", "autonome", "parallele", "multi"],
        "knowledge": ["mes notes", "mon carnet", "ma base", "mes documents"]
    }

    category = skill_info.get("category", "")
    if category in category_hints:
        for hint in category_hints[category]:
            if hint in normalized_prompt:
                score += 0.5

    # Bonus de contexte explicite
    if context and skill_id in normalize_text(context):
        score += 5.0

    return score


def detect_chain(prompt: str) -> Tuple[str, List[str]]:
    """Détecte si le prompt correspond à un pattern de chaînage."""
    normalized = normalize_text(prompt)

    best_chain = None
    best_score = 0

    for chain_id, chain_info in CHAIN_PATTERNS.items():
        for trigger_pattern in chain_info["triggers"]:
            if re.search(trigger_pattern, normalized):
                score = len(trigger_pattern)
                if score > best_score:
                    best_score = score
                    best_chain = chain_id

    if best_chain:
        chain = CHAIN_PATTERNS[best_chain]
        # Résoudre les alternatives (postgres|mysql)
        resolved = []
        for step in chain["pattern"]:
            if "|" in step:
                alternatives = step.split("|")
                # Choisir le meilleur parmi les alternatives
                best_alt = max(alternatives,
                               key=lambda a: score_skill(a, SKILL_REGISTRY.get(a, {"triggers": [], "category": ""}), prompt))
                resolved.append(best_alt)
            else:
                resolved.append(step)
        return best_chain, resolved

    return None, []


def route(prompt: str, context: str = "", max_skills: int = 3) -> Dict:
    """
    Analyse le prompt et retourne le plan d'exécution optimal.

    Returns:
        Dict avec:
        - skills: liste ordonnée des skills à activer
        - chain: nom du pattern de chaînage détecté (ou None)
        - execution_plan: plan d'exécution détaillé
        - confidence: score de confiance global
    """
    # 1. Détecter un pattern de chaînage
    chain_name, chain_skills = detect_chain(prompt)

    if chain_skills:
        execution_plan = []
        for i, skill_id in enumerate(chain_skills):
            skill_info = SKILL_REGISTRY.get(skill_id, {})
            execution_plan.append({
                "step": i + 1,
                "skill_id": skill_id,
                "skill_name": skill_info.get("name", skill_id),
                "script": skill_info.get("script"),
                "requires_env": skill_info.get("requires_env", []),
                "role": "source" if i == 0 else ("sink" if i == len(chain_skills) - 1 else "transform")
            })

        return {
            "mode": "chain",
            "chain_name": chain_name,
            "chain_description": CHAIN_PATTERNS[chain_name]["description"],
            "skills": chain_skills,
            "execution_plan": execution_plan,
            "confidence": 0.85
        }

    # 2. Scoring individuel des skills
    scores = {}
    for skill_id, skill_info in SKILL_REGISTRY.items():
        score = score_skill(skill_id, skill_info, prompt, context)
        if score > 0:
            scores[skill_id] = score

    if not scores:
        return {
            "mode": "none",
            "skills": [],
            "execution_plan": [],
            "confidence": 0.0,
            "suggestion": "Aucun skill ne correspond au prompt. Reformulez ou précisez votre besoin."
        }

    # Trier par score décroissant
    sorted_skills = sorted(scores.items(), key=lambda x: (-x[1], SKILL_REGISTRY[x[0]]["priority"]))
    selected = sorted_skills[:max_skills]

    # Construire le plan d'exécution
    execution_plan = []
    for i, (skill_id, score) in enumerate(selected):
        skill_info = SKILL_REGISTRY[skill_id]
        execution_plan.append({
            "step": i + 1,
            "skill_id": skill_id,
            "skill_name": skill_info["name"],
            "script": skill_info.get("script"),
            "requires_env": skill_info.get("requires_env", []),
            "score": round(score, 2),
            "role": "primary" if i == 0 else "secondary"
        })

    max_score = selected[0][1] if selected else 0
    confidence = min(max_score / 10.0, 1.0)

    return {
        "mode": "single" if len(selected) == 1 else "multi",
        "skills": [s[0] for s in selected],
        "execution_plan": execution_plan,
        "confidence": round(confidence, 2)
    }


def main():
    parser = argparse.ArgumentParser(description="Smart Orchestrator - Routeur Intelligent")
    parser.add_argument("--prompt", required=True, help="Le prompt utilisateur à analyser")
    parser.add_argument("--context", default="", help="Contexte additionnel (skill préféré, historique)")
    parser.add_argument("--max-skills", type=int, default=3, help="Nombre max de skills à activer")
    parser.add_argument("--analyze-only", action="store_true", help="Analyse sans exécution")
    parser.add_argument("--json", action="store_true", help="Sortie JSON brute")

    args = parser.parse_args()
    result = route(args.prompt, args.context, args.max_skills)

    if args.json:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(f"\n{'='*60}")
        print(f"  SMART ORCHESTRATOR - Analyse du Prompt")
        print(f"{'='*60}")
        print(f"\n  Prompt : \"{args.prompt}\"")
        print(f"  Mode   : {result['mode']}")
        print(f"  Confiance : {result['confidence']*100:.0f}%")

        if result.get("chain_name"):
            print(f"  Chaîne : {result['chain_description']}")

        if result["execution_plan"]:
            print(f"\n  Plan d'exécution :")
            print(f"  {'─'*50}")
            for step in result["execution_plan"]:
                role_icon = {"primary": "★", "secondary": "○", "source": "▶", "transform": "◆", "sink": "◀"}.get(step["role"], "·")
                print(f"  {role_icon} Étape {step['step']}: {step['skill_name']}")
                if step.get("script"):
                    print(f"    Script : {step['script']}")
                if step.get("requires_env"):
                    print(f"    Env    : {', '.join(step['requires_env'])}")
                if step.get("score"):
                    print(f"    Score  : {step['score']}")

        if result.get("suggestion"):
            print(f"\n  ⚠ {result['suggestion']}")

        print(f"\n{'='*60}\n")


if __name__ == "__main__":
    main()
