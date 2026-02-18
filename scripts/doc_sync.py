import os
import re
import json

# Define the paths
ROOT_DIR = "."
IGNORE_DIRS = {".git", "node_modules", ".genkit", ".jules", "reports", ".idx", "messages", ".DS_Store"}
IGNORE_FILES = {"DOC_SYNC_REPORT.md", "NEW_DOC_SYNC_REPORT.md", "CHANGELOG.md"}

# Feature Keywords to Files mapping
FEATURE_MAP = {
    "Teacher Dashboard": ["src/app/(main)/teacher", "src/components/app/teacher-sidebar-nav.tsx"],
    "Adaptive Quiz": ["src/app/(main)/quiz", "src/components/quiz"],
    "Syllabus Generator": ["src/ai/flows/syllabus-generator.ts"],
    "Database Integration": ["src/lib/db-helpers.ts", "src/lib/firebase.ts"],
    "ML Prediction": ["src/ml/inference/predict_mastery.py"],
    "Student Intelligence API": ["src/app/api/intelligence/student/route.ts"],
}

def get_md_files(root_dir):
    """Recursively find all .md files in the directory."""
    md_files = []
    for root, dirs, files in os.walk(root_dir):
        # Filter directories to ignore
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for file in files:
            if file.endswith(".md") and file not in IGNORE_FILES:
                md_files.append(os.path.join(root, file))
    return md_files

def extract_claims(filepath):
    """Extract file paths, commands, and API endpoints from a markdown file."""
    claims = {
        "files": set(),
        "commands": set(),
        "endpoints": set(),
        "features": set(),
    }

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Extract file paths (src/...)
    # This is a heuristic: words starting with src/ and ending with a file extension or slash
    file_matches = re.findall(r'`?(src/[\w/.-]+)`?', content)
    for match in file_matches:
        match = match.strip('`')
        # Filter out obvious false positives
        if not match.endswith(('.', '/')):
            if '/' in match:
                claims["files"].add(match)

    # Extract commands (lines starting with npm run, python, etc. inside code blocks)
    code_blocks = re.findall(r'```(?:bash|sh|cmd)?\n(.*?)```', content, re.DOTALL)
    for block in code_blocks:
        lines = block.strip().split('\n')
        for line in lines:
            line = line.strip()
            if line.startswith(('npm run', 'python ', 'pip install')):
                claims["commands"].add(line)

    # Extract API endpoints (/api/...)
    endpoint_matches = re.findall(r'`?(/api/[\w/.-]+)`?', content)
    for match in endpoint_matches:
        match = match.strip('`')
        claims["endpoints"].add(match)

    # Extract Features (lines starting with - ** or - [ ])
    feature_matches = re.findall(r'- \*\*(.*?)\*\*', content)
    for match in feature_matches:
        claims["features"].add(match)

    return claims

def verify_files(file_claims):
    """Verify if the claimed files exist."""
    missing_files = []
    broken_links = []
    for path in file_claims:
        full_path = os.path.join(ROOT_DIR, path)
        if not os.path.exists(full_path):
             # Try checking if it's a directory by appending a common file like index.ts/js
             if not os.path.exists(os.path.join(full_path, "index.ts")) and \
                not os.path.exists(os.path.join(full_path, "index.js")) and \
                not os.path.exists(os.path.join(full_path, "page.tsx")) and \
                not os.path.exists(os.path.join(full_path, "route.ts")):
                 broken_links.append(path)
    return broken_links

def verify_commands(command_claims):
    """Verify if npm commands exist in package.json."""
    invalid_commands = []
    try:
        with open("package.json", "r") as f:
            pkg_json = json.load(f)
            scripts = pkg_json.get("scripts", {})
    except FileNotFoundError:
        return ["package.json not found"]

    for cmd in command_claims:
        if cmd.startswith("npm run"):
            parts = cmd.split("npm run ")
            if len(parts) > 1:
                script_name = parts[1].split()[0]
                if script_name not in scripts:
                    invalid_commands.append(cmd)
        elif cmd.startswith("python "):
            parts = cmd.split("python ")
            if len(parts) > 1:
                script_path = parts[1].split()[0]
                # Check absolute and relative to src/ml/training
                if not os.path.exists(script_path) and not os.path.exists(os.path.join("src/ml/training", script_path)):
                    invalid_commands.append(cmd)

    return invalid_commands

