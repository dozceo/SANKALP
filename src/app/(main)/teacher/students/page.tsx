"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    Search,
    Filter,
    SortAsc,
    Users,
    AlertTriangle,
    TrendingUp,
    Activity,
    Mail,
    ExternalLink,
    Award,
    Clock,
} from "lucide-react";

interface Student {
    id: string;
    name: string;
    email: string;
    className?: string;
    grade?: string;
    progress: number;
    quizzesTaken: number;
    topicMastery: Record<string, number>;
    lastActivity?: Date;
}

type PerformanceLevel = "all" | "at-risk" | "on-track" | "excelling";
type ActivityStatus = "all" | "active" | "inactive";
type SortOption = "name" | "performance" | "activity" | "quizzes";

const getPerformanceLevel = (progress: number): { level: PerformanceLevel; label: string; variant: "destructive" | "default" | "secondary" } => {
    if (progress < 60) return { level: "at-risk", label: "At-Risk", variant: "destructive" };
    if (progress < 80) return { level: "on-track", label: "On-Track", variant: "secondary" };
    return { level: "excelling", label: "Excelling", variant: "default" };
};

const isActive = (lastActivity?: Date): boolean => {
    if (!lastActivity) return false;
    const daysSince = (new Date().getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 7;
};

export default function StudentsPage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const [students, setStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters and search
    const [searchQuery, setSearchQuery] = useState("");
    const [classFilter, setClassFilter] = useState<string>("all");
    const [performanceFilter, setPerformanceFilter] = useState<PerformanceLevel>("all");
    const [activityFilter, setActivityFilter] = useState<ActivityStatus>("all");
    const [sortBy, setSortBy] = useState<SortOption>("name");

    useEffect(() => {
        if (authLoading) return;
        if (user?.uid) {
            fetchStudents(user.uid);
        } else {
            setIsLoading(false);
        }
    }, [user, authLoading]);

    const fetchStudents = async (teacherId: string) => {
        try {
            const response = await fetch(`/api/teacher/students?teacherId=${teacherId}`);
            if (response.ok) {
                const data = await response.json();
                setStudents(data.students || []);
                setClasses(data.classes || []);
            }
        } catch (error) {
            console.error("Error fetching students:", error);
            toast({
                title: "Error",
                description: "Failed to load students",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Get unique classes for filter
    const uniqueClasses = useMemo(() => {
        const classNames = new Set(students.map(s => s.className).filter(Boolean));
        return Array.from(classNames).sort();
    }, [students]);

    // Filter and sort students
    const filteredAndSortedStudents = useMemo(() => {
        let filtered = students;

        // Search filter
        if (searchQuery) {
            // ⚡ Bolt: Hoist toLowerCase() outside the loop to prevent O(N*M) string allocations during filtering
            const queryLower = searchQuery.toLowerCase();
            filtered = filtered.filter(student =>
                student.name.toLowerCase().includes(queryLower) ||
                student.email.toLowerCase().includes(queryLower) ||
                student.className?.toLowerCase().includes(queryLower)
            );
        }

        // Class filter
        if (classFilter !== "all") {
            filtered = filtered.filter(s => s.className === classFilter);
        }

        // Performance filter
        if (performanceFilter !== "all") {
            filtered = filtered.filter(s => {
                const level = getPerformanceLevel(s.progress).level;
                return level === performanceFilter;
            });
        }

        // Activity filter
        if (activityFilter !== "all") {
            filtered = filtered.filter(s => {
                const active = isActive(s.lastActivity);
                return activityFilter === "active" ? active : !active;
            });
        }

        // Sort
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return a.name.localeCompare(b.name);
                case "performance":
                    return b.progress - a.progress;
                case "activity":
                    const aTime = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
                    const bTime = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
                    return bTime - aTime;
                case "quizzes":
                    return b.quizzesTaken - a.quizzesTaken;
                default:
                    return 0;
            }
        });

        return sorted;
    }, [students, searchQuery, classFilter, performanceFilter, activityFilter, sortBy]);

    // Calculate stats
    const stats = useMemo(() => {
        const atRisk = students.filter(s => s.progress < 60).length;
        const activeStudents = students.filter(s => isActive(s.lastActivity)).length;
        const avgPerformance = students.length > 0
            ? Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length)
            : 0;

        return {
            total: students.length,
            atRisk,
            atRiskPercent: students.length > 0 ? Math.round((atRisk / students.length) * 100) : 0,
            avgPerformance,
            activeThisWeek: activeStudents,
            activeRate: students.length > 0 ? Math.round((activeStudents / students.length) * 100) : 0,
        };
    }, [students]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Students</h1>
                    <p className="text-muted-foreground">
                        Monitor student performance and engagement
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            {students.length > 0 && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">At-Risk Students</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">{stats.atRisk}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.atRiskPercent}% of total
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Performance</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.avgPerformance}%</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active This Week</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.activeThisWeek}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.activeRate}% activity rate
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Search and Filters */}
            {students.length > 0 && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid gap-4 md:grid-cols-5">
                            <div className="relative md:col-span-2">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search students..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={classFilter} onValueChange={setClassFilter}>
                                <SelectTrigger>
                                    <Filter className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Class" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Classes</SelectItem>
                                    {uniqueClasses.map(className => (
                                        <SelectItem key={className} value={className as string}>{className}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={performanceFilter} onValueChange={(v) => setPerformanceFilter(v as PerformanceLevel)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Performance" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Levels</SelectItem>
                                    <SelectItem value="at-risk">At-Risk</SelectItem>
                                    <SelectItem value="on-track">On-Track</SelectItem>
                                    <SelectItem value="excelling">Excelling</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                                <SelectTrigger>
                                    <SortAsc className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name">Name (A-Z)</SelectItem>
                                    <SelectItem value="performance">Performance</SelectItem>
                                    <SelectItem value="activity">Last Active</SelectItem>
                                    <SelectItem value="quizzes">Quizzes Taken</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {(searchQuery || classFilter !== "all" || performanceFilter !== "all" || activityFilter !== "all") && (
                            <div className="mt-4 flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                    Showing {filteredAndSortedStudents.length} of {students.length} students
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setClassFilter("all");
                                        setPerformanceFilter("all");
                                        setActivityFilter("all");
                                    }}
                                >
                                    Clear filters
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Students Grid */}
            {filteredAndSortedStudents.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Users className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">
                            {students.length === 0 ? "No students yet" : "No students found"}
                        </h3>
                        <p className="text-muted-foreground text-center">
                            {students.length === 0
                                ? "Students will appear here once they join your classes"
                                : "Try adjusting your search or filters"
                            }
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredAndSortedStudents.map((student) => {
                        const performance = getPerformanceLevel(student.progress);
                        const active = isActive(student.lastActivity);
                        const topicCount = Object.keys(student.topicMastery).length;

                        return (
                            <Card key={student.id} className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                                onClick={() => router.push(`/teacher/students/${student.id}`)}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg line-clamp-1">{student.name}</CardTitle>
                                            <CardDescription className="line-clamp-1">{student.email}</CardDescription>
                                        </div>
                                        <Badge variant={performance.variant}>{performance.label}</Badge>
                                    </div>
                                    {student.className && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Users className="h-3 w-3" />
                                            <span>{student.className}</span>
                                            {student.grade && <span>• {student.grade}</span>}
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-muted-foreground">Performance</span>
                                            <span className="text-2xl font-bold">{student.progress}%</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-muted-foreground">Quizzes</span>
                                            <span className="text-2xl font-bold">{student.quizzesTaken}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Award className="h-4 w-4" />
                                            <span>{topicCount} topics</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <Badge variant={active ? "default" : "secondary"} className="text-xs">
                                                {active ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                    </div>

                                    <Button variant="outline" className="w-full" onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/teacher/students/${student.id}`);
                                    }}>
                                        View Profile
                                        <ExternalLink className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
