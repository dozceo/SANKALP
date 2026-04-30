import re

with open('src/components/planner/StudyLibrary.tsx', 'r') as f:
    content = f.read()

# Add useRef
content = content.replace('import { useState, useMemo } from "react";', 'import { useState, useMemo, useRef } from "react";')

# Add searchInputRef
content = content.replace('const [searchTerm, setSearchTerm] = useState("");', 'const [searchTerm, setSearchTerm] = useState("");\n    const searchInputRef = useRef<HTMLInputElement>(null);')

# Update Input inside the relative flex-1 container
input_block = """                            <Input
                                placeholder="Search topics..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                                aria-label="Search study materials"
                            />"""

new_input_block = """                            <Input
                                ref={searchInputRef}
                                placeholder="Search topics..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-10"
                                aria-label="Search study materials"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm("");
                                        searchInputRef.current?.focus();
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                                    aria-label="Clear search"
                                >
                                    <X className="h-4 w-4" aria-hidden="true" />
                                </button>
                            )}"""

content = content.replace(input_block, new_input_block)

with open('src/components/planner/StudyLibrary.tsx', 'w') as f:
    f.write(content)
