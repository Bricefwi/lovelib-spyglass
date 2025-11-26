import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  LayoutDashboard,
  CreditCard,
  LogOut,
  Settings,
  Zap,
  Building2,
  Rocket,
  Sparkles
} from "lucide-react";

interface UserMenuProps {
  session: Session;
}

interface UserProfile {
  plan_tier?: string;
  subscription_status?: string;
  organization_id?: string;
}

export const UserMenu = ({ session }: UserMenuProps) => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user?.id) return;

      // Fetch user profile with plan tier
      const { data } = await supabase
        .from('profiles')
        .select('plan_tier, subscription_status, organization_id')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setUserProfile(data);
      }
    };

    fetchUserProfile();
  }, [session]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getInitials = (email: string) => {
    return email
      .split("@")[0]
      .slice(0, 2)
      .toUpperCase();
  };

  const getPlanDisplay = (tier?: string) => {
    if (!tier) return { name: "Aucun plan", icon: User, color: "bg-gray-500" };

    const plans = {
      starter: { name: "Starter", icon: Zap, color: "bg-blue-500" },
      agency: { name: "Agency", icon: Building2, color: "bg-purple-500" },
      enterprise: { name: "Enterprise", icon: Rocket, color: "bg-orange-500" },
      one_shot: { name: "One-Shot", icon: Sparkles, color: "bg-green-500" },
    };

    return plans[tier as keyof typeof plans] || plans.starter;
  };

  const planDisplay = getPlanDisplay(userProfile?.plan_tier);
  const PlanIcon = planDisplay.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <div className="flex items-center gap-2 cursor-pointer group">
          {/* Avatar */}
          <Avatar className="w-9 h-9 border-2 border-gray-200 group-hover:border-primary transition-colors">
            <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white text-sm font-semibold">
              {getInitials(session.user.email || "")}
            </AvatarFallback>
          </Avatar>

          {/* Plan Badge (Desktop only) */}
          <div className="hidden md:block">
            <Badge
              variant="secondary"
              className={`${planDisplay.color} text-white border-none text-xs font-semibold px-2 py-1`}
            >
              <PlanIcon className="w-3 h-3 mr-1" />
              {planDisplay.name}
            </Badge>
          </div>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        {/* User Info Section */}
        <DropdownMenuLabel className="pb-2">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-gray-900">
              Mon compte
            </p>
            <p className="text-xs text-gray-500 truncate">
              {session.user.email}
            </p>

            {/* Plan Badge in dropdown */}
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="secondary"
                className={`${planDisplay.color} text-white border-none text-xs font-semibold`}
              >
                <PlanIcon className="w-3 h-3 mr-1" />
                {planDisplay.name}
              </Badge>
              {userProfile?.subscription_status === 'active' && (
                <span className="text-xs text-green-600 font-medium">Actif</span>
              )}
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Navigation Links */}
        <DropdownMenuItem
          onClick={() => navigate("/dashboard")}
          className="cursor-pointer"
        >
          <LayoutDashboard className="w-4 h-4 mr-2" />
          <span>Tableau de bord</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => navigate("/pricing")}
          className="cursor-pointer"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          <span>Plans & Facturation</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => navigate("/client/audits")}
          className="cursor-pointer"
        >
          <Settings className="w-4 h-4 mr-2" />
          <span>Mes audits</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Sign Out */}
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
