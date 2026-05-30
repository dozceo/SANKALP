"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import {
    Loader2,
    ArrowLeft,
    Users,
    BookOpen,
    Copy,
    Check,
    Mail,
    Calendar,
    Search,
    TrendingUp,
    Clock,
} from "lucide-react";

interface Student {
    id: string;
    name: string;
    email: string;
    joinedClassAt?: Date;
    lastLoginDate?: Date;
}

interface ClassDetails {
    id: string;
    className: string;
    classCode: string;
    subject: string;
    grade: string;
    teacherId: string;
    teacherName: string;
    studentIds: string[];
    isActive: boolean;
    createdAt: Date;
}

export default function ClassDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const classId = params.classId as string;

    const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (classId) {
            fetchClassDetails();
        }
    }, [classId]);

    const fetchClassDetails = async () => {
        try {
            // Fetch class details
            const classResponse = await fetch(`/api/teacher/classes/${classId}`);
            if (classResponse.ok) {
                const classData = await classResponse.json();
                setClassDetails(classData.class);

                // Fetch students in class
                const studentsResponse = await fetch(
                    `/api/teacher/classes/${classId}/students`
                );
                if (studentsResponse.ok) {
                    const studentsData = await studentsResponse.json();
                    setStudents(studentsData.students || []);
                }
            }
        } catch (error) {
            console.error("Error fetching class details:", error);
            toast({
                title: "Error",
                description: "Failed to load class details",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const copyClassCode = async () => {
        if (!classDetails) return;
        try {
            await navigator.clipboard.writeText(classDetails.classCode);
            setCopiedCode(true);
            toast({
                title: "Copied!",
                description: "Class code copied to clipboard",
            });
            setTimeout(() => setCopiedCode(false), 2000);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to copy class code",
                variant: "destructive",
            });
        }
    };

    // Filter students by search query
    const filteredStudents = useMemo(() => {
        if (!searchQuery) return students;
        // Performance optimization: Hoist toLowerCase() to avoid redundant string allocations on every loop iteration
        const lowerQuery = searchQuery.toLowerCase();
        return students.filter(student =>
            student.name.toLowerCase().includes(lowerQuery) ||
            student.email.toLowerCase().includes(lowerQuery)
        );
    }, [students, searchQuery]);

    // Calculate student activity stats
    const studentStats = useMemo(() => {
        const nowMs = Date.now();
        const activeStudents = students.filter(s => {
            if (!s.lastLoginDate) return false;
            const daysSinceLogin = (nowMs - new Date(s.lastLoginDate).getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceLogin <= 7;
        });

        const recentJoins = students.filter(s => {
            if (!s.joinedClassAt) return false;
            const daysSinceJoin = (nowMs - new Date(s.joinedClassAt).getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceJoin <= 7;
        });

        return {
            total: students.length,
            activeThisWeek: activeStudents.length,
            recentJoins: recentJoins.length,
            activityRate: students.length > 0 ? Math.round((activeStudents.length / students.length) * 100) : 0,
        };
    }, [students]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!classDetails) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh]">
                <h2 className="text-2xl font-bold mb-2">Class Not Found</h2>
                <p className="text-muted-foreground mb-4">
                    The class you're looking for doesn't exist.
                </p>
                <Button onClick={() => router.push("/teacher/classes")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Classes
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/teacher/classes")}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <BookOpen className="h-6 w-6 text-primary" />
                            <div>
                                <CardTitle className="text-2xl">{classDetails.className}</CardTitle>
                                <CardDescription>
                                    {classDetails.subject} • {classDetails.grade}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Class Code</p>
                                <code className="text-2xl font-bold">{classDetails.classCode}</code>
                            </div>
                            <Button variant="outline" size="sm" onClick={copyClassCode}>
                                {copiedCode ? (
                                    <>
                                        <Check className="h-4 w-4 mr-2 text-green-500" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <span className="text-sm text-muted-foreground">Students Enrolled</span>
                                <span className="text-2xl font-bold">{students.length}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-muted-foreground">Status</span>
                                <Badge variant={classDetails.isActive ? "default" : "secondary"}>
                                    {classDetails.isActive ? "Active" : "Inactive"}
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
                            Email Students
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule Assignment
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Student Activity Stats */}
            {students.length > 0 && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{studentStats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active This Week</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{studentStats.activeThisWeek}</div>
                            <p className="text-xs text-muted-foreground">
                                {studentStats.activityRate}% activity rate
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">New This Week</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{studentStats.recentJoins}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Created</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-bold">
                                {new Date(classDetails.createdAt).toLocaleDateString()}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Students</CardTitle>
                            <CardDescription>
                                {students.length} student{students.length !== 1 ? "s" : ""} enrolled in this class
                            </CardDescription>
                        </div>
                        {students.length > 0 && (
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search students..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {students.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No students yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Share the class code <code className="bg-muted px-2 py-1 rounded">{classDetails.classCode}</code> with students to get started
                            </p>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-12">
                            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No students found</h3>
                            <p className="text-muted-foreground">
                                Try adjusting your search query
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead>Last Active</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.map((student) => {
                                    const daysSinceLogin = student.lastLoginDate
                                        ? (Date.now() - new Date(student.lastLoginDate).getTime()) / (1000 * 60 * 60 * 24)
                                        : null;
                                    const isActive = daysSinceLogin !== null && daysSinceLogin <= 7;

                                    return (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">{student.name}</TableCell>
                                            <TableCell>{student.email}</TableCell>
                                            <TableCell>
                                                {student.joinedClassAt
                                                    ? new Date(student.joinedClassAt).toLocaleDateString()
                                                    : "N/A"}
                                            </TableCell>
                                            <TableCell>
                                                {student.lastLoginDate
                                                    ? new Date(student.lastLoginDate).toLocaleDateString()
                                                    : "Never"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={isActive ? "default" : "secondary"}>
                                                    {isActive ? "Active" : "Inactive"}
                                                </Badge>
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
