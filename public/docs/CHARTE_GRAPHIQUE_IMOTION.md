# Charte Graphique IMOTION
## Guide de Style Complet pour Tous les Supports

---

## 1. IDENTITÉ VISUELLE

### 1.1 Logos

| Type | Fichier | Usage |
|------|---------|-------|
| Logo Principal | `/assets/LogoIMOTION.png` | En-têtes, documents officiels |
| Logo Compact | `/assets/LogoIMOTIONv2.png` | Favicon, espaces réduits |
| Logo SVG | `/assets/logo/imotion-logo-2025.svg` | Web, haute résolution |

**Règles d'utilisation :**
- Zone de protection : minimum 20px autour du logo
- Taille minimale : 80px de largeur
- Ne jamais déformer, incliner ou modifier les couleurs du logo

---

## 2. PALETTE DE COULEURS

### 2.1 Couleurs Principales

| Couleur | HEX | HSL | Usage |
|---------|-----|-----|-------|
| **Rouge IMOTION** | `#d8232a` | `hsl(357, 73%, 49%)` | Couleur signature, CTAs, accents |
| **Rouge Foncé** | `#b01d23` | `hsl(357, 71%, 40%)` | Hover states, profondeur |
| **Rouge Clair** | `#ff4d54` | `hsl(357, 100%, 65%)` | Gradients, highlights |

### 2.2 Couleurs Neutres

| Couleur | HEX | HSL | Usage |
|---------|-----|-----|-------|
| **Noir Corporate** | `#1a1a1a` | `hsl(0, 0%, 10%)` | Textes principaux |
| **Gris Texte** | `#666666` | `hsl(0, 0%, 40%)` | Textes secondaires |
| **Gris Discret** | `#999999` | `hsl(0, 0%, 60%)` | Labels, placeholders |
| **Blanc Principal** | `#ffffff` | `hsl(0, 0%, 100%)` | Fonds principaux |
| **Gris Fond** | `#f5f5f5` | `hsl(0, 0%, 96%)` | Cards, sections |
| **Gris Très Clair** | `#fafafa` | `hsl(0, 0%, 98%)` | Fonds subtils |

### 2.3 Couleurs de Statut

| Statut | HEX | Usage |
|--------|-----|-------|
| **Succès** | `#10b981` | Validations, confirmations |
| **Avertissement** | `#f59e0b` | Alertes modérées |
| **Erreur** | `#ef4444` | Erreurs, actions critiques |
| **Information** | `#3b82f6` | Messages informatifs |

### 2.4 Gradients

```css
/* Gradient Principal */
background: linear-gradient(135deg, #d8232a 0%, #ff4d54 100%);

/* Gradient Subtil (pour fonds) */
background: linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%);

/* Gradient Premium */
background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%);
```

---

## 3. TYPOGRAPHIE

### 3.1 Famille de Polices

| Type | Police | Fallback |
|------|--------|----------|
| **Principale** | Inter | -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif |
| **Monospace** | Fira Code | "Courier New", monospace |

### 3.2 Échelle Typographique

| Nom | Taille | Line-Height | Usage |
|-----|--------|-------------|-------|
| **5xl** | 48px / 3rem | 1.1 | Titres héro |
| **4xl** | 36px / 2.25rem | 1.15 | H1 pages |
| **3xl** | 30px / 1.875rem | 1.2 | H2 sections |
| **2xl** | 24px / 1.5rem | 1.25 | H3 sous-sections |
| **xl** | 20px / 1.25rem | 1.3 | H4, leads |
| **lg** | 18px / 1.125rem | 1.4 | Grands paragraphes |
| **base** | 16px / 1rem | 1.5 | Corps de texte |
| **sm** | 14px / 0.875rem | 1.5 | Labels, métadonnées |
| **xs** | 12px / 0.75rem | 1.5 | Mentions légales |

### 3.3 Graisses

