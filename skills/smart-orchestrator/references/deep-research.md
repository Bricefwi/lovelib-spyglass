# Deep Research (Gemini)

Recherche autonome multi-étapes via Google Gemini Deep Research Agent. Produit des rapports détaillés avec citations.

## Prérequis

```bash
export GEMINI_API_KEY=your-key
pip install httpx
```

## Commandes

```bash
# Recherche simple
python3 scripts/deep_research/research.py --query "Research the history of Kubernetes"

# Avec format structuré
python3 scripts/deep_research/research.py --query "Compare Python web frameworks" \
  --format "1. Executive Summary\n2. Comparison Table\n3. Recommendations"

# Streaming en temps réel
python3 scripts/deep_research/research.py --query "Analyze EV battery market" --stream

# Lancer sans attendre
python3 scripts/deep_research/research.py --query "Research topic" --no-wait

# Vérifier le statut
python3 scripts/deep_research/research.py --status <interaction_id>

# Attendre la complétion
python3 scripts/deep_research/research.py --wait <interaction_id>
```

## Notes

- Durée typique : 2-10 minutes selon la complexité
- Produit des rapports Markdown avec citations
- Supporte les requêtes en français et anglais
