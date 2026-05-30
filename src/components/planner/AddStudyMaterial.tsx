"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useStudent } from "@/hooks/useStudent";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Loader2, GitBranch } from "lucide-react";

export function AddStudyMaterial() {
    const { user } = useAuth();
    const { addStudyMaterial } = useStudent();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [converting, setConverting] = useState(false);
    const [lastSavedId, setLastSavedId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        subject: "",
        topic: "",
        chapter: "",
        detailedNotes: "",
        referenceLinks: [""],
    });

    const addReferenceLink = () => {
        setFormData({
            ...formData,
            referenceLinks: [...formData.referenceLinks, ""],
        });
    };

    const updateReferenceLink = (index: number, value: string) => {
        const newLinks = [...formData.referenceLinks];
        newLinks[index] = value;
        setFormData({ ...formData, referenceLinks: newLinks });
    };

    const removeReferenceLink = (index: number) => {
        const newLinks = formData.referenceLinks.filter((_, i) => i !== index);
        setFormData({ ...formData, referenceLinks: newLinks });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast({
                title: 'Not authenticated',
                description: 'Please sign in first',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const itemId = await addStudyMaterial({
                subject: formData.subject,
                topic: formData.topic,
                chapter: formData.chapter,
                detailedNotes: formData.detailedNotes,
                referenceLinks: formData.referenceLinks,
            });

            setLastSavedId(itemId);

            toast({
                title: 'Study material added!',
                description: 'Your notes have been saved successfully',
            });

            // Reset form
            setFormData({
                subject: "",
                topic: "",
                chapter: "",
                detailedNotes: "",
                referenceLinks: [""],
            });
        } catch (error: any) {
            toast({
                title: 'Failed to add material',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleConvertToBrainMap = async () => {
        if (!lastSavedId) return;

        setConverting(true);

        try {
            const response = await fetch('/api/planner/convert-to-node', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plannerItemId: lastSavedId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to convert');
            }

            toast({
                title: 'Converted to brain map!',
                description: 'Your study material is now a node in your brain map',
            });

            setLastSavedId(null);
        } catch (error: any) {
            toast({
                title: 'Conversion failed',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setConverting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add New Study Material</CardTitle>
                <CardDescription>
                    Input your new study information. This becomes the foundation for your flashcards and mind maps.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                                id="subject"
                                placeholder="e.g., Physics"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="topic">Topic</Label>
                            <Input
                                id="topic"
                                placeholder="e.g., Newton's Laws of Motion"
                                value={formData.topic}
                                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="chapter">Chapter (Optional)</Label>
                        <Input
                            id="chapter"
                            placeholder="e.g., Chapter 3: Motion"
                            value={formData.chapter}
                            onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Detailed Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Add your notes, key concepts, and summaries here..."
                            rows={6}
                            value={formData.detailedNotes}
                            onChange={(e) => setFormData({ ...formData, detailedNotes: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label id="reference-links-label">Reference Links</Label>
                        <div role="group" aria-labelledby="reference-links-label" className="space-y-2">
                            {formData.referenceLinks.map((link, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        placeholder="https://example.com"
                                        value={link}
                                        onChange={(e) => updateReferenceLink(index, e.target.value)}
                                        aria-label={`Reference link ${index + 1}`}
                                    />
                                    {formData.referenceLinks.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon" aria-label={`Remove reference link ${index + 1}`}
                                            onClick={() => removeReferenceLink(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addReferenceLink}
                                className="w-full"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Reference Link
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="file">File Upload</Label>
                        <Input
                            id="file"
                            type="file"
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                            className="cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground">
                            Upload relevant documents, diagrams, or lecture slides
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" className="flex-1" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Material
                        </Button>
                        {lastSavedId && (
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleConvertToBrainMap}
                                disabled={converting}
                                className="flex-1"
                            >
                                {converting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <GitBranch className="mr-2 h-4 w-4" />
                                Convert to Brain Map
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
