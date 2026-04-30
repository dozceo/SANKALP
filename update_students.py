import re

with open('src/app/(main)/teacher/students/page.tsx', 'r') as f:
    content = f.read()

# Add useRef
content = content.replace('import { useState, useEffect, useMemo } from "react";', 'import { useState, useEffect, useMemo, useRef } from "react";')

# Add X to lucide-react imports if not there
if ' X,' not in content and 'X ' not in content:
    content = content.replace('    Clock,\n} from "lucide-react";', '    Clock,\n    X,\n} from "lucide-react";')

# Add searchInputRef
content = content.replace('const [searchQuery, setSearchQuery] = useState("");', 'const [searchQuery, setSearchQuery] = useState("");\n    const searchInputRef = useRef<HTMLInputElement>(null);')

# Update Input inside the relative container
input_block = """                                <Input
                                    placeholder="Search students..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />"""

new_input_block = """                                <Input
                                    ref={searchInputRef}
                                    placeholder="Search students..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-10"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery("");
                                            searchInputRef.current?.focus();
                                        }}
                                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                                        aria-label="Clear search"
                                    >
                                        <X className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                )}"""

content = content.replace(input_block, new_input_block)

with open('src/app/(main)/teacher/students/page.tsx', 'w') as f:
    f.write(content)
