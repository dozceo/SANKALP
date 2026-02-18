#!/usr/bin/env python3
"""
Semantic Documentation Synchronizer: CLI Tool

Scans Markdown documentation files in the repository to identify stale claims,
broken file references, and missing API endpoints. Generates a comprehensive
synchronization report.

Usage:
    python3 scripts/doc_sync.py [--config CONFIG] [--output OUTPUT] [--verbose]

Author: Jules (AI Agent)
"""

import os
import re
import json
import argparse
import sys
from typing import List, Dict, Set, Optional, Any, Union

# --- Configuration Loading ---

def load_config(config_path: str = "doc-sync.config.json") -> Dict[str, Any]:
    """Loads configuration from a JSON file. Falls back to defaults if missing."""
    defaults: Dict[str, Any] = {
        "root_dir": ".",
        "ignore_dirs": [".git", "node_modules", ".genkit", ".jules", "reports", ".idx", "messages", ".DS_Store"],
        "ignore_files": ["DOC_SYNC_REPORT.md", "NEW_DOC_SYNC_REPORT.md", "CHANGELOG.md"],
        "feature_map": {},
        "package_json_path": "package.json",
        "api_root": "src/app/api"
    }

    if not os.path.exists(config_path):
        print(f"Warning: Configuration file '{config_path}' not found. Using defaults.")
        return defaults

    try:
        with open(config_path, "r", encoding="utf-8") as f:
            user_config = json.load(f)
            # Merge with defaults (shallow merge)
            defaults.update(user_config)
            return defaults
    except json.JSONDecodeError as e:
        print(f"Error: Failed to parse configuration file '{config_path}': {e}")
        sys.exit(1)

# --- Data Structures ---

class DocClaims:
    """Stores extracted claims from a markdown file."""
    def __init__(self):
        self.files: Set[str] = set()
        self.commands: Set[str] = set()
        self.endpoints: Set[str] = set()
        self.features: Set[str] = set()

# --- File Scanning & Extraction ---

def get_md_files(root_dir: str, ignore_dirs: List[str], ignore_files: List[str]) -> List[str]:
    """Recursively finds all .md files in the root directory, respecting ignore lists."""
    md_files = []
    ignore_dirs_set = set(ignore_dirs)
    ignore_files_set = set(ignore_files)

    for root, dirs, files in os.walk(root_dir):
        # Filter directories in-place
        dirs[:] = [d for d in dirs if d not in ignore_dirs_set]

        for file in files:
            if file.endswith(".md") and file not in ignore_files_set:
                md_files.append(os.path.join(root, file))
    return md_files

def extract_claims(filepath: str) -> DocClaims:
    """Extracts file paths, commands, endpoints, and feature claims from a markdown file."""
    claims = DocClaims()

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading file '{filepath}': {e}")
        return claims

    # 1. Extract File Paths (heuristic: starts with src/)
    # Regex: Look for backticked paths or plain text paths containing src/
    file_matches = re.findall(r'`?(src/[\w/.-]+)`?', content)
    for match in file_matches:
        match = match.strip('`')
        # Simple validation: looks like a path
        if not match.endswith(('.', '/')) and '/' in match:
             claims.files.add(match)

    # 2. Extract Commands (npm run, python, pip install inside code blocks)
    code_blocks = re.findall(r'```(?:bash|sh|cmd)?\n(.*?)```', content, re.DOTALL)
    for block in code_blocks:
        lines = block.strip().split('\n')
        for line in lines:
            line = line.strip()
            if line.startswith(('npm run', 'python ', 'pip install')):
                claims.commands.add(line)

    # 3. Extract API Endpoints (/api/...)
    endpoint_matches = re.findall(r'`?(/api/[\w/.-]+)`?', content)
    for match in endpoint_matches:
        match = match.strip('`')
        claims.endpoints.add(match)

    # 4. Extract Features (heuristic: bullet points starting with bold text)
    feature_matches = re.findall(r'- \*\*(.*?)\*\*', content)
    for match in feature_matches:
        claims.features.add(match)

    return claims

# --- Verification Logic ---

def verify_files(file_claims: Set[str], root_dir: str) -> List[str]:
    """Verifies if claimed file paths exist on the filesystem."""
    broken_links = []
    for path in file_claims:
        full_path = os.path.join(root_dir, path)
        if not os.path.exists(full_path):
            # Check for common implicit extensions or index files if it's a directory reference
            if not (os.path.exists(os.path.join(full_path, "index.ts")) or
                    os.path.exists(os.path.join(full_path, "index.js")) or
                    os.path.exists(os.path.join(full_path, "page.tsx")) or
                    os.path.exists(os.path.join(full_path, "route.ts"))):
                broken_links.append(path)
    return broken_links

def verify_commands(command_claims: Set[str], package_json_path: str, root_dir: str) -> List[str]:
    """Verifies if npm commands exist in package.json or python scripts exist."""
    invalid_commands = []
    scripts = {}

    if os.path.exists(package_json_path):
        try:
            with open(package_json_path, "r", encoding="utf-8") as f:
                pkg_json = json.load(f)
                scripts = pkg_json.get("scripts", {})
        except json.JSONDecodeError:
            print(f"Warning: Failed to parse {package_json_path}")

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
                # Check relative to root and src/ml/training (common location)
                if not os.path.exists(os.path.join(root_dir, script_path)) and \
                   not os.path.exists(os.path.join(root_dir, "src/ml/training", script_path)):
                    invalid_commands.append(cmd)

    return invalid_commands

