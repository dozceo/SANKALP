"use client";

import { useState } from "react";
import { useStudent } from "@/contexts/StudentContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";

export function AddStudyMaterial() {
    const { currentStudent } = useStudent();
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Add material to student data via context
        console.log("Submitting study material:", formData);

        // Reset form
        setFormData({
            subject: "",
            topic: "",
            chapter: "",
            detailedNotes: "",
            referenceLinks: [""],
        });
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
                    <div className="grid grid-cols-2 gap-4">
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
                        <Label>Reference Links</Label>
                        {formData.referenceLinks.map((link, index) => (
                            <div key={index} className="flex gap-2">
                                <Input
                                    placeholder="https://example.com"
                                    value={link}
                                    onChange={(e) => updateReferenceLink(index, e.target.value)}
                                />
                                {formData.referenceLinks.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
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

                    <Button type="submit" className="w-full">
                        Add Material
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
