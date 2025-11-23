import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, TrendingUp, AlertTriangle, Clock, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { IMOTION_BRAND } from '@/lib/brandConfig';

interface StrategicOption {
  id: string;
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  estimated_impact: 'Faible' | 'Moyen' | 'Élevé' | 'Très Élevé';
  effort: 'Faible' | 'Moyen' | 'Élevé';
  timeline?: string;
}

interface StrategicChoiceSelectorProps {
  choiceId: string;
  auditId: string;
  contextSummary: string;
  options: StrategicOption[];
  onChoiceSelected: () => void;
}

export const StrategicChoiceSelector = ({
  choiceId,
  auditId,
  contextSummary,
  options,
  onChoiceSelected
}: StrategicChoiceSelectorProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectOption = async (optionId: string) => {
    setIsSubmitting(true);

    try {
      // 1. Sauvegarder le choix
      const { error: updateError } = await supabase
        .from('strategic_choices')
        .update({ 
          selected_option: optionId,
          selected_at: new Date().toISOString()
        })
        .eq('id', choiceId);

      if (updateError) throw updateError;

      // 2. Relancer l'orchestrateur avec le contexte du choix
      const { error: orchestrateError } = await supabase.functions.invoke('orchestrate-multi-agent', {
        body: { 
          audit_id: auditId,
          strategic_choice: optionId 
        }
      });

      if (orchestrateError) throw orchestrateError;

      toast.success('Stratégie sélectionnée', {
        description: 'L\'audit va reprendre avec cette orientation.'
      });

      setSelectedOption(optionId);
      onChoiceSelected();

    } catch (error: any) {
      console.error('Error selecting option:', error);
      toast.error('Erreur', {
        description: 'Impossible de valider votre choix. Réessayez.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Très Élevé': return 'hsl(var(--primary))';
      case 'Élevé': return 'hsl(var(--primary))';
      case 'Moyen': return 'hsl(220, 13%, 46%)';
      case 'Faible': return 'hsl(220, 9%, 65%)';
      default: return 'hsl(var(--muted))';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'Élevé': return 'hsl(0, 84%, 60%)';
      case 'Moyen': return 'hsl(38, 92%, 50%)';
      case 'Faible': return 'hsl(142, 76%, 36%)';
      default: return 'hsl(var(--muted))';
    }
  };

  // Couleurs de cartes différenciées (inspirées McKinsey/BCG)
  const cardThemes = [
    { 
      gradient: 'from-[#d8232a] to-[#b01d23]', // Rouge IMOTION (Offensive)
      icon: TrendingUp,
      label: 'Stratégie Offensive'
    },
    { 
      gradient: 'from-[#1a1a1a] to-[#404040]', // Noir Corporate (Défensive)
      icon: Zap,
      label: 'Stratégie Défensive'
    },
    { 
      gradient: 'from-[#3b82f6] to-[#1e40af]', // Bleu Profond (Innovation)
      icon: Clock,
      label: 'Stratégie d\'Innovation'
    }
  ];

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* En-tête Exécutif */}
        <div className="text-center mb-12">
          <img 
            src={IMOTION_BRAND.logos.main} 
            alt={IMOTION_BRAND.logos.alt}
            className="h-12 mx-auto mb-6"
          />
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Carrefour Stratégique
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
            {contextSummary}
          </p>
          <Badge variant="outline" className="text-sm px-4 py-2">
            Phase d'Orientation Stratégique
          </Badge>
        </div>

        {/* Les 3 Cartes Stratégiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {options.map((option, index) => {
            const theme = cardThemes[index];
            const Icon = theme.icon;
            const isSelected = selectedOption === option.id;

            return (
              <Card 
                key={option.id}
                className={`relative overflow-hidden transition-all duration-300 ${
                  isSelected 
                    ? 'ring-2 ring-primary shadow-2xl scale-105' 
                    : 'hover:shadow-xl hover:scale-102'
                }`}
              >
                {/* Bandeau coloré supérieur */}
                <div className={`h-2 bg-gradient-to-r ${theme.gradient}`} />
                
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${theme.gradient}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    {isSelected && (
                      <Badge className="bg-primary text-primary-foreground">
                        <Check className="h-3 w-3 mr-1" />
                        Sélectionné
                      </Badge>
                    )}
                  </div>
                  
                  <div>
                    <CardTitle className="text-xl mb-2">
                      {option.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      {theme.label}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-foreground leading-relaxed">
                    {option.description}
                  </p>

                  {/* Métriques */}
                  <div className="flex gap-2">
                    <Badge 
                      style={{ backgroundColor: getImpactColor(option.estimated_impact) }}
                      className="text-white"
                    >
                      Impact: {option.estimated_impact}
                    </Badge>
                    <Badge 
                      style={{ backgroundColor: getEffortColor(option.effort) }}
                      className="text-white"
                    >
                      Effort: {option.effort}
                    </Badge>
                  </div>

                  {option.timeline && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {option.timeline}
                    </div>
                  )}

                  {/* Avantages */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      Avantages
                    </h4>
                    <ul className="space-y-1">
                      {option.pros.map((pro, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Risques */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-orange-600" />
                      Risques
                    </h4>
                    <ul className="space-y-1">
                      {option.cons.map((con, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-orange-600 mt-0.5">!</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() => handleSelectOption(option.id)}
                    disabled={isSubmitting || selectedOption !== null}
                    className="w-full bg-gradient-to-r from-[#d8232a] to-[#b01d23] text-white hover:opacity-90 transition-opacity"
                  >
                    {isSubmitting && selectedOption === option.id 
                      ? 'Validation...' 
                      : isSelected
                      ? 'Stratégie Retenue'
                      : 'Choisir cette Stratégie'
                    }
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Footer Informatif */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            💡 Ce choix orientera l'ensemble de l'audit. Vous pourrez toujours explorer les autres options ultérieurement.
          </p>
        </div>
      </div>
    </div>
  );
};