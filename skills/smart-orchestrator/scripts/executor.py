#!/usr/bin/env python3
"""
Smart Orchestrator - Exécuteur de Skills
Exécute le plan d'orchestration produit par le routeur.

Usage:
    python3 scripts/executor.py --plan '{"mode":"single","skills":["deep_research"],...}'
    python3 scripts/executor.py --prompt "Recherche les tendances IA" --auto
    python3 scripts/executor.py --check-env deep_research
"""

import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional

SKILL_DIR = Path(__file__).parent
BASE_DIR = SKILL_DIR.parent


def check_environment(skill_id: str) -> Dict:
    """Vérifie que les variables d'environnement requises sont présentes."""
    from router import SKILL_REGISTRY

    skill = SKILL_REGISTRY.get(skill_id)
    if not skill:
        return {"ok": False, "error": f"Skill '{skill_id}' inconnu"}

    missing = []
    for env_var in skill.get("requires_env", []):
        if not os.environ.get(env_var):
            missing.append(env_var)

    return {
        "ok": len(missing) == 0,
        "skill": skill_id,
        "skill_name": skill["name"],
        "missing_env": missing,
        "message": f"✅ {skill['name']} prêt" if not missing else f"❌ Variables manquantes : {', '.join(missing)}"
    }


def check_all_environments() -> List[Dict]:
    """Vérifie l'environnement pour tous les skills."""
    from router import SKILL_REGISTRY
    results = []
    for skill_id in SKILL_REGISTRY:
        results.append(check_environment(skill_id))
    return results


def execute_skill(skill_id: str, prompt: str, output_dir: str = "/tmp/orchestrator",
                  extra_args: Optional[List[str]] = None) -> Dict:
    """
    Exécute un skill individuel et retourne le résultat.

    Returns:
        Dict avec status, output, files, duration
    """
    from router import SKILL_REGISTRY

    skill = SKILL_REGISTRY.get(skill_id)
    if not skill:
        return {"status": "error", "error": f"Skill '{skill_id}' inconnu"}

    # Vérifier l'environnement
    env_check = check_environment(skill_id)
    if not env_check["ok"]:
        return {
            "status": "env_error",
            "error": env_check["message"],
            "missing_env": env_check["missing_env"],
            "suggestion": f"Configurez : export {' && export '.join(f'{v}=...' for v in env_check['missing_env'])}"
        }

    os.makedirs(output_dir, exist_ok=True)
    start_time = time.time()

    script = skill.get("script")
    if not script:
        # Skills sans script (manus, jules) - retourner les instructions
        return {
            "status": "instructions",
            "skill": skill_id,
            "skill_name": skill["name"],
            "message": f"Le skill {skill['name']} nécessite une exécution manuelle.",
            "instructions": get_manual_instructions(skill_id, prompt)
        }

    script_path = BASE_DIR / script
    if not script_path.exists():
        return {"status": "error", "error": f"Script introuvable : {script_path}"}

    # Construire la commande
    cmd = [sys.executable, str(script_path)]

    # Adapter les arguments selon le skill
    if skill_id == "deep_research":
        cmd.extend(["--query", prompt, "--stream"])
    elif skill_id == "notebooklm":
        cmd.extend([prompt])
    elif skill_id in ("postgres", "mysql"):
        cmd.extend(["--query", prompt])
    elif skill_id == "google_sheets":
        if extra_args:
            cmd.extend(extra_args)
        else:
            cmd.extend(["search", prompt])
    elif skill_id == "google_drive":
        if extra_args:
            cmd.extend(extra_args)
        else:
            cmd.extend(["search", prompt])
    elif skill_id == "google_docs":
        if extra_args:
            cmd.extend(extra_args)
        else:
            cmd.extend(["search", prompt])
    elif skill_id == "azure_devops":
        # Azure DevOps a plusieurs sous-scripts
        cmd = [sys.executable, str(BASE_DIR / "scripts/azure_devops/search.py"),
               "work-items", "--project", "default", "--query", prompt]

    if extra_args and skill_id not in ("google_sheets", "google_drive", "google_docs"):
        cmd.extend(extra_args)

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300,
            cwd=str(BASE_DIR)
        )

        duration = time.time() - start_time

        # Sauvegarder la sortie
        output_file = os.path.join(output_dir, f"{skill_id}_output.txt")
        with open(output_file, "w") as f:
            f.write(result.stdout)
            if result.stderr:
                f.write(f"\n--- STDERR ---\n{result.stderr}")

        return {
            "status": "success" if result.returncode == 0 else "error",
            "skill": skill_id,
            "skill_name": skill["name"],
            "output": result.stdout[:5000],
            "error": result.stderr[:2000] if result.returncode != 0 else None,
            "output_file": output_file,
            "duration": round(duration, 2),
            "return_code": result.returncode
        }

    except subprocess.TimeoutExpired:
        return {
            "status": "timeout",
            "skill": skill_id,
            "error": "Le skill a dépassé le délai d'exécution (300s)"
        }
    except Exception as e:
        return {
            "status": "error",
            "skill": skill_id,
            "error": str(e)
        }


