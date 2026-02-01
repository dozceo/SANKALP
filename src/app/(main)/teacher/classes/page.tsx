import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClassesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Classes</h1>
        <p className="text-muted-foreground">
          Manage your classes and schedules.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>My Classes</CardTitle>
          <CardDescription>Overview of all your active classes.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Class management content will go here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
