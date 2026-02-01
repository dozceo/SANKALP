import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Students</h1>
        <p className="text-muted-foreground">
          Manage your students and view their progress.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>A list of all students enrolled in your classes.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Student list content will go here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
