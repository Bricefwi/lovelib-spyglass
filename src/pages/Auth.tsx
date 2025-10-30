import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { useUserRole } from "@/hooks/useUserRole";

const emailSchema = z.string().email("Email invalide");
const passwordSchema = z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères");

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role, loading: roleLoading } = useUserRole();

  useEffect(() => {
    // Check if user is already logged in and redirect based on role
    if (!roleLoading && role) {
      if (role === 'admin') {
        navigate("/admin/audits");
      } else if (role === 'client') {
        navigate("/client/audits");
      } else {
        navigate("/");
      }
    }
  }, [role, roleLoading, navigate]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && event === "SIGNED_IN") {
        // Wait a bit for role to be fetched, then redirect will happen via the first useEffect
        setTimeout(() => {
          // Trigger role check
        }, 500);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erreur de validation",
          description: error.errors[0].message,
          variant: "destructive"
        });
        return;
      }
    }

    setIsLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`
      }
    });

    setIsLoading(false);

    if (error) {
      if (error.message.includes("already registered")) {
        toast({
          title: "Compte existant",
          description: "Cet email est déjà enregistré. Veuillez vous connecter.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Inscription réussie !",
        description: "Vous pouvez maintenant vous connecter.",
      });
      // Auto-switch to sign in tab
      setTimeout(() => {
        const signInTab = document.querySelector('[value="signin"]') as HTMLElement;
        signInTab?.click();
      }, 1500);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erreur de validation",
          description: error.errors[0].message,
          variant: "destructive"
        });
        return;
      }
    }

    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast({
          title: "Identifiants invalides",
          description: "Email ou mot de passe incorrect.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erreur de connexion",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erreur de validation",
          description: error.errors[0].message,
          variant: "destructive"
        });
        return;
      }
    }

    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Email envoyé !",
        description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe.",
      });
      setShowForgotPassword(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'azure' | 'facebook') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/onboarding`,
      },
    });

    if (error) {
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'accueil
        </Button>

        <Card className="border-2 shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="currentColor" className="text-primary"/>
              </svg>
            </div>
            <CardTitle className="text-2xl">IMOTION</CardTitle>
            <CardDescription>Connectez-vous pour accéder à votre espace</CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                {showForgotPassword ? (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <Label htmlFor="forgot-email">Email</Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowForgotPassword(false)}
                        disabled={isLoading}
                      >
                        Retour
                      </Button>
                      <Button
                        type="submit"
                        className="w-full bg-primary text-primary-foreground"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Envoi...
                          </>
                        ) : (
                          "Réinitialiser"
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div>
                        <Label htmlFor="signin-email">Email</Label>
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="votre@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <Label htmlFor="signin-password">Mot de passe</Label>
                          <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className="text-xs text-primary hover:underline"
                          >
                            Mot de passe oublié ?
                          </button>
                        </div>
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-primary text-primary-foreground"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Connexion...
                          </>
                        ) : (
                          "Se connecter"
                        )}
                      </Button>
                    </form>

                    <div className="mt-6">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <Separator />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Ou continuer avec
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleSocialLogin('google')}
                          disabled={isLoading}
                        >
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Google
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleSocialLogin('apple')}
                          disabled={isLoading}
                        >
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                          </svg>
                          Apple
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleSocialLogin('azure')}
                          disabled={isLoading}
                        >
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path fill="#f25022" d="M1 1h10v10H1z"/>
                            <path fill="#00a4ef" d="M13 1h10v10H13z"/>
                            <path fill="#7fba00" d="M1 13h10v10H1z"/>
                            <path fill="#ffb900" d="M13 13h10v10H13z"/>
                          </svg>
                          Microsoft
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleSocialLogin('facebook')}
                          disabled={isLoading}
                        >
                          <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          Facebook
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimum 6 caractères
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Inscription...
                      </>
                    ) : (
                      "Créer un compte"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