| Poids | Valeur | Usage |
|-------|--------|-------|
| Regular | 400 | Corps de texte |
| Medium | 500 | Sous-titres, labels |
| Semibold | 600 | Boutons, navigation |
| Bold | 700 | Titres |
| Extrabold | 800 | Impact, héros |

### 3.4 Espacement des Lettres

| Type | Valeur | Usage |
|------|--------|-------|
| Tight | -0.025em | Grands titres |
| Normal | 0 | Corps de texte |
| Wide | 0.025em | Sous-titres |
| Wider | 0.05em | Labels uppercase |
| Widest | 0.1em | Badges, tags |

---

## 4. ESPACEMENT & LAYOUT

### 4.1 Système d'Espacement

| Token | Valeur | Usage |
|-------|--------|-------|
| **xs** | 4px / 0.25rem | Micro-espacements |
| **sm** | 8px / 0.5rem | Entre éléments proches |
| **md** | 16px / 1rem | Padding standard |
| **lg** | 24px / 1.5rem | Sections internes |
| **xl** | 32px / 2rem | Entre sections |
| **2xl** | 48px / 3rem | Grandes séparations |
| **3xl** | 64px / 4rem | Header/Footer |

### 4.2 Border Radius

| Token | Valeur | Usage |
|-------|--------|-------|
| **sm** | 4px | Inputs, petits éléments |
| **md** | 8px | Boutons, cards |
| **lg** | 12px | Modals, panels |
| **xl** | 16px | Grandes cards |
| **full** | 9999px | Badges, avatars |

### 4.3 Ombres

```css
/* Légère */
box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

/* Moyenne */
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

/* Forte */
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

/* Extra-forte */
box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

/* Glow Rouge IMOTION */
box-shadow: 0 0 40px rgba(216, 35, 42, 0.3);
```

---

## 5. COMPOSANTS UI

### 5.1 Boutons

#### Bouton Principal (Primary)
```css
background: #d8232a;
color: #ffffff;
padding: 12px 24px;
border-radius: 8px;
font-weight: 600;
transition: all 0.2s ease;

/* Hover */
background: #b01d23;
transform: translateY(-1px);
box-shadow: 0 4px 12px rgba(216, 35, 42, 0.3);
```

#### Bouton Secondaire (Secondary)
```css
background: transparent;
color: #d8232a;
border: 2px solid #d8232a;
padding: 10px 22px;
border-radius: 8px;
font-weight: 600;

/* Hover */
background: rgba(216, 35, 42, 0.1);
```

#### Bouton Ghost
```css
background: transparent;
color: #666666;
padding: 12px 24px;
border-radius: 8px;

/* Hover */
background: #f5f5f5;
color: #1a1a1a;
```

### 5.2 Cards

```css
background: #ffffff;
border: 1px solid #e0e0e0;
border-radius: 12px;
padding: 24px;
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

/* Hover (si interactive) */
border-color: #d8232a;
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
```

### 5.3 Inputs

```css
background: #ffffff;
border: 1px solid #e0e0e0;
border-radius: 8px;
padding: 12px 16px;
font-size: 16px;
color: #1a1a1a;

/* Focus */
border-color: #d8232a;
box-shadow: 0 0 0 3px rgba(216, 35, 42, 0.1);
outline: none;

/* Placeholder */
color: #999999;
```

### 5.4 Badges de Statut

```css
/* Succès */
background: #10b981;
color: #ffffff;
padding: 4px 12px;
border-radius: 9999px;
font-size: 12px;
font-weight: 600;

/* Warning */
background: #f59e0b;

/* Error */
background: #ef4444;

/* Info / IMOTION */
background: #d8232a;
```

---

## 6. DOCUMENTS PDF

### 6.1 Format et Marges

| Paramètre | Valeur |
|-----------|--------|
| Format | A4 (210 × 297 mm) |
| Orientation | Portrait |
| Marge Haute | 20mm |
| Marge Basse | 20mm |
| Marge Gauche | 20mm |
| Marge Droite | 20mm |

### 6.2 Structure Type