def get_manual_instructions(skill_id: str, prompt: str) -> str:
    """Retourne les instructions manuelles pour les skills sans script."""
    instructions = {
        "manus": f"""# Délégation à Manus Agent
curl -s -X POST "https://api.manus.ai/v1/tasks" \\
  -H "API_KEY:$MANUS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{{"prompt": "{prompt}", "model": "manus-1.6-max"}}'

# Puis vérifier le statut avec le task_id retourné :
curl -s -X GET "https://api.manus.ai/v1/tasks/{{task_id}}" -H "API_KEY:$MANUS_API_KEY"
""",
        "jules": f"""# Délégation à Jules
# 1. Vérifier l'auth
jules remote list --repo

# 2. Créer la tâche
jules new "{prompt}"

# 3. Surveiller
jules remote list --session
"""
    }
    return instructions.get(skill_id, "Consultez la documentation du skill.")


def execute_chain(plan: Dict, prompt: str, output_dir: str = "/tmp/orchestrator") -> Dict:
    """Exécute une chaîne de skills séquentiellement."""
    results = []
    previous_output = None

    for step in plan.get("execution_plan", []):
        skill_id = step["skill_id"]
        step_prompt = prompt

        # Passer la sortie précédente comme contexte
        if previous_output:
            step_prompt = f"{prompt}\n\n--- Résultat précédent ---\n{previous_output[:2000]}"

        result = execute_skill(skill_id, step_prompt, output_dir)
        results.append(result)

        if result["status"] == "success":
            previous_output = result.get("output", "")
        elif result["status"] == "instructions":
            previous_output = result.get("instructions", "")
        else:
            # Arrêter la chaîne en cas d'erreur
            break

    return {
        "mode": "chain",
        "chain_name": plan.get("chain_name"),
        "steps_completed": len(results),
        "steps_total": len(plan.get("execution_plan", [])),
        "results": results,
        "success": all(r["status"] in ("success", "instructions") for r in results)
    }


def main():
    parser = argparse.ArgumentParser(description="Smart Orchestrator - Exécuteur")
    parser.add_argument("--plan", help="Plan JSON du routeur")
    parser.add_argument("--prompt", help="Prompt utilisateur (avec --auto)")
    parser.add_argument("--auto", action="store_true", help="Route + exécute automatiquement")
    parser.add_argument("--check-env", nargs="?", const="all", help="Vérifier l'environnement")
    parser.add_argument("--output-dir", default="/tmp/orchestrator", help="Répertoire de sortie")
    parser.add_argument("--json", action="store_true", help="Sortie JSON")

    args = parser.parse_args()

    # Mode vérification d'environnement
    if args.check_env:
        if args.check_env == "all":
            results = check_all_environments()
        else:
            results = [check_environment(args.check_env)]

        if args.json:
            print(json.dumps(results, indent=2, ensure_ascii=False))
        else:
            print(f"\n{'='*50}")
            print("  Vérification de l'environnement")
            print(f"{'='*50}")
            for r in results:
                print(f"  {r['message']}")
            print()
        return

    # Mode auto : route + exécute
    if args.auto and args.prompt:
        sys.path.insert(0, str(SKILL_DIR))
        from router import route

        plan = route(args.prompt)

        if plan["mode"] == "none":
            print(json.dumps(plan, indent=2, ensure_ascii=False) if args.json else f"\n⚠ {plan['suggestion']}\n")
            return

        if plan["mode"] == "chain":
            result = execute_chain(plan, args.prompt, args.output_dir)
        else:
            # Exécuter le skill principal
            primary_skill = plan["skills"][0]
            result = execute_skill(primary_skill, args.prompt, args.output_dir)

        if args.json:
            print(json.dumps(result, indent=2, ensure_ascii=False))
        else:
            print(json.dumps(result, indent=2, ensure_ascii=False))
        return

    # Mode plan fourni
    if args.plan:
        plan = json.loads(args.plan)
        if plan.get("mode") == "chain":
            result = execute_chain(plan, args.prompt or "", args.output_dir)
        else:
            primary_skill = plan["skills"][0]
            result = execute_skill(primary_skill, args.prompt or "", args.output_dir)

        print(json.dumps(result, indent=2, ensure_ascii=False))
        return

    parser.print_help()


if __name__ == "__main__":
    main()
