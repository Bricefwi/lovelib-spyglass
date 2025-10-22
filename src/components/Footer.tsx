export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-16" id="contact">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="currentColor" className="text-primary"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-foreground">IMOTION</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Conseil & Performance augmenté par l'IA. Transformez vos défis marketing et commerciaux en succès mesurables.
            </p>
          </div>

          {/* Blog */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground text-sm">Blog</h4>
            <ul className="space-y-3">
              <li><a href="#blog" className="text-muted-foreground hover:text-primary transition-colors text-sm">Articles & Cas clients</a></li>
              <li><a href="#blog" className="text-muted-foreground hover:text-primary transition-colors text-sm">Études de cas</a></li>
              <li><a href="#blog" className="text-muted-foreground hover:text-primary transition-colors text-sm">Infographies</a></li>
              <li><a href="#blog" className="text-muted-foreground hover:text-primary transition-colors text-sm">Chiffres clés secteur</a></li>
            </ul>
          </div>

          {/* Guide (FAQ) */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground text-sm">Guide</h4>
            <ul className="space-y-3">
              <li><a href="#faq" className="text-muted-foreground hover:text-primary transition-colors text-sm">FAQ Technique</a></li>
              <li><a href="#faq" className="text-muted-foreground hover:text-primary transition-colors text-sm">Méthodologie d'audit</a></li>
              <li><a href="#faq" className="text-muted-foreground hover:text-primary transition-colors text-sm">Calculs et KPIs</a></li>
              <li><a href="#faq" className="text-muted-foreground hover:text-primary transition-colors text-sm">Support technique</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground text-sm">Légal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Mentions légales</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Politique RGPD</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">CGU</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Contact</a></li>
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
