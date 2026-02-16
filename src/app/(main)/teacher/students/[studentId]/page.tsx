"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Loader2,
    ArrowLeft,
    Mail,
    Award,
    TrendingUp,
    TrendingDown,
    Minus,
    Calendar,
    Clock,
    Target,
    BookOpen,
} from "lucide-react";

interface StudentData {
    id: string;
    name: string;
    email: string;
    className?: string;
    grade?: string;
    createdAt: Date;
    lastLoginDate?: Date;
}

interface TopicMastery {
    avg: number;
    count: number;
    trend: 'up' | 'down' | 'stable';
}

interface Quiz {
    id: string;
    topic: string;
    score: number;
    timestamp: Date;
    questionsCount: number;
}

interface PerformanceData {
    avgScore: number;
    quizzesTaken: number;
    topicMastery: Record<string, TopicMastery>;
    recentQuizzes: Quiz[];
}

const getPerformanceLevel = (score: number): { label: string; variant: "destructive" | "default" | "secondary" } => {
    if (score < 60) return { label: "At-Risk", variant: "destructive" };
    if (score < 80) return { label: "On-Track", variant: "secondary" };
    return { label: "Excelling", variant: "default" };
};

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
};

export default function StudentProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const studentId = params.studentId as string;

    const [student, setStudent] = useState<StudentData | null>(null);
    const [performance, setPerformance] = useState<PerformanceData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (studentId) {
            fetchStudentDetails();
        }
    }, [studentId]);

    const fetchStudentDetails = async () => {
        try {
            const response = await fetch(`/api/teacher/students/${studentId}`);
            if (response.ok) {
                const data = await response.json();
                setStudent(data.student);
                setPerformance(data.performance);
            } else {
                toast({
                    title: "Error",
                    description: "Student not found",
                    variant: "destructive",
                });
                router.push("/teacher/students");
            }
        } catch (error) {
            console.error("Error fetching student details:", error);
            toast({
                title: "Error",
                description: "Failed to load student details",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!student || !performance) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh]">
                <h2 className="text-2xl font-bold mb-2">Student Not Found</h2>
                <Button onClick={() => router.push("/teacher/students")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Students
                </Button>
            </div>
        );
    }

    const performanceLevel = getPerformanceLevel(performance.avgScore);
    const topicEntries = Object.entries(performance.topicMastery).sort((a, b) => b[1].avg - a[1].avg);
    const isActive = student.lastLoginDate
        ? (new Date().getTime() - new Date(student.lastLoginDate).getTime()) / (1000 * 60 * 60 * 24) <= 7
        : false;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/teacher/students")}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
            </div>

            {/* Student Overview */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-2xl">{student.name}</CardTitle>
                                <CardDescription>{student.email}</CardDescription>
                                {student.className && (
                                    <div className="mt-2 text-sm text-muted-foreground">
                                        {student.className} {student.grade && `• ${student.grade}`}
                                    </div>
                                )}
                            </div>
                            <Badge variant={performanceLevel.variant} className="text-sm">
                                {performanceLevel.label}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col">
                                <span className="text-sm text-muted-foreground">Avg. Score</span>
                                <span className="text-2xl font-bold">{performance.avgScore}%</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-muted-foreground">Quizzes Taken</span>
                                <span className="text-2xl font-bold">{performance.quizzesTaken}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-muted-foreground">Topics</span>
                                <span className="text-2xl font-bold">{topicEntries.length}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    Joined {new Date(student.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <Badge variant={isActive ? "default" : "secondary"}>
                                    {isActive ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                            <Mail className="mr-2 h-4 w-4" />
                            Email Student
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                            <Target className="mr-2 h-4 w-4" />
                            Set Learning Goals
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Topic Mastery */}
            <Card>
                <CardHeader>
                    <CardTitle>Topic Mastery</CardTitle>
                    <CardDescription>
                        Performance breakdown by topic
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {topicEntries.length === 0 ? (
                        <div className="text-center py-8">
                            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No quiz data available yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {topicEntries.map(([topic, data]) => (
                                <div key={topic} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{topic}</span>
                                            <TrendIcon trend={data.trend} />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-muted-foreground">
                                                {data.count} quiz{data.count !== 1 ? 'zes' : ''}
                                            </span>
                                            <span className="font-bold">{data.avg}%</span>
                                        </div>
                                    </div>
                                    <Progress value={data.avg} className="h-2" />
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Quizzes */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Quizzes</CardTitle>
                    <CardDescription>
                        Last {performance.recentQuizzes.length} quiz attempts
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {performance.recentQuizzes.length === 0 ? (
                        <div className="text-center py-8">
                            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No quizzes taken yet</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Topic</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Questions</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {performance.recentQuizzes.map((quiz) => {
                                    const level = getPerformanceLevel(quiz.score);
                                    return (
                                        <TableRow key={quiz.id}>
                                            <TableCell className="font-medium">{quiz.topic}</TableCell>
                                            <TableCell className="font-bold">{quiz.score}%</TableCell>
                                            <TableCell>{quiz.questionsCount}</TableCell>
                                            <TableCell>
                                                {new Date(quiz.timestamp).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={level.variant}>{level.label}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
