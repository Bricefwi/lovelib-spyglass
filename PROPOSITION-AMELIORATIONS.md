# 🎯 PROPOSITION STRUCTURÉE DES AMÉLIORATIONS
## Application IMOTION Conseil & Performance

**Date:** 26 novembre 2025
**Version:** 1.0
**Durée estimée totale:** 6-8 semaines

---

## 📋 RÉSUMÉ EXÉCUTIF

Cette proposition détaille un plan d'amélioration en 4 phases pour renforcer la sécurité, la qualité et la performance de votre application. Chaque phase est conçue pour apporter des améliorations tangibles tout en minimisant les risques de régression.

**Investissement recommandé:** 6-8 semaines de développement
**ROI attendu:** Réduction de 80% des incidents de production, amélioration de 40% des performances

---

## 🎯 OBJECTIFS GLOBAUX

| Objectif | Avant | Après |
|----------|-------|-------|
| Score de sécurité | 5/10 | 9/10 |
| Couverture de tests | 0% | 70%+ |
| Vulnérabilités npm | 4 | 0 |
| Performance Lighthouse | ? | 90+ |
| Accessibilité | 7/10 | 9/10 |

---

# PHASE 1 : SÉCURITÉ CRITIQUE 🚨
**Durée:** 5-7 jours
**Priorité:** URGENTE
**Risque si non fait:** Exposition de données, failles de sécurité

## Tâches

### 1.1 Sécuriser les fichiers de configuration
**Temps estimé:** 1 heure
**Complexité:** Faible

#### Actions:
```bash
# 1. Ajouter .env au .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore

# 2. Créer .env.example
cat > .env.example << 'EOF'
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
VITE_SUPABASE_PROJECT_ID=your_project_id_here

# Optional: Sentry (pour le monitoring)
VITE_SENTRY_DSN=your_sentry_dsn_here
EOF

# 3. Supprimer .env de Git (garder le fichier local)
git rm --cached .env
git commit -m "security: remove .env from version control"

# 4. Nettoyer l'historique Git (OPTIONNEL mais recommandé)
# Attention: cette opération est destructive
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

#### Checklist de validation:
- [ ] `.env` ajouté au `.gitignore`
- [ ] `.env.example` créé avec des placeholders
- [ ] `.env` supprimé de l'historique Git
- [ ] Clés Supabase régénérées si exposées publiquement

---

### 1.2 Corriger les vulnérabilités npm
**Temps estimé:** 2-3 heures
**Complexité:** Moyenne

#### Actions:
```bash
# 1. Mettre à jour les dépendances vulnérables
npm audit fix --force

# 2. Si des conflits, mettre à jour manuellement
npm update vite@latest
npm update glob@latest

# 3. Vérifier qu'il n'y a plus de vulnérabilités
npm audit

# 4. Tester que l'application fonctionne toujours
npm run dev
npm run build
```

#### Checklist de validation:
- [ ] `npm audit` retourne 0 vulnérabilités
- [ ] L'application compile sans erreur
- [ ] Les tests passent (à créer en Phase 2)
- [ ] L'application fonctionne en dev et production

---

### 1.3 Protéger la route /audit-report/:id
**Temps estimé:** 2-3 heures
**Complexité:** Moyenne

#### Fichier: `src/App.tsx`
```typescript
// AVANT
<Route path="/audit-report/:id" element={<AuditReport />} />

// APRÈS
<Route
  path="/audit-report/:id"
  element={
    <ProtectedRoute requireAuth>
      <AuditReport />
    </ProtectedRoute>
  }