```
┌────────────────────────────────────┐
│ HEADER                             │
│ ┌─────────┐        Date            │
│ │  LOGO   │        Titre Document  │
│ └─────────┘                        │
├────────────────────────────────────┤
│                                    │
│ CONTENU PRINCIPAL                  │
│                                    │
│ • Sections avec H2 en rouge        │
│ • Texte en noir corporate          │
│ • Tableaux avec bordures grises    │
│ • Graphiques avec palette IMOTION  │
│                                    │
├────────────────────────────────────┤
│ FOOTER                             │
│ IMOTION | contact@imotion.fr       │
│ Page X/Y                           │
└────────────────────────────────────┘
```

### 6.3 Styles PDF

```css
/* En-tête de section */
h2 {
  color: #d8232a;
  font-size: 18px;
  font-weight: 700;
  border-bottom: 2px solid #d8232a;
  padding-bottom: 8px;
  margin-bottom: 16px;
}

/* Tableaux */
table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #d8232a;
  color: #ffffff;
  padding: 12px;
  text-align: left;
}

td {
  border: 1px solid #e0e0e0;
  padding: 12px;
}

tr:nth-child(even) {
  background: #f5f5f5;
}
```

---

## 7. EMAILS HTML

### 7.1 Structure Email

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Inter, -apple-system, sans-serif;">
  
  <!-- Container Principal -->
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
    
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #d8232a, #ff4d54); padding: 32px; text-align: center;">
        <img src="logo.png" alt="IMOTION" width="150">
      </td>
    </tr>
    
    <!-- Contenu -->
    <tr>
      <td style="background: #ffffff; padding: 32px;">
        <h1 style="color: #1a1a1a; font-size: 24px; margin: 0 0 16px;">
          Titre du mail
        </h1>
        <p style="color: #666666; font-size: 16px; line-height: 1.6;">
          Contenu du message...
        </p>
        
        <!-- CTA Button -->
        <a href="#" style="display: inline-block; background: #d8232a; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 24px;">
          Appel à l'action
        </a>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="background: #1a1a1a; padding: 24px; text-align: center;">
        <p style="color: #999999; font-size: 14px; margin: 0;">
          © 2024 IMOTION - AI No-Code Solutions
        </p>
        <p style="color: #666666; font-size: 12px; margin: 8px 0 0;">
          contact@imotion.fr | imotion.fr
        </p>
      </td>
    </tr>
    
  </table>
</body>
</html>
```

### 7.2 Types d'Emails

| Type | Objet | Couleur Accent |
|------|-------|----------------|
| **Bienvenue** | Bienvenue chez IMOTION | Rouge principal |
| **Audit Prêt** | Votre audit digital est prêt | Rouge principal |
| **Notification** | Notification IMOTION | Bleu info |
| **Alerte** | Action requise | Orange warning |
| **Confirmation** | Confirmation | Vert succès |

---

## 8. TEMPLATES HTML (Rapports)

### 8.1 Structure Rapport Audit

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport d'Audit Digital - IMOTION</title>
  <style>
    :root {
      --imotion-red: #d8232a;
      --imotion-dark: #1a1a1a;
      --imotion-gray: #666666;
      --imotion-light: #f5f5f5;
    }
    
    body {
      font-family: Inter, sans-serif;
      color: var(--imotion-dark);
      line-height: 1.6;
      margin: 0;
      padding: 40px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid var(--imotion-red);
      padding-bottom: 24px;
      margin-bottom: 40px;
    }
    
    .section {
      margin-bottom: 48px;
    }
    
    .section-title {
      color: var(--imotion-red);
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 2px solid var(--imotion-light);
    }
    
    .score-card {
      background: var(--imotion-light);
      border-radius: 12px;
      padding: 24px;
      text-align: center;
    }
    
    .score-value {
      font-size: 48px;
      font-weight: 800;
      color: var(--imotion-red);
    }
    
    .recommendation {
      border-left: 4px solid var(--imotion-red);
      padding-left: 16px;
      margin: 16px 0;
    }
    
    .footer {
      margin-top: 64px;
      padding-top: 24px;
      border-top: 1px solid var(--imotion-light);
      text-align: center;
      color: var(--imotion-gray);
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="logo.png" alt="IMOTION" height="50">
    <div>
      <strong>Rapport d'Audit Digital</strong><br>
      <span style="color: #666;">Généré le {{date}}</span>
    </div>
  </div>
  
  <!-- Sections du rapport -->
  
  <div class="footer">
    <p><strong>IMOTION</strong> - AI No-Code Solutions</p>
    <p>contact@imotion.fr | imotion.fr</p>
  </div>
</body>
</html>
```

