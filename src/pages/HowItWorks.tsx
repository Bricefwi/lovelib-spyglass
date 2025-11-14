import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { 
  Sparkles, 
  TrendingUp, 
  Shield, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  Users,
  BarChart3,
  Rocket,
  Target,
  Award,
  Clock
} from "lucide-react";

export const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Comment ça marche ? | Audit Digital IA - IMOTION</title>
        <meta
          name="description"
          content="Découvrez comment notre IA analyse votre site web en 3 étapes simples. 17 agents spécialisés, validation SIRET, rapport détaillé. 3 audits gratuits pour démarrer."
        />
        <meta
          name="keywords"
          content="audit digital IA, analyse site web, intelligence artificielle, MANUS IA, rapport marketing, validation SIRET, audit gratuit"
        />
        <meta property="og:title" content="Comment ça marche ? | Audit Digital IA" />
        <meta
          property="og:description"
          content="3 étapes simples : Inscrivez-vous, Validez votre entreprise, Lancez l'analyse IA. 3 audits gratuits sans carte bancaire."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://votre-site.com/how-it-works" />
      </Helmet>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/10">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge className="mb-6 text-lg px-6 py-2">
            <Sparkles className="mr-2 h-5 w-5" />
            Comment ça marche ?
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Votre Audit Digital en 3 Étapes Simples
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Découvrez comment notre intelligence artificielle analyse votre entreprise 
            et génère un rapport ultra-détaillé pour booster votre transformation digitale.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8 py-6">
              <Rocket className="mr-2 h-5 w-5" />
              Démarrer Gratuitement
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/#audit')} className="text-lg px-8 py-6">
              Voir un Exemple
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20 px-6 bg-accent/5">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-16">
            Le Processus en 3 Étapes
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card className="relative overflow-hidden border-2 hover:border-primary transition-all hover:shadow-xl">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-primary/60" />
              <CardContent className="pt-12 pb-8">
                <div className="mb-6 relative">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Users className="h-10 w-10 text-primary" />
                  </div>
                  <Badge className="absolute -top-2 -right-2 text-2xl font-bold px-4 py-2">1</Badge>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center">Inscrivez-vous</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Créez votre compte en 30 secondes. Confirmez votre email et identifiez votre entreprise avec votre SIRET.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Validation SIRET automatique</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Données légales pré-remplies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Score de confiance calculé</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="relative overflow-hidden border-2 hover:border-primary transition-all hover:shadow-xl">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-primary/60" />
              <CardContent className="pt-12 pb-8">
                <div className="mb-6 relative">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Sparkles className="h-10 w-10 text-primary" />
                  </div>
                  <Badge className="absolute -top-2 -right-2 text-2xl font-bold px-4 py-2">2</Badge>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center">Lancez l'Audit</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Saisissez l'URL de votre site. Nos 17 agents IA analysent votre entreprise en profondeur pendant 2 semaines.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">3 audits gratuits inclus</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Analyse multi-sources (web, réseaux sociaux, presse)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Suivi en temps réel de la progression</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="relative overflow-hidden border-2 hover:border-primary transition-all hover:shadow-xl">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-primary/60" />
              <CardContent className="pt-12 pb-8">
                <div className="mb-6 relative">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <BarChart3 className="h-10 w-10 text-primary" />
                  </div>
                  <Badge className="absolute -top-2 -right-2 text-2xl font-bold px-4 py-2">3</Badge>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center">Recevez le Rapport</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Consultez votre rapport ultra-détaillé par email. Téléchargez-le en PDF et passez à l'action !
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Rapport de 50+ pages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">4 scénarios chiffrés avec ROI</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Plan d'action prioritaire</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Ce que Vous Obtenez
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Un rapport complet généré par 17 agents IA spécialisés, 
              orchestrés par notre système MANUS IA 2.0
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 hover:border-primary transition-all">
              <CardContent className="pt-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Analyse de Marché Approfondie</h3>
                    <p className="text-muted-foreground">
                      PESTEL, Porter, SWOT, benchmark concurrentiel 2025, 
                      opportunités sectorielles identifiées par nos agents spécialisés.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all">
              <CardContent className="pt-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Stratégie Digitale Personnalisée</h3>
                    <p className="text-muted-foreground">
                      Recommandations SEO/SEA, stratégie de contenu, 
                      plan d'acquisition client adapté à votre secteur.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all">
              <CardContent className="pt-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">4 Scénarios Chiffrés</h3>
                    <p className="text-muted-foreground">
                      Ambitieux, Raisonné, Opportuniste, Mix - Chacun avec budget détaillé, 
                      timeline, ROI projeté et KPIs de suivi.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all">
              <CardContent className="pt-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Plan d'Action Prioritaire</h3>
                    <p className="text-muted-foreground">
                      Quick wins identifiés, roadmap détaillée, 
                      recommandations d'outils et de partenaires.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Technology */}
      <section className="py-20 px-6 bg-accent/5">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4">
                <Sparkles className="mr-2 h-4 w-4" />
                Technologie IA Avancée
              </Badge>
              <h2 className="text-4xl font-bold mb-6">
                17 Agents IA Orchestrés par MANUS IA 2.0
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Notre système d'orchestration multi-agent coordonne 17 intelligences artificielles 
                spécialisées pour analyser votre entreprise sous tous les angles.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Data Hunter</h4>
                    <p className="text-sm text-muted-foreground">
                      Collecte automatique de données depuis votre site, réseaux sociaux et sources publiques
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">PESTEL & Porter Analysts</h4>
                    <p className="text-sm text-muted-foreground">
                      Analyse macro-économique et forces concurrentielles de votre secteur
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Digital Strategy Architect</h4>
                    <p className="text-sm text-muted-foreground">
                      Conception de stratégies digitales personnalisées et actionnables
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">ROI Calculator & Report Writer</h4>
                    <p className="text-sm text-muted-foreground">
                      Calculs financiers précis et rédaction de rapports professionnels
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <Card className="p-8 border-2 border-primary/20 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                    <span className="font-semibold">Phase 1: Collecte</span>
                    <Badge variant="secondary">3 agents</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                    <span className="font-semibold">Phase 2: Analyse Marché</span>
                    <Badge variant="secondary">6 agents</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-primary/15 rounded-lg">
                    <span className="font-semibold">Phase 3: Stratégie</span>
                    <Badge variant="secondary">5 agents</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-primary/20 rounded-lg">
                    <span className="font-semibold">Phase 4: Synthèse</span>
                    <Badge variant="secondary">3 agents</Badge>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Qualité du rapport</span>
                      <span className="font-bold text-primary">98%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary rounded-full h-2" style={{ width: '98%' }} />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Trust */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4">
              <Shield className="mr-2 h-4 w-4" />
              Sécurité & Confiance
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              Vos Données en Sécurité
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Nous prenons la sécurité de vos données très au sérieux. 
              Validation d'entreprise, anti-abus et conformité RGPD.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Validation SIRET</h3>
              <p className="text-muted-foreground">
                Vérification automatique via l'API officielle de l'INSEE. 
                Seules les entreprises légales peuvent s'inscrire.
              </p>
            </Card>

            <Card className="text-center p-8">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Score de Confiance</h3>
              <p className="text-muted-foreground">
                Calcul automatique basé sur vos informations (SIRET, email pro, documents). 
                Modération manuelle si nécessaire.
              </p>
            </Card>

            <Card className="text-center p-8">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Rate Limiting</h3>
              <p className="text-muted-foreground">
                Protection anti-abus : 10 tentatives maximum par heure. 
                Détection automatique des comportements suspects.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            Commencez Gratuitement Aujourd'hui
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            3 audits gratuits inclus pour tester notre technologie. 
            Aucune carte bancaire requise.
          </p>
          
          <div className="flex gap-6 justify-center items-center mb-8 flex-wrap">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">3</div>
              <div className="text-sm text-muted-foreground">Audits Gratuits</div>
            </div>
            <div className="text-4xl text-muted-foreground">•</div>
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">17</div>
              <div className="text-sm text-muted-foreground">Agents IA</div>
            </div>
            <div className="text-4xl text-muted-foreground">•</div>
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">50+</div>
              <div className="text-sm text-muted-foreground">Pages de Rapport</div>
            </div>
          </div>

          <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-12 py-6">
            <Rocket className="mr-2 h-6 w-6" />
            Créer Mon Compte Gratuitement
          </Button>
          
          <p className="text-sm text-muted-foreground mt-4">
            Aucun engagement • Résultats en 2 semaines • Support inclus
          </p>
        </div>
      </section>

      {/* FAQ Quick */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-12">
            Questions Fréquentes
          </h2>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-2">
                Combien de temps prend l'analyse ?
              </h3>
              <p className="text-muted-foreground">
                L'audit approfondi prend environ 2 semaines. Nos 17 agents IA travaillent 
                en parallèle pour collecter, analyser et synthétiser toutes les données. 
                Vous pouvez suivre la progression en temps réel sur votre dashboard.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-2">
                Puis-je vraiment avoir 3 audits gratuits ?
              </h3>
              <p className="text-muted-foreground">
                Oui ! Après validation de votre SIRET, vous bénéficiez de 3 audits gratuits. 
                Aucune carte bancaire n'est requise. C'est notre façon de vous faire découvrir 
                la puissance de notre technologie.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-2">
                Mes données sont-elles sécurisées ?
              </h3>
              <p className="text-muted-foreground">
                Absolument. Nous utilisons le chiffrement de bout en bout, la validation SIRET 
                officielle, et un système de score de confiance. Toutes vos données sont stockées 
                de manière sécurisée et conforme au RGPD.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-2">
                Que se passe-t-il après les 3 audits gratuits ?
              </h3>
              <p className="text-muted-foreground">
                Vous pouvez continuer avec nos offres premium pour des audits illimités, 
                des fonctionnalités avancées, et un support prioritaire. Consultez notre 
                page tarifs pour plus de détails.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Prêt à Transformer Votre Entreprise ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez les centaines d'entreprises qui ont déjà boosté leur stratégie digitale 
            grâce à notre technologie IA.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={() => navigate('/auth')} 
            className="text-lg px-12 py-6"
          >
            <Sparkles className="mr-2 h-6 w-6" />
            Commencer Mon Premier Audit Gratuit
          </Button>
        </div>
      </section>
      </div>
      <Footer />
    </>
  );
};