/>
```

#### Fichier: `src/pages/AuditReport.tsx`
Ajouter une vérification de propriété au début du composant:

```typescript
useEffect(() => {
  const verifyAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      navigate('/auth');
      return;
    }

    // Vérifier que l'utilisateur a le droit d'accéder à cet audit
    const { data: audit, error } = await supabase
      .from('pre_audits')
      .select('*')
      .eq('id', auditId)
      .eq('created_by', user.id)
      .single();

    if (error || !audit) {
      toast.error("Vous n'avez pas accès à ce rapport");
      navigate('/dashboard');
      return;
    }
  };

  verifyAccess();
}, [auditId, navigate]);
```

#### Checklist de validation:
- [ ] Route protégée avec `ProtectedRoute`
- [ ] Vérification de propriété implémentée
- [ ] Test manuel: utilisateur non authentifié redirigé
- [ ] Test manuel: utilisateur ne peut pas accéder aux audits d'autres users

---

### 1.4 Valider les variables d'environnement
**Temps estimé:** 1 heure
**Complexité:** Faible

#### Fichier: `src/integrations/supabase/client.ts`
```typescript
// AVANT
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// APRÈS
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    '❌ Configuration Error: Missing Supabase environment variables.\n\n' +
    'Required variables:\n' +
    '  - VITE_SUPABASE_URL\n' +
    '  - VITE_SUPABASE_PUBLISHABLE_KEY\n\n' +
    'Please check your .env file and ensure these variables are set.\n' +
    'See .env.example for reference.'
  );
}

// Validation du format URL
try {
  new URL(SUPABASE_URL);
} catch {
  throw new Error(
    '❌ Configuration Error: VITE_SUPABASE_URL is not a valid URL.\n' +
    `Received: ${SUPABASE_URL}`
  );
}

console.log('✅ Supabase configuration validated successfully');

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  // ...
});
```

#### Checklist de validation:
- [ ] Variables d'environnement validées au démarrage
- [ ] Message d'erreur clair si variables manquantes
- [ ] Validation du format URL
- [ ] Test: démarrage sans .env échoue avec message clair

---

## 📊 Résumé Phase 1

| Tâche | Temps | Complexité | Priorité |
|-------|-------|------------|----------|
| 1.1 Sécuriser .env | 1h | Faible | Critique |
| 1.2 Vulnérabilités npm | 2-3h | Moyenne | Critique |
| 1.3 Protéger route audit | 2-3h | Moyenne | Haute |
| 1.4 Valider env vars | 1h | Faible | Moyenne |
| **TOTAL** | **6-8h** | | |

**Livrables:**
- ✅ Fichiers de configuration sécurisés
- ✅ 0 vulnérabilités npm
- ✅ Routes d'audit protégées
- ✅ Validation des variables d'environnement

---

# PHASE 2 : QUALITÉ ET ROBUSTESSE 🔧
**Durée:** 2 semaines
**Priorité:** HAUTE
**Risque si non fait:** Bugs en production, maintenance difficile

## Tâches

### 2.1 Configurer React Query correctement
**Temps estimé:** 2-3 heures
**Complexité:** Moyenne

#### Fichier: `src/App.tsx`
```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { toast } from 'sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
      onError: (error: any) => {
        console.error('Mutation error:', error);
        const message = error?.message || 'Une erreur est survenue';
        toast.error(message);
      },
    },
  },
});

