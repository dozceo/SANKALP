import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Book, FlaskConical, Atom, Languages, History, ArrowRight, ListChecks, FileQuestion, MessageCircle, TrendingUp, TrendingDown } from "lucide-react";

const brainMapData = [
  {
    title: "Mathematics",
    progress: 85,
    icon: Book,
  },
  {
    title: "Physics",
    progress: 60,
    icon: Atom,
  },
  {
    title: "Chemistry",
    progress: 45,
    icon: FlaskConical,
  },
  {
    title: "English",
    progress: 95,
    icon: Languages,
  },
  {
    title: "History",
    progress: 20,
    icon: History,
  },
];

const revisionTasks = [
    { topic: "Calculus", reason: "Last revised 3 weeks ago" },
    { topic: "Organic Chemistry", reason: "Low progress" },
]

export default function HomePage() {
  const overallProgress = Math.round(brainMapData.reduce((acc, node) => acc + node.progress, 0) / brainMapData.length);
  const bestSubject = brainMapData.reduce((max, subject) => subject.progress > max.progress ? subject : max, brainMapData[0]);
  const worstSubject = brainMapData.reduce((min, subject) => subject.progress < min.progress ? subject : min, brainMapData[0]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Welcome back, Alex!</h1>
        <p className="text-muted-foreground">
          Here&apos;s your personalized learning dashboard for today.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Main Dashboard Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
            <CardDescription>Across all your subjects.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4">
             <div className="text-6xl font-bold text-primary">{overallProgress}%</div>
             <Progress value={overallProgress} aria-label={`Overall progress: ${overallProgress}%`} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
                <span>Today&apos;s Revision</span>
                <ListChecks className="w-6 h-6 text-muted-foreground"/>
            </CardTitle>
            <CardDescription>A couple of tasks from your planner.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
             {revisionTasks.map(task => (
                <div key={task.topic} className="flex justify-between items-center p-2 bg-muted rounded-md">
                    <div>
                        <p className="font-semibold text-sm">{task.topic}</p>
                        <p className="text-xs text-muted-foreground">{task.reason}</p>
                    </div>
                    <Button size="sm" variant="ghost" asChild>
                        <Link href="/planner">
                           Revise <ArrowRight className="ml-2 h-4 w-4"/>
                        </Link>
                    </Button>
                </div>
             ))}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <div>
                <CardHeader>
                    <CardTitle className="text-base font-medium">Strengths & Weaknesses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500"/>
                        <div>
                            <p className="text-sm font-semibold">{bestSubject.title}</p>
                            <p className="text-xs text-muted-foreground">{bestSubject.progress}% Mastery</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-red-500"/>
                        <div>
                            <p className="text-sm font-semibold">{worstSubject.title}</p>
                            <p className="text-xs text-muted-foreground">{worstSubject.progress}% Mastery</p>
                        </div>
                    </div>
                </CardContent>
            </div>
             <div>
                <CardHeader>
                    <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="h-16 flex-col gap-1 text-xs" asChild>
                        <Link href="/quiz">
                            <FileQuestion className="w-5 h-5"/>
                            <span>Take Quiz</span>
                        </Link>
                    </Button>
                    <Button variant="outline" className="h-16 flex-col gap-1 text-xs" asChild>
                        <Link href="/chat">
                            <MessageCircle className="w-5 h-5" />
                            <span>Ask Bot</span>
                        </Link>
                    </Button>
                </CardContent>
            </div>
        </Card>


        {/* Brain Map Section */}
        <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
                <CardTitle>Your Brain Map</CardTitle>
                <CardDescription>Your interactive syllabus graph. Nodes are color-coded based on your mastery.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                 {brainMapData.map((node) => (
                    <Card key={node.title} className="hover:shadow-md transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-md font-medium font-headline">{node.title}</CardTitle>
                        <node.icon className="w-5 h-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <Progress value={node.progress} aria-label={`${node.title} progress: ${node.progress}%`} />
                             <p className="text-xs text-muted-foreground mt-2">{node.progress}% mastered</p>
                        </CardContent>
                    </Card>
                ))}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
