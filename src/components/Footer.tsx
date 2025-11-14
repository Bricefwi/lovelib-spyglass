import logoImotion from "@/assets/logo-imotion.png";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-16" id="contact">
      <div className="container mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img 
                src={logoImotion} 
                alt="IMOTION Logo" 
                className="h-16 w-auto"
              />
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Conseil & Performance augmenté par l'IA. Transformez vos défis marketing et commerciaux en succès mesurables.
            </p>
          </div>

          {/* Blog */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground text-sm">Blog</h4>
            <ul className="space-y-3">
              <li><a href="/blog" className="text-muted-foreground hover:text-primary transition-colors text-sm">Articles</a></li>
              <li><a href="/audit-methodologie" className="text-muted-foreground hover:text-primary transition-colors text-sm">Méthodologie d'audit</a></li>
              <li><a href="/calculs-kpis" className="text-muted-foreground hover:text-primary transition-colors text-sm">Calculs & KPIs</a></li>
              <li><a href="/methodologie-roi" className="text-muted-foreground hover:text-primary transition-colors text-sm">Méthodologie ROI</a></li>
            </ul>
          </div>

          {/* Guide */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground text-sm">Guide</h4>
            <ul className="space-y-3">
              <li><a href="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors text-sm">Comment ça marche</a></li>
              <li><a href="/guide/support" className="text-muted-foreground hover:text-primary transition-colors text-sm">Support technique</a></li>
              <li><a href="/faq" className="text-muted-foreground hover:text-primary transition-colors text-sm">FAQ technique</a></li>
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground text-sm">Solutions</h4>
            <ul className="space-y-3">
              <li><a href="/solutions" className="text-muted-foreground hover:text-primary transition-colors text-sm">Nos solutions</a></li>
              <li><a href="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">Nous contacter</a></li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground text-sm">Légal</h4>
            <ul className="space-y-3">
              <li><a href="/legal/mentions" className="text-muted-foreground hover:text-primary transition-colors text-sm">Mentions légales</a></li>
              <li><a href="/legal/rgpd" className="text-muted-foreground hover:text-primary transition-colors text-sm">Politique RGPD</a></li>
              <li><a href="/legal/cgu" className="text-muted-foreground hover:text-primary transition-colors text-sm">CGU</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © 2025 IMOTION Conseil & Performance. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};