// Dans le render
<QueryClientProvider client={queryClient}>
  {/* ... votre app ... */}
  {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
</QueryClientProvider>
```

#### Installation des devtools:
```bash
npm install -D @tanstack/react-query-devtools
```

---

### 2.2 Créer un système de logging
**Temps estimé:** 3-4 heures
**Complexité:** Moyenne

#### Nouveau fichier: `src/lib/logger.ts`
```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMessage {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  context?: string;
}

class Logger {
  private isDev = import.meta.env.DEV;
  private logs: LogMessage[] = [];
  private maxLogs = 1000;

  private formatMessage(level: LogLevel, message: string, data?: any, context?: string) {
    const logMessage: LogMessage = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      context,
    };

    this.logs.push(logMessage);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    return logMessage;
  }

  debug(message: string, data?: any, context?: string) {
    const log = this.formatMessage('debug', message, data, context);
    if (this.isDev) {
      console.log(`[DEBUG] ${log.timestamp} ${context ? `[${context}]` : ''}`, message, data);
    }
  }

  info(message: string, data?: any, context?: string) {
    const log = this.formatMessage('info', message, data, context);
    if (this.isDev) {
      console.info(`[INFO] ${log.timestamp} ${context ? `[${context}]` : ''}`, message, data);
    }
  }

  warn(message: string, data?: any, context?: string) {
    const log = this.formatMessage('warn', message, data, context);
    console.warn(`[WARN] ${log.timestamp} ${context ? `[${context}]` : ''}`, message, data);
    // TODO: Envoyer à un service de monitoring en production
  }

  error(message: string, error?: any, context?: string) {
    const log = this.formatMessage('error', message, error, context);
    console.error(`[ERROR] ${log.timestamp} ${context ? `[${context}]` : ''}`, message, error);
    // TODO: Envoyer à Sentry en production
  }

  getLogs(level?: LogLevel): LogMessage[] {
    if (!level) return this.logs;
    return this.logs.filter(log => log.level === level);
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();
```

#### Migration des console.log:
```bash
# Script de remplacement automatique (à vérifier manuellement après)
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/console\.log/logger.debug/g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/console\.error/logger.error/g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/console\.warn/logger.warn/g'
```

---

### 2.3 Ajouter un Error Boundary
**Temps estimé:** 2-3 heures
**Complexité:** Moyenne

#### Nouveau fichier: `src/components/ErrorBoundary.tsx`
```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Error caught by boundary', error, 'ErrorBoundary');
    logger.error('Component stack', errorInfo.componentStack, 'ErrorBoundary');

    this.setState({
      error,
      errorInfo,
    });

    // TODO: Envoyer à Sentry
    // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4 text-foreground">
              Oups, une erreur est survenue
            </h1>
            <p className="text-muted-foreground mb-6">
              Nous sommes désolés pour ce désagrément. Notre équipe a été notifiée.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-destructive/10 rounded-md text-left">
                <p className="font-mono text-sm text-destructive mb-2">
                  {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-xs overflow-auto max-h-40">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button onClick={this.handleReset} variant="outline">
                Réessayer
              </Button>
              <Button onClick={() => window.location.href = '/'}>
                Retour à l'accueil
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### Intégration dans `src/App.tsx`:
```typescript
import { ErrorBoundary } from './components/ErrorBoundary';

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {/* ... reste du code ... */}
      </QueryClientProvider>
    </ErrorBoundary>
  );
};
```

---

### 2.4 Créer les premiers tests unitaires
**Temps estimé:** 5-7 jours
**Complexité:** Haute

#### Installation:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event jsdom @vitest/ui @testing-library/react-hooks
```

#### Configuration: `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

#### Setup: `src/test/setup.ts`
```typescript
import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup après chaque test
afterEach(() => {
  cleanup();
});

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

#### Tests prioritaires:

**1. Test de useUserRole**: `src/hooks/useUserRole.test.tsx`
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useUserRole } from './useUserRole';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client');

describe('useUserRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null role when no user is authenticated', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { result } = renderHook(() => useUserRole());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.role).toBeNull();
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isClient).toBe(false);
  });

  it('should return admin role for admin user', async () => {
    const mockUser = { id: 'user-1', email: 'admin@test.com' };

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { role: 'admin' },
            error: null,
          }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useUserRole());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.role).toBe('admin');
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isClient).toBe(false);
  });
});
```

**2. Test de ProtectedRoute**: `src/components/ProtectedRoute.test.tsx`
**3. Test de logger**: `src/lib/logger.test.ts`
**4. Test de pdfExport**: `src/lib/pdfExport.test.ts`

#### Scripts package.json:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  }
}
```

---

### 2.5 Améliorer TypeScript Configuration
**Temps estimé:** 1 journée (pour corriger les erreurs)
**Complexité:** Moyenne-Haute

#### Approche progressive:
```json
// Phase 2.5.1 - Activer strictNullChecks
{
  "compilerOptions": {
    "strictNullChecks": true,
    // Garder les autres options permissives temporairement
  }
}
```

Corriger les erreurs, puis:

```json
// Phase 2.5.2 - Activer noImplicitAny
{
  "compilerOptions": {
    "strictNullChecks": true,
    "noImplicitAny": true,
  }
}
```

Corriger les erreurs, puis:

```json
// Phase 2.5.3 - Configuration finale stricte
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true
  }
}
```

---

## 📊 Résumé Phase 2

| Tâche | Temps | Complexité | Priorité |
|-------|-------|------------|----------|
| 2.1 Config React Query | 2-3h | Moyenne | Haute |
| 2.2 Système de logging | 3-4h | Moyenne | Haute |
| 2.3 Error Boundary | 2-3h | Moyenne | Haute |
| 2.4 Tests unitaires | 5-7j | Haute | Haute |
| 2.5 TypeScript strict | 1j | Moyenne-Haute | Moyenne |
| **TOTAL** | **~2 semaines** | | |

**Livrables:**
- ✅ React Query configuré et optimisé
- ✅ Système de logging professionnel
- ✅ Error Boundary global
- ✅ 10+ tests unitaires écrits
- ✅ Configuration TypeScript plus stricte

---

# PHASE 3 : PERFORMANCE ET OPTIMISATION ⚡
**Durée:** 1-2 semaines
**Priorité:** MOYENNE
**Risque si non fait:** Expérience utilisateur dégradée

## Tâches

### 3.1 Implémenter le Code Splitting
**Temps estimé:** 1-2 jours
**Complexité:** Moyenne

#### Fichier: `src/App.tsx`
```typescript
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Routes publiques (chargement immédiat)
import Index from './pages/Index';
import Auth from './pages/Auth';
import Blog from './pages/Blog';