def verify_endpoints(endpoint_claims: Set[str], root_dir: str) -> List[str]:
    """Verifies if API endpoints map to existing route files in Next.js App Router."""
    missing_endpoints = []

    for endpoint in endpoint_claims:
        rel_path = endpoint.lstrip("/")

        # Heuristic: If path looks like a file, try checking that file directly
        if rel_path.endswith(".ts") or rel_path.endswith(".tsx"):
             possible_paths = [
                 os.path.join(root_dir, "src/app", rel_path.replace("api/", "")),
                 os.path.join(root_dir, "src/app", rel_path)
             ]
        else:
            # Standard Next.js route mapping
            possible_paths = [
                os.path.join(root_dir, "src/app", rel_path, "route.ts"),
                os.path.join(root_dir, "src/app", rel_path, "page.tsx"), # Maybe a page route?
                os.path.join(root_dir, "src/app", rel_path, "index.ts"),
                # Handle /api prefix: /api/user -> src/app/api/user/route.ts
                os.path.join(root_dir, "src/app", "api", rel_path.replace("api/", ""), "route.ts"),
            ]

        found = False
        for p in possible_paths:
            if os.path.exists(p):
                found = True
                break

        if not found:
             missing_endpoints.append(endpoint)

    return missing_endpoints

def verify_features(feature_claims: Set[str], feature_map: Dict[str, List[str]], root_dir: str) -> List[str]:
    """Verifies if claimed features have corresponding implementation files."""
    missing_features = []
    for feature in feature_claims:
        for keyword, paths in feature_map.items():
            if keyword.lower() in feature.lower():
                # Check if corresponding files exist
                paths_exist = any(os.path.exists(os.path.join(root_dir, p)) for p in paths)
                if not paths_exist:
                    missing_features.append(f"Feature '{feature}' implies '{keyword}' but implementation files not found.")
                break
    return missing_features

def suggest_fix(broken_path: str, root_dir: str) -> Optional[str]:
    """Suggests simple fixes for broken paths (e.g., typos, extensions)."""
    # Common typo: .pk -> .pkl
    if broken_path.endswith(".pk"):
        fixed = broken_path + "l"
        if os.path.exists(os.path.join(root_dir, fixed)):
            return fixed
    # Missing extension: .ts -> .tsx
    if broken_path.endswith(".ts"):
        fixed = broken_path + "x"
        if os.path.exists(os.path.join(root_dir, fixed)):
            return fixed
    return None

# --- Main Logic ---

def main():
    parser = argparse.ArgumentParser(description="Semantic Documentation Synchronizer")
    parser.add_argument("--config", default="doc-sync.config.json", help="Path to configuration file")
    parser.add_argument("--output", default="DOC_SYNC_REPORT.md", help="Output report file path")
    parser.add_argument("--verbose", action="store_true", help="Enable verbose logging")

    args = parser.parse_args()

    config = load_config(args.config)
    root_dir = config.get("root_dir", ".")

    if args.verbose:
        print(f"Loaded configuration from {args.config}")
        print(f"Scanning root directory: {root_dir}")

    md_files = get_md_files(root_dir, config.get("ignore_dirs", []), config.get("ignore_files", []))

    if args.verbose:
        print(f"Found {len(md_files)} Markdown files to analyze.")

    report = ["# Documentation Synchronization Report\n"]
    report.append("## 1. Staleness Audit\n")
    report.append("| File | Claim | Reality | Status |")
    report.append("|---|---|---|---|")

    update_proposals = []
    broken_references = []

    for md_file in md_files:
        if args.verbose:
            print(f"Analyzing {md_file}...")

        claims = extract_claims(md_file)

        # Verify Files
        broken = verify_files(claims.files, root_dir)
        if broken:
            for b in broken:
                suggestion = suggest_fix(b, root_dir)
                status = "**Broken Link**"
                reality = "File not found"
                if suggestion:
                    reality = f"Did you mean `{suggestion}`?"
                    update_proposals.append(f"File: `{md_file}`\n- Replace `{b}` with `{suggestion}`")

                report.append(f"| `{md_file}` | File: `{b}` | {reality} | {status} |")
                broken_references.append(f"| `{md_file}` | `{b}` | **Missing** |")

        # Verify Commands
        invalid_cmds = verify_commands(claims.commands, config.get("package_json_path", "package.json"), root_dir)
        if invalid_cmds:
            for c in invalid_cmds:
                report.append(f"| `{md_file}` | Command: `{c}` | Script missing in package.json | **Invalid Command** |")

        # Verify Endpoints
        missing_eps = verify_endpoints(claims.endpoints, root_dir)
        if missing_eps:
            for e in missing_eps:
                report.append(f"| `{md_file}` | Endpoint: `{e}` | Route not found in `src/app/api` | **Missing Endpoint** |")

        # Verify Features
        missing_feats = verify_features(claims.features, config.get("feature_map", {}), root_dir)
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

    try:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write("\n".join(report))
        print(f"Report generated: {args.output}")
    except IOError as e:
        print(f"Error writing report to {args.output}: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
