"use client";

import { useState, useEffect, useMemo } from "react";
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
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from 'next-intl';

const InteractiveGraph = dynamic(
  () => import("@/components/InteractiveGraph").then(mod => mod.InteractiveGraph),
  { ssr: false, loading: () => <div className="flex h-[400px] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div> }
);

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
  const t = useTranslations('Teacher');

  const [students, setStudents] = useState<any[]>([]);
  const [graphData, setGraphData] = useState<any>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);

  // Enrich graph data with student risk info
  const enrichedGraphData = useMemo(() => {
    if (!graphData.nodes.length || !students.length) return graphData;

    const studentMap = new Map(students.map(s => [s.id, s]));

    const newNodes = graphData.nodes.map((node: any) => {
      if (node.type === 'student') {
        const student = studentMap.get(node.id);
        if (student) {
          const isHighRisk = (student.dropoutRisk || '').toLowerCase() === 'high';
          return {
            ...node,
            risk: student.dropoutRisk,
            // Override color for high risk students for immediate visual feedback
            color: isHighRisk ? '#ef4444' : node.color
          };
        }
      }
      return node;
    });

    return { ...graphData, nodes: newNodes };
  }, [graphData, students]);

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

  // Pseudo-random streak generator
  const getStreak = (studentId: string) => {
    // Deterministic hash based on ID
    let hash = 0;
    for (let i = 0; i < studentId.length; i++) {
      hash += studentId.charCodeAt(i);
    }
    return hash % 15; // 0-14 days
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-col sm:flex-row gap-4 sm:gap-0">
        <div>
          <h1 className="text-3xl font-bold font-headline">{t('dashboardTitle')}</h1>
          <p className="text-muted-foreground">
            A real-time heatmap of class performance and student risk factors.
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Analytics (CSV)
        </Button>
      </div>

      {/* Class Overview Table (Prioritized) */}
      <Card>
        <CardHeader>
          <CardTitle>{t('classOverview')}</CardTitle>
          <CardDescription>Monitor student progress and identify who might need extra help.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead className="min-w-[150px]">Syllabus Progress</TableHead>
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
                          <Progress value={student.avgMastery || 0} className="w-24 sm:w-full" />
                          <span className="text-sm text-muted-foreground font-semibold w-10 text-right">
                            {Math.round(student.avgMastery || 0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{getStreak(student.id)} days</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRiskVariant(student.dropoutRisk || 'low')}>
                          {t(`riskLevels.${(student.dropoutRisk || 'low').toLowerCase()}`) || student.dropoutRisk || 'Low'}
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
          </div>
        </CardContent>
      </Card>

      {/* Student Learning Network */}
      <Card>
        <CardHeader>
          <CardTitle>{t('studentNetwork')}</CardTitle>
          <CardDescription>
            Interactive visualization of all students, connections, and shared topics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InteractiveGraph
            graphData={enrichedGraphData} // Pass enriched data
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
    </div>
  );
}
