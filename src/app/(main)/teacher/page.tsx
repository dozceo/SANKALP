"use client";

import { useState, useEffect } from "react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Download, ChevronRight, Loader2 } from "lucide-react";
import { InteractiveGraph } from "@/components/InteractiveGraph";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Get initials for avatar
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
};

const getRiskVariant = (risk: string) => {
  switch (risk.toLowerCase()) {
    case "high": return "destructive";
    case "medium": return "secondary";
    case "low": return "default";
    default: return "outline";
  }
};

export default function TeacherPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [students, setStudents] = useState<any[]>([]);
  const [graphData, setGraphData] = useState<any>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user?.uid || user.uid === 'undefined') return;

      try {
        const [studentsRes, graphRes] = await Promise.all([
          fetch(`/api/teacher/students?teacherId=${user.uid}`),
          fetch(`/api/teacher/graph?teacherId=${user.uid}`)
        ]);

        if (studentsRes.ok) {
          const data = await studentsRes.json();
          setStudents(data.students || []);
        }

        if (graphRes.ok) {
          const gData = await graphRes.json();
          if (gData.success) {
            setGraphData(gData);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Failed to load dashboard',
          description: 'Could not fetch data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
          <Download className="mr-2 h-4 w-4" />
          Export Analytics (CSV)
        </Button>
      </div>

      {/* Student Learning Network */}
      <Card>
        <CardHeader>
          <CardTitle>Student Learning Network</CardTitle>
          <CardDescription>
            Interactive visualization of all students, connections, and shared topics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InteractiveGraph
            graphData={graphData} // Pass fetched data
            onNodeClick={(nodeId) => {
              const student = students.find(s => s.id === nodeId);
              if (student) {
                router.push(`/teacher/student/${nodeId}`);
              }
            }}
            highlightedNode={undefined}
          />
        </CardContent>
      </Card>

      {/* Class Overview Table */}
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
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No students enrolled yet
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="bg-primary">
                          <AvatarFallback className="text-white font-medium text-xs">
                            {getInitials(student.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-xs text-muted-foreground">Grade {student.grade || 'N/A'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={student.avgMastery || 0} className="w-full" />
                        <span className="text-sm text-muted-foreground font-semibold w-10 text-right">
                          {Math.round(student.avgMastery || 0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">Low</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRiskVariant(student.dropoutRisk || 'low')}>
                        {student.dropoutRisk || 'Low'}
                      </Badge>
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
