
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, Star, Zap, BookOpen, ShieldCheck, Quote, LineChart as LineChartIcon } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";


const badges = [
  { icon: Flame, title: "Hot Streak", description: "5-day study streak", color: "text-orange-500" },
  { icon: Star, title: "Quiz Master", description: "Score 100% on a quiz", color: "text-yellow-500" },
  { icon: Zap, title: "Quick Learner", description: "Complete 10 quizzes", color: "text-blue-500" },
  { icon: BookOpen, title: "Subject Pro", description: "Master a subject", color: "text-green-500" },
  { icon: ShieldCheck, title: "Perfect Week", description: "7-day study streak", color: "text-purple-500" },
];

const progressData = [
  { week: 'Week 1', past: 30, current: 40, projected: 40 },
  { week: 'Week 2', past: 50, current: 65, projected: 38 },
  { week: 'Week 3', past: 60, current: 80, projected: 35 },
  { week: 'Week 4', past: 70, current: 90, projected: 32 },
];

const chartConfig = {
  current: {
    label: "Current You",
    color: "hsl(var(--primary))",
  },
  past: {
    label: "Past You",
    color: "hsl(var(--muted-foreground))",
  },
  projected: {
    label: "Projected You (without app)",
    color: "hsl(var(--destructive))",
  },
};

export default function RewardsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Your Rewards & Progress</h1>
        <p className="text-muted-foreground">
          Stay motivated by tracking your achievements and streaks.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Flame className="text-orange-500"/> Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold">12 <span className="text-lg text-muted-foreground font-normal">days</span></p>
            <p className="text-xs text-muted-foreground mt-1">Keep it going to unlock new badges!</p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
           <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
            <CardDescription>You are <strong>65%</strong> of the way through your syllabus.</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={65} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Quote className="w-5 h-5 text-primary" /> Daily Motivation</CardTitle>
          </CardHeader>
          <CardContent>
            <blockquote className="border-l-4 border-primary pl-4 italic text-lg">
              "The secret to getting ahead is getting started."
              <footer className="text-sm text-muted-foreground mt-2">- Mark Twain</footer>
            </blockquote>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Badges Earned</CardTitle>
          <CardDescription>Recognitions for your hard work and dedication.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {badges.map((badge, index) => (
            <div key={index} className="flex flex-col items-center text-center p-4 border rounded-lg hover:bg-accent transition-colors">
              <badge.icon className={`w-12 h-12 mb-2 ${badge.color}`} />
              <p className="font-semibold">{badge.title}</p>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon className="h-5 w-5 text-primary"/>
              Personalized Progress Projection
            </CardTitle>
            <CardDescription>Visualize your growth and the impact of consistent learning.</CardDescription>
        </CardHeader>
        <CardContent>
           <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <LineChart
                data={progressData}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis label={{ value: 'Mastery Score', angle: -90, position: 'insideLeft' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="past"
                  stroke="var(--color-past)"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  name="Past You"
                />
                <Line
                  type="monotone"
                  dataKey="current"
                  stroke="var(--color-current)"
                  strokeWidth={3}
                  name="Current You"
                />
                <Line
                  type="monotone"
                  dataKey="projected"
                  stroke="var(--color-projected)"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  name="Projected (without app)"
                />
              </LineChart>
            </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
