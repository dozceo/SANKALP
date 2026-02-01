import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Analytics</h1>
        <p className="text-muted-foreground">
          Deep dive into student performance and trends.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Detailed analytics and charts.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Analytics dashboard content will go here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
