import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqEntry {
  question: string;
  answer_html: string;
  tags: string[];
}

const FAQ = () => {
  const [faqs, setFaqs] = useState<FaqEntry[]>([]);
  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFaqs = async () => {
      const { data, error } = await supabase
        .from('faq_entries')
        .select('question, answer_html, tags')
        .order('order_index');
      
      if (error) {
        console.error('Error fetching FAQs:', error);
      } else {
        setFaqs(data || []);
      }
    };

    fetchFaqs();
  }, []);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAiAnswer("");

    try {
      const { data, error } = await supabase.functions.invoke('faq-assistant', {
        body: { question }
      });

      if (error) throw error;

      setAiAnswer(data.answer || "Désolé, je n'ai pas pu générer une réponse.");
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de contacter l'assistant IA",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-32 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            Foire Aux Questions
          </h1>
          <p className="text-xl text-muted-foreground">
            Retrouvez les réponses aux questions les plus fréquentes sur nos services
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border-2 border-border rounded-lg px-6 data-[state=open]:border-primary/50"
            >
              <AccordionTrigger className="text-left text-lg font-semibold hover:text-primary transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pt-2">
                <div dangerouslySetInnerHTML={{ __html: faq.answer_html }} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-16 bg-muted/50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-3 text-foreground">
            Assistant IA Technique
          </h2>
          <p className="text-muted-foreground mb-6">
            Posez vos questions sur les formules, méthodes de calcul et KPIs marketing/commerciaux
          </p>
          <form onSubmit={handleAskAI} className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Votre question technique..."
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                {loading ? "Réflexion..." : "Interroger"}
              </Button>
            </div>
            {aiAnswer && (
              <div className="bg-background border rounded-lg p-6 mt-4">
                <div dangerouslySetInnerHTML={{ __html: aiAnswer }} />
              </div>
            )}
          </form>
        </div>

        <div className="mt-16 bg-muted/50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3 text-foreground">
            Vous ne trouvez pas votre réponse ?
          </h2>
          <p className="text-muted-foreground mb-6">
            Notre équipe est à votre disposition pour répondre à toutes vos questions
          </p>
          <a 
            href="/contact" 
            className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Nous contacter
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
