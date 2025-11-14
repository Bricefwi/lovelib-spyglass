import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminAuditsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Surveillance des Audits</CardTitle>
        <CardDescription>Tous les audits lancés par les utilisateurs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground py-8">
          Fonctionnalité en cours de développement
        </div>
      </CardContent>
    </Card>
  );
}
