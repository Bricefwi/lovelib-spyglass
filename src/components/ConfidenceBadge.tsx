import { ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface ConfidenceBadgeProps {
  score: number;
}

export function ConfidenceBadge({ score }: ConfidenceBadgeProps) {
  const getConfidenceConfig = (score: number) => {
    if (score >= 95) {
      return {
        color: "bg-green-100 text-green-700 border-green-200",
        icon: ShieldCheck,
        label: "Certifié",
        explanation: "Données croisées avec sources officielles (INSEE) et web temps réel. Fiabilité maximale.",
      };
    } else if (score >= 80) {
      return {
        color: "bg-blue-100 text-blue-700 border-blue-200",
        icon: CheckCircle2,
        label: "Très Fiable",
        explanation: "Données web corroborées par plusieurs sources. Analyse sémantique forte.",
      };
    } else {
      return {
        color: "bg-orange-100 text-orange-700 border-orange-200",
        icon: AlertTriangle,
        label: "Estimation IA",
        explanation: "Données extrapolées ou sources partielles. Vérification humaine conseillée.",
      };
    }
  };

  const config = getConfidenceConfig(score);
  const Icon = config.icon;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Badge className={`${config.color} cursor-help`}>
          <Icon className="h-3 w-3 mr-1" />
          {config.label} ({score}%)
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <h4 className="font-semibold">{config.label}</h4>
          </div>
          <p className="text-sm text-muted-foreground">{config.explanation}</p>
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Score de confiance: {score}%
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
