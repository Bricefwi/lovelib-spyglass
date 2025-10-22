export const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-12 px-6 bg-secondary/5">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4 text-primary">IMOTION Conseil</h3>
            <p className="text-sm text-muted-foreground">
              Conseil Marketing & Commercial augmenté par l'IA
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Produit</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Pré-audit</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Rapports</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Intégrations</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Tarifs</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Ressources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Guides</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Support</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Légal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Mentions légales</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">CGU</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Confidentialité</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">RGPD</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 IMOTION Conseil. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};
