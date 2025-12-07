import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Network, 
  Sparkles, 
  MessageSquare, 
  Users,
  Settings,
  ChevronRight,
  GitBranch,
  FlaskConical,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface AdminSidebarProps {
  pendingCount?: number;
  unreadMessages?: number;
}

export function AdminSidebar({ pendingCount = 0, unreadMessages = 0 }: AdminSidebarProps) {
  const location = useLocation();
  
  const navigation = [
    {
      name: "Vue d'ensemble",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: "Audits",
      href: "/admin/audits",
      icon: FileText,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      name: "Messages Clients",
      href: "/admin/messages",
      icon: MessageSquare,
      badge: unreadMessages > 0 ? unreadMessages : null,
    },
    {
      name: "Orchestrations",
      href: "/admin/orchestrations",
      icon: Network,
      badge: null,
    },
    {
      name: "Veille IA",
      href: "/admin/veille-ia",
      icon: Sparkles,
      badge: null,
    },
    {
      name: "Utilisateurs",
      href: "/admin/users",
      icon: Users,
      badge: null,
    },
    {
      name: "Synchronisation",
      href: "/admin/sync",
      icon: GitBranch,
      badge: null,
    },
    {
      name: "Campagne de Test",
      href: "/admin/test-campaign",
      icon: FlaskConical,
      badge: null,
    },
    {
      name: "Test Multi-Niveaux",
      href: "/admin/test-tiered",
      icon: Layers,
      badge: "NEW",
    },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <aside className="w-64 bg-white border-r border-border min-h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Admin IMOTION</h2>
        <p className="text-xs text-muted-foreground mt-1">Tableau de bord</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </div>
              {item.badge !== null && (
                <Badge variant={active ? "secondary" : "default"} className="h-5 min-w-5 px-1.5">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Link
          to="/admin/settings"
          className={cn(
            "flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
            isActive("/admin/settings")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-3">
            <Settings className="h-4 w-4" />
            <span>Paramètres</span>
          </div>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </aside>
  );
}
