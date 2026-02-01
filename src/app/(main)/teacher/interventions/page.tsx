import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function InterventionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Interventions</h1>
        <p className="text-muted-foreground">
          Track and manage student interventions.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Active Interventions</CardTitle>
          <CardDescription>Students requiring attention.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Intervention management content will go here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
