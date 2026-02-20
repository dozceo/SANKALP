"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddStudyMaterial } from "@/components/planner/AddStudyMaterial";
import { StudyLibrary } from "@/components/planner/StudyLibrary";
import { ScheduleView } from "@/components/planner/ScheduleView";
import { FocusTimer } from "@/components/planner/FocusTimer";

export default function PlannerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">My Planner</h1>
        <p className="text-muted-foreground">
          Your central hub for organizing, scheduling, and tackling your studies.
        </p>
      </div>

      <Tabs defaultValue="organize" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="add">Add Data</TabsTrigger>
          <TabsTrigger value="organize">Organize</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="timer">Focus Timer</TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="mt-6">
          <AddStudyMaterial />
        </TabsContent>

        <TabsContent value="organize" className="mt-6">
          <StudyLibrary />
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <ScheduleView />
        </TabsContent>

        <TabsContent value="timer" className="mt-6">
          <FocusTimer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
