import Link from "next/link";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Download, ChevronRight } from "lucide-react";

const studentData = [
  {
    id: "alice-johnson",
    name: "Alice Johnson",
    avatar: "https://i.pravatar.cc/150?u=alice",
    progress: 92,
    absenteeism: "Low",
    dropoutRisk: "Low",
  },
  {
    id: "charlie-brown",
    name: "Charlie Brown",
    avatar: "https://i.pravatar.cc/150?u=charlie",
    progress: 45,
    absenteeism: "High",
    dropoutRisk: "High",
  },
  {
    id: "diana-miller",
    name: "Diana Miller",
    avatar: "https://i.pravatar.cc/150?u=diana",
    progress: 68,
    absenteeism: "Medium",
    dropoutRisk: "Medium",
  },
];

const getRiskVariant = (risk: string) => {
  switch (risk.toLowerCase()) {
    case "high": return "destructive";
    case "medium": return "secondary";
    case "low": return "default";
    default: return "outline";
  }
};

export default function TeacherPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold font-headline">Teacher Risk Dashboard</h1>
            <p className="text-muted-foreground">
            A real-time heatmap of class performance and student risk factors.
            </p>
        </div>
        <Button>
            <Download className="mr-2 h-4 w-4"/>
            Export Analytics (CSV)
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Class Overview</CardTitle>
            <CardDescription>Monitor student progress and identify who might need extra help.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="w-[30%]">Syllabus Progress</TableHead>
                    <TableHead>Absentee Streak</TableHead>
                    <TableHead>Predicted Dropout Risk</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {studentData.map((student) => (
                    <TableRow key={student.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                <AvatarImage src={student.avatar} alt={student.name} />
                                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{student.name}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Progress value={student.progress} className="w-full"/>
                                <span className="text-sm text-muted-foreground font-semibold w-10 text-right">{student.progress}%</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={getRiskVariant(student.absenteeism)}>{student.absenteeism}</Badge>
                        </TableCell>
                        <TableCell>
                             <Badge variant={getRiskVariant(student.dropoutRisk)}>{student.dropoutRisk}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/teacher/student/${student.id}`}>
                                    View
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Link>
                            </Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
