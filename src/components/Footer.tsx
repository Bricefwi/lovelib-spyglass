import { useNavigate } from "react-router-dom";
import { ImotionLogo } from "@/components/brand/ImotionLogo";

const columns = [
  {
    title: "Produit",
    links: [
      { label: "Fonctionnalités", href: "/solutions" },
      { label: "Tarifs", href: "/pricing" },
      { label: "Démo", href: "/audit-gratuit" },
      { label: "Roadmap", href: "/how-it-works" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Guides", href: "/audit-methodologie" },
      { label: "FAQ", href: "/faq" },
      { label: "Centre d'aide", href: "/guide/support" },
    ],
  },
  {
    title: "Société",
    links: [
      { label: "À propos", href: "/solutions" },
      { label: "Contact", href: "/contact" },
      { label: "Mentions légales", href: "/legal/mentions" },
      { label: "RGPD", href: "/legal/rgpd" },
    ],
  },
];

export const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer
      className="bg-[hsl(var(--ink-900))] text-[hsl(var(--ink-50))] relative overflow-hidden"
      id="contact"
    >
      {/* Top coral accent line */}
      <div className="h-1 w-full gradient-flame" />

      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Brand column */}
          <div className="md:col-span-4">
            <div className="cursor-pointer" onClick={() => navigate("/")}>
              <ImotionLogo tone="light" showTagline />
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-[hsl(var(--ink-300))]">
              L'IA qui transforme vos idées en cahiers des charges professionnels — gratuitement, en 45 minutes.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title} className="md:col-span-2">
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--ink-300))]">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      className="text-sm text-[hsl(var(--ink-100))] transition-colors hover:text-[hsl(var(--coral-400))]"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact column */}
          <div className="md:col-span-2">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--ink-300))]">
              Contact
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:contact@imotion-conseil.fr"
                  className="text-sm text-[hsl(var(--ink-100))] transition-colors hover:text-[hsl(var(--coral-400))]"
                >
                  contact@imotion-conseil.fr
                </a>
              </li>
              <li>
                <a
                  href="/legal/cgu"
                  className="text-sm text-[hsl(var(--ink-100))] transition-colors hover:text-[hsl(var(--coral-400))]"
                >
                  CGU
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-[hsl(var(--ink-700))] pt-6 md:flex-row md:items-center">
          <p className="text-xs text-[hsl(var(--ink-400))]">
            © 2026 IMOTION — AI No-Code Solutions
          </p>
          <p className="text-xs text-[hsl(var(--ink-400))]">
            contact@imotion-conseil.fr
          </p>
        </div>
      </div>
    </footer>
  );
};
