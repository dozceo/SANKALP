
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, TrendingUp, TrendingDown } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, XAxis, YAxis, CartesianGrid, BarChart as RechartsBarChart } from "recharts";


const mockStudent = {
    id: "alice-johnson",
    name: "Alice Johnson",
    avatar: "https://i.pravatar.cc/150?u=alice",
    progress: 92,
    subjects: [
        { name: "Math", progress: 95 },
        { name: "Science", progress: 88 },
        { name: "History", progress: 90 },
        { name: "English", progress: 98 },
    ],
    strengths: ["Algebra", "Grammar"],
    weaknesses: ["Physics Formulas"]
};


export default function StudentAnalyticsPage({ params }: { params: { studentId: string } }) {
  const [chatbotPersonality, setChatbotPersonality] = useState("friendly and encouraging");
  const [customInstructions, setCustomInstructions] = useState("When Alice struggles with a math problem, try to guide her with a similar, simpler example first. Avoid giving the direct answer.");

  const chartData = mockStudent.subjects;
  const chartConfig = {
    progress: {
      label: "Progress",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Student Analytics</h1>
        <p className="text-muted-foreground">
          Detailed view of {mockStudent.name}'s performance and settings.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={mockStudent.avatar} />
                <AvatarFallback>{mockStudent.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{mockStudent.name}</CardTitle>
                <CardDescription>Overall Syllabus Progress: {mockStudent.progress}%</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={mockStudent.progress} />
            </CardContent>
          </Card>

           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Subject Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
                 <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <RechartsBarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                        dataKey="name"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="progress" fill="var(--color-progress)" radius={4} />
                    </RechartsBarChart>
                </ChartContainer>
            </CardContent>
          </Card>
          
           <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <TrendingUp className="text-green-500"/> Strengths
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {mockStudent.strengths.map(s => <p key={s} className="text-sm">{s}</p>)}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <TrendingDown className="text-red-500"/> Weaknesses
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {mockStudent.weaknesses.map(s => <p key={s} className="text-sm">{s}</p>)}
                    </CardContent>
                </Card>
           </div>

        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chatbot Customization</CardTitle>
              <CardDescription>
                Tailor the AI's personality and instructions for this student.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="personality">Personality & Tone</Label>
                <Select value={chatbotPersonality} onValueChange={setChatbotPersonality}>
                  <SelectTrigger id="personality">
                    <SelectValue placeholder="Select a tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly and encouraging">Friendly & Encouraging</SelectItem>
                    <SelectItem value="direct and formal">Direct & Formal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructions">Custom Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="e.g., Use analogies related to sports..."
                  rows={6}
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                />
              </div>
              <Button className="w-full">Save Configuration</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
