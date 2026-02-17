
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, BookCopy, AlertTriangle, Link as LinkIcon, CalendarClock, Zap, Save } from "lucide-react";
import { getSyllabus } from "./actions";
import { type SyllabusOutput } from "@/ai/flows/syllabus-generator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from 'next-intl';

export default function SyllabusPage() {
  const [query, setQuery] = useState("");
  const [syllabus, setSyllabus] = useState<SyllabusOutput | null>(null);
  const [source, setSource] = useState<'ai' | 'fallback' | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('Syllabus');

  // Load cached syllabus on mount
  useEffect(() => {
    const cached = sessionStorage.getItem('lastSyllabus');
    if (cached) {
      try {
        setSyllabus(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse cached syllabus", e);
      }
    }
  }, []);

  // Cache syllabus when it changes
  useEffect(() => {
    if (syllabus) {
      sessionStorage.setItem('lastSyllabus', JSON.stringify(syllabus));
    }
  }, [syllabus]);

  const handleSave = async () => {
    if (!user || !syllabus) return;
    setSaving(true);
    try {
      const response = await fetch('/api/syllabus/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.uid,
          examName: query,
          title: syllabus.title,
          structure: syllabus.structure,
          strategy: syllabus.strategy,
        }),
      });

      if (response.ok) {
        toast({
          title: "Syllabus Saved!",
          description: "Your syllabus has been added to your planner.",
        });
      } else {
        throw new Error("Failed to save syllabus");
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to save the syllabus. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSyllabus(null);
    setSource(null);
    try {
      const result = await getSyllabus(query);
      if (result) {
        setSyllabus(result.data);
        setSource(result.source);
      } else {
        setError("Could not retrieve the syllabus. Please try a different query.");
      }
    } catch (e) {
      console.error("[SyllabusUI] Search failed:", e);
      setError("An unexpected error occurred. Please try again later.");
    }
    setLoading(false);
  };

  const examDate = new Date();
  examDate.setDate(examDate.getDate() + 2); // Set exam date to 2 days from now for demonstration
  const today = new Date();
  const timeDiff = examDate.getTime() - today.getTime();
  const daysUntilExam = Math.ceil(timeDiff / (1000 * 3600 * 24));
  const isCrammingTime = daysUntilExam <= 3 && daysUntilExam >= 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <Tabs defaultValue="syllabus">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 h-auto">
          <TabsTrigger value="syllabus" className="py-2">Syllabus</TabsTrigger>
          <TabsTrigger value="cramming" disabled={!isCrammingTime} className="py-2">
            <Zap className="mr-2 h-4 w-4" /> Cramming Helper
            {!isCrammingTime && <span className="ml-2 text-xs text-muted-foreground">(Activates 3 days before exam)</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="syllabus" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Syllabus Finder</CardTitle>
              <CardDescription>Enter your exam or subject to get the latest official syllabus, strategy, and materials.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
                className="flex w-full max-w-lg items-center space-x-2"
              >
                <Input
                  type="text"
                  placeholder="e.g., 'AP Calculus BC', 'NEET Biology'"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={loading}
                />
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  <span className="sr-only sm:not-sr-only sm:ml-2">{t('generateButton')}</span>
                </Button>
              </form>
            </CardContent>
          </Card>

          {error && (
            <Card className="mt-6 border-destructive">
              <CardHeader className="flex flex-row items-center gap-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <div>
                  <CardTitle className="text-destructive">Search Failed</CardTitle>
                  <CardDescription>{error}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          )}

          {syllabus && (
            <Card className="mt-6">
              {source === 'fallback' && (
                <div className="bg-amber-50 text-amber-700 px-4 py-2 text-xs border-b border-amber-100 flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3" />
                  Note: Using standard syllabus template. AI generation is currently unavailable.
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl font-headline">
                  <BookCopy /> {syllabus.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Structure</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{syllabus.structure}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><CalendarClock className="w-5 h-5" /> Strategy & Timeline</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{syllabus.strategy}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><LinkIcon className="w-5 h-5" /> Reference Links</h3>
                  <ul className="space-y-2">
                    {syllabus.references.map((link, index) => (
                      <li key={index}>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-4 border-t">
                  <Button onClick={handleSave} disabled={saving} className="w-full">
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save Syllabus to Planner
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="cramming" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-amber-500">Last-Minute Cramming Helper</CardTitle>
              <CardDescription>It's go-time! Here are some focused tips for the final push before your exam on {examDate.toLocaleDateString()}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">Key Topics to Review</h4>
                <ul className="list-disc list-inside text-muted-foreground mt-2">
                  <li>Focus on high-yield topics first.</li>
                  <li>Review summary sheets and flashcards.</li>
                  <li>Don't try to learn new complex concepts now.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">Quick Tips</h4>
                <ul className="list-disc list-inside text-muted-foreground mt-2">
                  <li>Do one final mock test to simulate exam conditions.</li>
                  <li>Get at least 7-8 hours of sleep the night before.</li>
                  <li>Review formulas and key definitions one last time in the morning.</li>
                </ul>
              </div>
              <Button>Generate a Quick 5-Question Refresher Quiz</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
