"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  Plus,
  Users,
  BookOpen,
  Copy,
  Check,
  ExternalLink,
  Search,
  Filter,
  SortAsc,
  TrendingUp,
  GraduationCap
} from "lucide-react";
import Link from "next/link";

// Form Schema
const createClassSchema = z.object({
  className: z.string().min(3, "Class name must be at least 3 characters."),
  subject: z.string().min(2, "Subject must be at least 2 characters."),
  grade: z.string().min(1, "Please enter a grade level."),
});

interface ClassData {
  id: string;
  className: string;
  classCode: string;
  subject: string;
  grade: string;
  studentIds: string[];
  teacherId: string;
  teacherName: string;
  isActive: boolean;
  createdAt: Date;
}

type SortOption = "name" | "students" | "recent" | "subject";

export default function ClassesPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Enhanced filters and search
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  const form = useForm<z.infer<typeof createClassSchema>>({
    resolver: zodResolver(createClassSchema),
    defaultValues: {
      className: "",
      subject: "",
      grade: "",
    },
  });

  const fetchClasses = async (userId: string) => {
    try {
      const response = await fetch(`/api/teacher/classes?teacherId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (user?.uid) {
      fetchClasses(user.uid);
    } else {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const onSubmit = async (values: z.infer<typeof createClassSchema>) => {
    if (!user?.uid) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/classes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          teacherId: user.uid,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success!",
          description: `Class "${values.className}" created with code: ${data.class.classCode}`,
        });
        setDialogOpen(false);
        form.reset();
        if (user?.uid) fetchClasses(user.uid);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create class",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating class:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyClassCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast({
        title: "Copied!",
        description: "Class code copied to clipboard",
      });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy class code",
        variant: "destructive",
      });
    }
  };

  // Get unique subjects and grades for filters
  const uniqueSubjects = useMemo(() => {
    const subjects = new Set(classes.map(c => c.subject));
    return Array.from(subjects).sort();
  }, [classes]);

  const uniqueGrades = useMemo(() => {
    const grades = new Set(classes.map(c => c.grade));
    return Array.from(grades).sort();
  }, [classes]);

  // Filter and sort classes
  const filteredAndSortedClasses = useMemo(() => {
    let filtered = classes;

    // Search filter
    if (searchQuery) {
      // Hoist the toLowerCase() operation outside the loop
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(cls =>
        cls.className.toLowerCase().includes(searchLower) ||
        cls.subject.toLowerCase().includes(searchLower) ||
        cls.classCode.toLowerCase().includes(searchLower)
      );
    }

    // Subject filter
    if (subjectFilter !== "all") {
      filtered = filtered.filter(cls => cls.subject === subjectFilter);
    }

    // Grade filter
    if (gradeFilter !== "all") {
      filtered = filtered.filter(cls => cls.grade === gradeFilter);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.className.localeCompare(b.className);
        case "students":
          return (b.studentIds?.length || 0) - (a.studentIds?.length || 0);
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "subject":
          return a.subject.localeCompare(b.subject);
        default:
          return 0;
      }
    });

    return sorted;
  }, [classes, searchQuery, subjectFilter, gradeFilter, sortBy]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalStudents = classes.reduce((acc, cls) => acc + (cls.studentIds?.length || 0), 0);
    const avgStudents = classes.length > 0 ? Math.round(totalStudents / classes.length) : 0;
    const mostPopularClass = classes.reduce((max, cls) =>
      (cls.studentIds?.length || 0) > (max.studentIds?.length || 0) ? cls : max
      , classes[0]);

    return {
      totalClasses: classes.length,
      totalStudents,
      avgStudents,
      mostPopularClass,
    };
  }, [classes]);

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
          <h1 className="text-3xl font-bold font-headline">My Classes</h1>
          <p className="text-muted-foreground">
            Manage your classes and students
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Create Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Class</DialogTitle>
              <DialogDescription>
                Add a new class to your dashboard. Students can join using the generated class code.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="className"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Physics 101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Physics" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade/Level</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 10th Grade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Class
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {classes.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClasses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Students</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgStudents}</div>
              <p className="text-xs text-muted-foreground">per class</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold truncate">{stats.mostPopularClass?.className || "N/A"}</div>
              <p className="text-xs text-muted-foreground">
                {stats.mostPopularClass?.studentIds?.length || 0} students
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      {classes.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search classes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {uniqueSubjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger>
                  <SortAsc className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="students">Most Students</SelectItem>
                  <SelectItem value="subject">Subject</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(searchQuery || subjectFilter !== "all" || gradeFilter !== "all") && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Showing {filteredAndSortedClasses.length} of {classes.length} classes
                </span>
                {(searchQuery || subjectFilter !== "all" || gradeFilter !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setSubjectFilter("all");
                      setGradeFilter("all");
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Classes Grid */}
      {filteredAndSortedClasses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {classes.length === 0 ? "No classes yet" : "No classes found"}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {classes.length === 0
                ? "Create your first class to start managing students"
                : "Try adjusting your search or filters"
              }
            </p>
            {classes.length === 0 && (
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Class
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedClasses.map((cls) => (
            <Card key={cls.id} className="hover:shadow-lg transition-all hover:scale-[1.02]">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <BookOpen className="h-5 w-5 text-primary flex-shrink-0" />
                    <CardTitle className="text-lg line-clamp-1">{cls.className}</CardTitle>
                  </div>
                  {cls.studentIds?.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {cls.studentIds.length}
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {cls.subject} • {cls.grade}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Class Code</p>
                    <code className="text-lg font-bold">{cls.classCode}</code>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyClassCode(cls.classCode)}
                  >
                    {copiedCode === cls.classCode ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{cls.studentIds?.length || 0} students enrolled</span>
                </div>

                <Link href={`/teacher/classes/${cls.id}`}>
                  <Button variant="outline" className="w-full">
                    View Details
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
