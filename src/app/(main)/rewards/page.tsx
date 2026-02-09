"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Star, Zap, BookOpen, ShieldCheck, Quote, LineChart as LineChartIcon, Trophy, Award, Target } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { useStudent } from "@/hooks/useStudent";
import { RewardsSkeleton } from "@/components/rewards/RewardsSkeleton";
import {
  getSubjectMastery,
  getOverallMastery,
  getStudentBadges,
  getProgressProjection
} from "@/lib/rewards/calculateRewards";

// Icon mapping for dynamic badges
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  flame: Flame,
  star: Star,
  zap: Zap,
  book: BookOpen,
  shield: ShieldCheck,
  trophy: Trophy,
  award: Award,
};

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
  const { currentStudent, loading } = useStudent();

  if (loading) {
    return <RewardsSkeleton />;
  }

  // Derive all data using utility functions
  const subjectsMastery = getSubjectMastery(currentStudent);
  const averageMastery = getOverallMastery(currentStudent);
  const progressData = getProgressProjection(currentStudent);
  const studentBadges = getStudentBadges(currentStudent);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Your Rewards & Progress</h1>
        <p className="text-muted-foreground">
          Stay motivated by tracking your achievements and streaks.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Streak Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Flame className="text-orange-500"/> Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold">{currentStudent?.streak || 0} <span className="text-lg text-muted-foreground font-normal">days</span></p>
            <p className="text-xs text-muted-foreground mt-1">Keep it going to unlock new badges!</p>
          </CardContent>
        </Card>

        {/* Overall Mastery Card */}
        <Card className="lg:col-span-2">
           <CardHeader>
            <CardTitle>Overall Mastery</CardTitle>
            <CardDescription>Your average mastery across all subjects is <strong>{averageMastery}%</strong>.</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={averageMastery} className="h-3" />
          </CardContent>
        </Card>

        {/* Subject Breakdown Card */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Subject Mastery Breakdown
            </CardTitle>
            <CardDescription>How you're performing across different areas of study.</CardDescription>
          </CardHeader>
          <CardContent>
            {subjectsMastery.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {subjectsMastery.map((subject) => (
                  <div key={subject.subject} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{subject.label}</span>
                      <span className="text-muted-foreground">{subject.value}%</span>
                    </div>
                    <Progress value={subject.value} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No subject data available yet. Start practicing to see your progress!</p>
            )}
          </CardContent>
        </Card>

        {/* Daily Motivation Card */}
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

      {/* Badges Card */}
      <Card>
        <CardHeader>
          <CardTitle>Badges Earned</CardTitle>
          <CardDescription>Recognitions for your hard work and dedication.</CardDescription>
        </CardHeader>
        <CardContent>
          {studentBadges.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {studentBadges.map((badge, index) => {
                const IconComponent = iconMap[badge.icon] || Award;
                return (
                  <div key={index} className="flex flex-col items-center text-center p-4 border rounded-lg hover:bg-accent transition-colors">
                    <IconComponent className={`w-12 h-12 mb-2 ${badge.color || 'text-primary'}`} />
                    <p className="font-semibold">{badge.title}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <Award className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-2" />
              <p className="font-medium text-muted-foreground">No badges earned yet</p>
              <p className="text-sm text-muted-foreground">Complete quizzes and maintain streaks to earn badges!</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Projection Chart Card */}
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
                <YAxis domain={[0, 100]} label={{ value: 'Mastery %', angle: -90, position: 'insideLeft' }} />
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
