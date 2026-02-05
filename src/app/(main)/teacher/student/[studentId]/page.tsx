import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import StudentAnalyticsClient from "./StudentAnalyticsClient";
import { getStudentAnalytics } from "@/lib/student-analytics";

interface PageProps {
  params: Promise<{ studentId: string }>;
}

export default async function StudentAnalyticsPage({ params }: PageProps) {
  const { studentId } = await params;

  const data = await getStudentAnalytics(studentId);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Student Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The student with ID "{studentId}" could not be found in our real database.
          </p>
          <Button asChild>
            <Link href="/teacher">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Teacher Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return <StudentAnalyticsClient student={data.student} performance={data.performance} />;
}