// Routes admin (lazy loading)
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminAudits = lazy(() => import('./pages/AdminAudits'));
const AdminBlog = lazy(() => import('./pages/AdminBlog'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminMessages = lazy(() => import('./pages/AdminMessages'));
const OrchestrationMonitor = lazy(() => import('./pages/OrchestrationMonitor'));
const VeilleIA = lazy(() => import('./pages/VeilleIA'));

// Routes client (lazy loading)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ClientAudits = lazy(() => import('./pages/ClientAudits'));
const ClientNewProject = lazy(() => import('./pages/ClientNewProject'));
const AuditReport = lazy(() => import('./pages/AuditReport'));

// Routes onboarding (lazy loading)
const Onboarding = lazy(() => import('./pages/Onboarding'));
const OnboardingCompany = lazy(() => import('./pages/OnboardingCompany'));

// Composant de chargement
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
      <p className="text-sm text-muted-foreground">Chargement...</p>
    </div>
  </div>
);

// Wrapper pour lazy loading
const LazyRoute = ({ component: Component }: { component: React.LazyExoticComponent<any> }) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

// Dans les routes
<Route
  path="/admin/dashboard"
  element={
    <LazyRoute component={() => (
      <ProtectedRoute requireAuth requireAdmin>
        <AdminDashboard />
      </ProtectedRoute>
    )} />
  }
/>
```

#### Analyse du bundle:
```bash
npm install -D rollup-plugin-visualizer
```

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});
```

---

### 3.2 Optimiser le hook useUserRole
**Temps estimé:** 3-4 heures
**Complexité:** Moyenne

#### Nouveau fichier: `src/hooks/useUserRole.tsx` (version optimisée)
```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export const useUserRole = () => {
  // Query pour la session
  const { data: session, refetch: refetchSession } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Query pour le rôle (dépend de la session)
  const { data: role, isLoading } = useQuery({
    queryKey: ['userRole', session?.user?.id],
    queryFn: async () => {
      if (!session?.user) return null;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching role:', error);
        return null;
      }

      return data?.role as AppRole || null;
    },
    enabled: !!session?.user,
    staleTime: 5 * 60 * 1000, // Cache pendant 5 minutes
    gcTime: 10 * 60 * 1000,
  });

  // Écouter les changements d'auth
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refetchSession();
    });

    return () => subscription.unsubscribe();
  }, [refetchSession]);

  return {
    role,
    loading: isLoading,
    isAdmin: role === 'admin',
    isClient: role === 'client',
  };
};
```

---

### 3.3 Ajouter Sentry pour le monitoring
**Temps estimé:** 1 journée
**Complexité:** Faible-Moyenne

#### Installation:
```bash
npm install @sentry/react
```

#### Configuration: `src/main.tsx`
```typescript
import * as Sentry from '@sentry/react';

// Initialiser Sentry avant React
if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event) {
      // Filtrer les erreurs non pertinentes
      if (event.exception) {
        const error = event.exception.values?.[0];
        // Ignorer certaines erreurs
        if (error?.value?.includes('ResizeObserver')) {
          return null;
        }
      }
      return event;
    },
  });
}

// Wrapper l'app avec Sentry
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>
);
```

#### Intégration dans logger:
```typescript
// src/lib/logger.ts
import * as Sentry from '@sentry/react';

error(message: string, error?: any, context?: string) {
  const log = this.formatMessage('error', message, error, context);
  console.error(`[ERROR] ${log.timestamp} ${context ? `[${context}]` : ''}`, message, error);

  // Envoyer à Sentry en production
  if (import.meta.env.PROD) {
    Sentry.captureException(error || new Error(message), {
      contexts: {
        custom: {
          context,
          timestamp: log.timestamp,
        },
      },
    });
  }
}
```

---

### 3.4 Optimisations diverses
**Temps estimé:** 2-3 jours
**Complexité:** Moyenne

#### 3.4.1 Memoïsation des composants lourds
```typescript
import { memo } from 'react';

// Avant
export const HeavyComponent = ({ data }: Props) => {
  // ...
};

// Après
export const HeavyComponent = memo(({ data }: Props) => {
  // ...
}, (prevProps, nextProps) => {
  return prevProps.data.id === nextProps.data.id;
});
```

#### 3.4.2 Optimisation des images
```bash
# Installer vite-plugin-image-optimizer
npm install -D vite-plugin-imagemin
```

```typescript
// vite.config.ts
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      png: {
        quality: 80,
      },
      jpeg: {
        quality: 80,
      },
    }),
  ],
});
```

#### 3.4.3 Préchargement des routes critiques
```typescript
// src/App.tsx
import { useEffect } from 'react';

// Précharger les routes importantes
useEffect(() => {
  // Précharger Dashboard après 2 secondes
  setTimeout(() => {
    import('./pages/Dashboard');
  }, 2000);

  // Précharger AuditReport après 4 secondes
  setTimeout(() => {
    import('./pages/AuditReport');
  }, 4000);
}, []);
```

---

## 📊 Résumé Phase 3

| Tâche | Temps | Complexité | Priorité |
|-------|-------|------------|----------|
| 3.1 Code Splitting | 1-2j | Moyenne | Haute |
| 3.2 Optimiser useUserRole | 3-4h | Moyenne | Moyenne |
| 3.3 Sentry monitoring | 1j | Faible-Moyenne | Haute |
| 3.4 Optimisations diverses | 2-3j | Moyenne | Moyenne |
| **TOTAL** | **~1-2 semaines** | | |

**Livrables:**
- ✅ Bundle optimisé avec code splitting
- ✅ Hook useUserRole avec mise en cache
- ✅ Monitoring avec Sentry
- ✅ Images optimisées
- ✅ Composants memoïsés

---

# PHASE 4 : QUALITÉ LONG TERME 🎓
**Durée:** 2-3 semaines
**Priorité:** BASSE (mais importante)
**Risque si non fait:** Dette technique

## Tâches

### 4.1 Augmenter la couverture de tests à 70%+
**Temps estimé:** 2-3 semaines
**Complexité:** Haute

#### Objectif:
- Tests unitaires: 70% de couverture
- Tests d'intégration: Tests des flows principaux
- Tests E2E: 3-5 parcours critiques

#### Tests E2E avec Playwright:
```bash
npm install -D @playwright/test
npx playwright install
```

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/auth');

  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
});
```

---

### 4.2 Audit d'accessibilité complet
**Temps estimé:** 1 semaine
**Complexité:** Moyenne

#### Installation:
```bash
npm install -D @axe-core/react
```

#### Tests automatiques:
```typescript
// src/test/a11y.test.tsx
import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';

