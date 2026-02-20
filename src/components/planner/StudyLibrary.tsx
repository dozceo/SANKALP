"use client";

import { useState } from "react";
import { useStudent } from "@/contexts/StudentContext";
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
import { BookOpen, Search, Filter } from "lucide-react";

export function StudyLibrary() {
    const { currentStudent } = useStudent();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterSubject, setFilterSubject] = useState("all");

    // Get study materials from current student
    const studyMaterials = currentStudent?.studyMaterials || [];

    // Get unique subjects
    const subjects = Array.from(new Set(studyMaterials.map(m => m.subject)));

    // Filter materials
    const filteredMaterials = studyMaterials.filter(material => {
        const matchesSearch = material.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
            material.subject.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterSubject === "all" || material.subject === filterSubject;
        return matchesSearch && matchesFilter;
    });

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
                    <div className="flex gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search topics..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterSubject} onValueChange={setFilterSubject}>
                            <SelectTrigger className="w-[200px]">
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
                                            <Button variant="outline" size="sm" className="w-full mt-4">
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
        </div>
    );
}