def verify_endpoints(endpoint_claims):
    """Verify if API endpoints exist in src/app/api."""
    missing_endpoints = []
    for endpoint in endpoint_claims:
        rel_path = endpoint.lstrip("/")

        # If it looks like a file path already
        if rel_path.endswith(".ts") or rel_path.endswith(".tsx"):
             # It might be src/app/... or src/app/api/...
             # Try constructing the full path
             possible_paths = [
                 os.path.join("src/app", rel_path.replace("api/", "")), # e.g. api/foo/route.ts -> src/app/foo/route.ts
                 os.path.join("src/app", rel_path) # e.g. api/foo/route.ts -> src/app/api/foo/route.ts
             ]
        else:
            possible_paths = [
                os.path.join("src/app", rel_path, "route.ts"),
                os.path.join("src/app", rel_path, "page.tsx"),
                os.path.join("src/app", rel_path, "index.ts"),
                os.path.join("src/app", "api", rel_path.replace("api/", ""), "route.ts"),
            ]

        found = False
        for p in possible_paths:
            if os.path.exists(p):
                found = True
                break

        if not found:
             missing_endpoints.append(endpoint)

    return missing_endpoints

def verify_features(feature_claims):
    """Verify if claimed features exist in codebase based on keywords."""
    missing_features = []
    for feature in feature_claims:
        found_match = False
        for keyword, paths in FEATURE_MAP.items():
            if keyword.lower() in feature.lower():
                found_match = True
                # Check if corresponding files exist
                paths_exist = any(os.path.exists(p) for p in paths)
                if not paths_exist:
                    missing_features.append(f"Feature '{feature}' implies '{keyword}' but implementation at '{paths}' not found.")
                # We can also check if the feature claims "pending" but files exist?
                # That requires parsing "pending".
                break
        # If no keyword matched, we can't verify, so ignore.
    return missing_features

def suggest_fix(broken_path):
    """Suggest a fix for a broken path."""
    # Simple Levenshtein or typo check? Or just check common extensions.
    # e.g. .pk -> .pkl
    if broken_path.endswith(".pk"):
        fixed = broken_path + "l"
        if os.path.exists(fixed):
            return fixed
    if broken_path.endswith(".ts"):
        # Check .tsx
        fixed = broken_path + "x"
        if os.path.exists(fixed):
            return fixed
    return None

def main():
    print("Starting Enhanced Documentation Sync Analysis...")
    md_files = get_md_files(ROOT_DIR)

    report = ["# Documentation Synchronization Report\n"]
    report.append("## 1. Staleness Audit\n")
    report.append("| File | Claim | Reality | Status |")
    report.append("|---|---|---|---|")

    update_proposals = []
    broken_references = []

    for md_file in md_files:
        claims = extract_claims(md_file)

        # Verify Files
        broken = verify_files(claims["files"])
        if broken:
            for b in broken:
                suggestion = suggest_fix(b)
                status = "**Broken Link**"
                reality = "File not found"
                if suggestion:
                    reality = f"Did you mean `{suggestion}`?"
                    update_proposals.append(f"File: `{md_file}`\n- Replace `{b}` with `{suggestion}`")

                report.append(f"| `{md_file}` | File: `{b}` | {reality} | {status} |")
                broken_references.append(f"| `{md_file}` | `{b}` | **Missing** |")

        # Verify Commands
        invalid_cmds = verify_commands(claims["commands"])
        if invalid_cmds:
            for c in invalid_cmds:
                report.append(f"| `{md_file}` | Command: `{c}` | Script missing in package.json | **Invalid Command** |")

        # Verify Endpoints
        missing_eps = verify_endpoints(claims["endpoints"])
        if missing_eps:
            for e in missing_eps:
                report.append(f"| `{md_file}` | Endpoint: `{e}` | Route not found in `src/app/api` | **Missing Endpoint** |")

        # Verify Features
        missing_feats = verify_features(claims["features"])
        if missing_feats:
            for f in missing_feats:
                report.append(f"| `{md_file}` | Feature: `{f}` | Implementation missing | **Unimplemented Feature** |")

    report.append("\n## 2. Update Proposals (Patches)\n")
    if update_proposals:
        for prop in update_proposals:
            report.append(f"- {prop}")
    else:
        report.append("No specific patches generated.")

    report.append("\n## 3. Broken Reference Inventory\n")
    report.append("| File | Referenced Path | Status |")
    report.append("|---|---|---|")
    report.extend(broken_references)

    output_file = "DOC_SYNC_REPORT.md"
    with open(output_file, "w") as f:
        f.write("\n".join(report))

    print(f"Report generated: {output_file}")

if __name__ == "__main__":
    main()
