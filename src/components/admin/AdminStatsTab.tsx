import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminStatsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistiques et Analytics</CardTitle>
        <CardDescription>Vue d'ensemble et analyses détaillées</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground py-8">
          Fonctionnalité en cours de développement
        </div>
      </CardContent>
    </Card>
  );
}