---

## 9. SITE WEB

### 9.1 Breakpoints Responsifs

| Breakpoint | Largeur | Usage |
|------------|---------|-------|
| **Mobile** | < 640px | Smartphones |
| **Tablet** | 640px - 1024px | Tablettes |
| **Desktop** | 1024px - 1280px | Laptops |
| **Large** | > 1280px | Grands écrans |

### 9.2 Container

```css
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

@media (max-width: 640px) {
  .container {
    padding: 0 16px;
  }
}
```

### 9.3 Navigation

```css
.nav {
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-link {
  color: #1a1a1a;
  font-weight: 500;
  padding: 8px 16px;
  transition: color 0.2s;
}

.nav-link:hover,
.nav-link.active {
  color: #d8232a;
}
```

### 9.4 Hero Section

```css
.hero {
  background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%);
  color: #ffffff;
  padding: 120px 0;
  text-align: center;
}

.hero-title {
  font-size: 56px;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin-bottom: 24px;
}

.hero-subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  margin: 0 auto 40px;
}
```

---

## 10. ACCESSIBILITÉ

### 10.1 Contraste Minimum

| Élément | Ratio Minimum | Standard |
|---------|---------------|----------|
| Texte corps | 4.5:1 | WCAG AA |
| Grands textes | 3:1 | WCAG AA |
| Éléments UI | 3:1 | WCAG AA |

### 10.2 Focus States

```css
:focus-visible {
  outline: 2px solid #d8232a;
  outline-offset: 2px;
}

button:focus-visible,
a:focus-visible {
  box-shadow: 0 0 0 3px rgba(216, 35, 42, 0.3);
}
```

### 10.3 Texte Alternatif

- Toujours fournir un `alt` descriptif pour les images
- Logo : `alt="IMOTION - AI No-Code Solutions"`
- Icônes décoratives : `alt=""` ou `aria-hidden="true"`

---

## 11. FICHIERS DE RÉFÉRENCE

### Code Source

| Fichier | Description |
|---------|-------------|
| `src/lib/brandConfig.ts` | Configuration centralisée des couleurs, typo, etc. |
| `src/index.css` | Variables CSS et tokens du design system |
| `tailwind.config.ts` | Configuration Tailwind avec palette IMOTION |
| `src/lib/templates/*.ts` | Templates HTML pour documents |

### Assets

| Fichier | Usage |
|---------|-------|
| `/assets/LogoIMOTION.png` | Logo principal |
| `/assets/LogoIMOTIONv2.png` | Logo compact |
| `/assets/logo/imotion-logo-2025.svg` | Logo vectoriel |
| `/assets/logo/imotion-favicon.png` | Favicon |

---

## 12. DO'S & DON'TS

### ✅ À FAIRE

- Utiliser la couleur rouge IMOTION `#d8232a` comme accent principal
- Maintenir un contraste élevé pour le texte
- Respecter les espacements définis
- Utiliser Inter comme police principale
- Appliquer les border-radius cohérents
- Toujours inclure le logo dans les en-têtes

### ❌ À ÉVITER

- Ne jamais utiliser d'autres teintes de rouge
- Ne pas déformer le logo
- Éviter les textes en majuscules longues
- Ne pas surcharger les pages d'éléments
- Éviter les gradients non définis
- Ne pas utiliser d'autres polices que celles définies

---

*Document mis à jour le : Décembre 2024*
*Version : 1.0*
*Contact : contact@imotion.fr*