expect.extend(toHaveNoViolations);

test('Dashboard should have no accessibility violations', async () => {
  const { container } = render(<Dashboard />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

### 4.3 Documentation technique
**Temps estimé:** 1 semaine
**Complexité:** Faible-Moyenne

#### Créer:
- README.md complet
- CONTRIBUTING.md
- Architecture Decision Records (ADRs)
- Documentation des composants avec Storybook

```bash
npm install -D @storybook/react @storybook/addon-essentials
npx storybook@latest init
```

---

### 4.4 Performance Lighthouse > 90
**Temps estimé:** 3-5 jours
**Complexité:** Moyenne

#### Objectifs:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

#### Optimisations:
- Lazy loading des images
- Préconnexion aux domaines externes
- Service Worker pour le cache
- Optimisation des fonts

---

## 📊 Résumé Phase 4

| Tâche | Temps | Complexité | Priorité |
|-------|-------|------------|----------|
| 4.1 Tests 70%+ | 2-3 sem | Haute | Moyenne |
| 4.2 Audit A11y | 1 sem | Moyenne | Moyenne |
| 4.3 Documentation | 1 sem | Faible-Moyenne | Basse |
| 4.4 Lighthouse 90+ | 3-5j | Moyenne | Moyenne |
| **TOTAL** | **~2-3 semaines** | | |

---

# 📊 RÉCAPITULATIF GLOBAL

## Timeline

```
Semaine 1     : Phase 1 (Sécurité critique)
Semaines 2-3  : Phase 2 (Qualité et robustesse)
Semaines 4-5  : Phase 3 (Performance et optimisation)
Semaines 6-8  : Phase 4 (Qualité long terme)
```

## Budget temps total

| Phase | Durée | Priorité |
|-------|-------|----------|
| Phase 1 | 1 semaine | URGENTE |
| Phase 2 | 2 semaines | HAUTE |
| Phase 3 | 1-2 semaines | MOYENNE |
| Phase 4 | 2-3 semaines | BASSE |
| **TOTAL** | **6-8 semaines** | |

## Investissement vs ROI

| Investissement | Bénéfices |
|----------------|-----------|
| 6-8 semaines dev | - Réduction de 80% des incidents |
| Formation équipe | - Amélioration de 40% des perfs |
| Outils (Sentry, etc.) | - Maintenance facilitée |
| Tests et monitoring | - Confiance pour scaler |

---

# 🎯 RECOMMANDATIONS

## Approche recommandée

1. **Commencer immédiatement par la Phase 1** (sécurité critique)
2. **Phases 2 et 3 en parallèle** si équipe de 2+ devs
3. **Phase 4 en continu** pendant les autres phases

## Métriques de succès

- ✅ 0 vulnérabilités npm
- ✅ 70%+ de couverture de tests
- ✅ Score Lighthouse > 90
- ✅ 0 erreurs TypeScript en mode strict
- ✅ < 3 secondes de Time to Interactive

## Prochaines étapes

1. **Valider cette proposition** avec l'équipe
2. **Prioriser les tâches** selon votre contexte
3. **Créer un board Kanban** pour le suivi
4. **Démarrer la Phase 1** immédiatement

---

**Document préparé par:** Claude (Anthropic)
**Date:** 26 novembre 2025
**Version:** 1.0
