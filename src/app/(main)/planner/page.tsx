
"use client";

import { useState, useEffect, useRef } from "react";
import { type SmartRevisionPlannerOutput } from "@/ai/flows/smart-revision-planner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, BookCheck, AlertTriangle, Loader2 } from "lucide-react";
import { getRevisionPlan } from "./actions";

export default function PlannerPage() {
  const [plan, setPlan] = useState<SmartRevisionPlannerOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePlan = async () => {
    setLoading(true);
    setError(null);
    setPlan(null);
    const result = await getRevisionPlan();
    if (result) {
      setPlan(result);
    } else {
      setError("Failed to generate a revision plan. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">My Planner</h1>
        <p className="text-muted-foreground">
          Your central hub for organizing, scheduling, and tackling your studies.
        </p>
      </div>

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="add">Add Data</TabsTrigger>
          <TabsTrigger value="organize">Organize</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="timer">Focus Timer</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's AI Suggestions</CardTitle>
              <CardDescription>Click the button below to generate a personalized study plan for today.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleGeneratePlan} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Today's Plan"
                )}
              </Button>
            </CardContent>
          </Card>

          {error && (
             <Card className="mt-4 border-destructive">
                <CardHeader className="flex flex-row items-center gap-4">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                    <div>
                        <CardTitle className="text-destructive">An Error Occurred</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </div>
                </CardHeader>
            </Card>
          )}

          {plan && plan.revisionList.length > 0 && (
              <ul className="mt-4 space-y-4">
                {plan.revisionList.map((task, index) => (
                  <li key={index}>
                    <Card className="hover:border-primary transition-colors">
                      <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                          <CardTitle>{task.topic}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Lightbulb className="w-4 h-4 text-amber-500" />
                            <span>{task.reason}</span>
                          </CardDescription>
                        </div>
                        <Button size="sm" variant="outline">
                          <BookCheck className="mr-2 h-4 w-4" />
                          Revise Now
                        </Button>
                      </CardHeader>
                    </Card>
                  </li>
                ))}
              </ul>
          )}
           {plan && plan.revisionList.length === 0 && (
             <Card className="mt-4">
                <CardHeader>
                    <CardTitle>All Caught Up!</CardTitle>
                    <CardDescription>No priority revisions for today. Feel free to explore new topics!</CardDescription>
                </CardHeader>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
