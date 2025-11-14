import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminLogsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Logs et Surveillance</CardTitle>
        <CardDescription>Historique des vérifications SIRET et accès audits</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground py-8">
          Fonctionnalité en cours de développement
        </div>
      </CardContent>
    </Card>
  );
}
