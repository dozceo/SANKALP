"use client";

import { useState, useMemo } from "react";
import { useStudent } from "@/hooks/useStudent";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { BookOpen, Search, Filter, ExternalLink, X } from "lucide-react";
import type { StudyMaterial } from "@/data/docsData";

export function StudyLibrary() {
    const { currentStudent } = useStudent();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterSubject, setFilterSubject] = useState("all");
    const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);

    // Get study materials from current student
    const studyMaterials = currentStudent?.studyMaterials || [];

    // Get unique subjects
    const subjects = useMemo(() => {
        const set = new Set<string>();
        for (const m of studyMaterials) set.add(m.subject);
        return Array.from(set);
    }, [studyMaterials]);

    // Filter materials
    const filteredMaterials = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        return studyMaterials.filter(material => {
            const matchesSearch = material.topic.toLowerCase().includes(lowerSearch) ||
                material.subject.toLowerCase().includes(lowerSearch);
            const matchesFilter = filterSubject === "all" || material.subject === filterSubject;
            return matchesSearch && matchesFilter;
        });
    }, [studyMaterials, searchTerm, filterSubject]);

    // Status badge styles
    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Due':
                return 'destructive';
            case 'Upcoming':
                return 'default';
            case 'Reviewed':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    if (!currentStudent) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Your Study Library</CardTitle>
                    <CardDescription>
                        All your study materials in one place. Filter and search to manage your knowledge base.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search topics..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                                aria-label="Search study materials"
                            />
                        </div>
                        <Select value={filterSubject} onValueChange={setFilterSubject}>
                            <SelectTrigger className="w-full sm:w-[200px]" aria-label="Filter by subject">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Filter by subject" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Subjects</SelectItem>
                                {subjects.map(subject => (
                                    <SelectItem key={subject} value={subject}>
                                        {subject}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {filteredMaterials.length === 0 ? (
                        <div className="text-center py-12">
                            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No study materials found</h3>
                            <p className="text-muted-foreground">
                                {searchTerm || filterSubject !== "all"
                                    ? "Try adjusting your filters"
                                    : "Add your first study material to get started"}
                            </p>
                            {(searchTerm || filterSubject !== "all") && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setFilterSubject("all");
                                    }}
                                    className="mt-4"
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredMaterials.map(material => (
                                <Card key={material.id} className="hover:border-primary transition-colors">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="text-sm text-muted-foreground mb-1">
                                                    {material.subject}
                                                </div>
                                                <CardTitle className="text-lg">{material.topic}</CardTitle>
                                                {material.chapter && (
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {material.chapter}
                                                    </p>
                                                )}
                                            </div>
                                            <Badge variant={getStatusVariant(material.status)}>
                                                {material.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Next Review:</span>{" "}
                                                <span className="font-medium">
                                                    {new Date(material.nextReview).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {material.lastReviewed && (
                                                <div className="text-sm">
                                                    <span className="text-muted-foreground">Last Reviewed:</span>{" "}
                                                    <span className="font-medium">
                                                        {new Date(material.lastReviewed).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full mt-4"
                                                onClick={() => setSelectedMaterial(material)}
                                            >
                                                View Details
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Detail Dialog */}
            <Dialog open={!!selectedMaterial} onOpenChange={(open: boolean) => !open && setSelectedMaterial(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    {selectedMaterial && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant={getStatusVariant(selectedMaterial.status)}>
                                        {selectedMaterial.status}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">{selectedMaterial.subject}</span>
                                </div>
                                <DialogTitle className="text-xl">{selectedMaterial.topic}</DialogTitle>
                                {selectedMaterial.chapter && (
                                    <DialogDescription>{selectedMaterial.chapter}</DialogDescription>
                                )}
                            </DialogHeader>

                            <div className="space-y-4 mt-4">
                                {/* Notes */}
                                {selectedMaterial.detailedNotes && (
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2">Notes</h4>
                                        <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap">
                                            {selectedMaterial.detailedNotes}
                                        </div>
                                    </div>
                                )}

                                {/* Review Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-muted/30 rounded-lg p-3">
                                        <div className="text-xs text-muted-foreground mb-1">Next Review</div>
                                        <div className="text-sm font-medium">
                                            {new Date(selectedMaterial.nextReview).toLocaleDateString()}
                                        </div>
                                    </div>
                                    {selectedMaterial.lastReviewed && (
                                        <div className="bg-muted/30 rounded-lg p-3">
                                            <div className="text-xs text-muted-foreground mb-1">Last Reviewed</div>
                                            <div className="text-sm font-medium">
                                                {new Date(selectedMaterial.lastReviewed).toLocaleDateString()}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Reference Links */}
                                {selectedMaterial.referenceLinks && selectedMaterial.referenceLinks.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2">Reference Links</h4>
                                        <div className="space-y-2">
                                            {selectedMaterial.referenceLinks.map((link, i) => (
                                                <a
                                                    key={i}
                                                    href={link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                                                >
                                                    <ExternalLink className="h-3 w-3" />
                                                    {link}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
