import os
import json
import subprocess
import glob
import re

REPORTS_DIR = "reports"
os.makedirs(REPORTS_DIR, exist_ok=True)

def run_command(command, cwd=None, capture_output=True):
    try:
        result = subprocess.run(
            command,
            cwd=cwd,
            shell=True,
            text=True,
            capture_output=capture_output
        )
        return result.stdout, result.stderr, result.returncode
    except Exception as e:
        return "", str(e), 1

def task_30_dependency_scan():
    print("Running Task 30: Dependency Scan...")
    # Node dependencies
    stdout, stderr, code = run_command("pnpm audit --json")
    try:
        audit_data = json.loads(stdout)
    except json.JSONDecodeError:
        audit_data = {"error": "Failed to parse pnpm audit output", "raw": stdout}

    # Python dependencies
    python_reqs = glob.glob("src/ml/*/requirements.txt")
    python_deps = {}
    for req_file in python_reqs:
        with open(req_file, 'r') as f:
            python_deps[req_file] = f.read().splitlines()

    report_content = "# Dependency Vulnerability Report\n\n"
    report_content += "## Node.js Dependencies (pnpm audit)\n\n"

    if "advisories" in audit_data:
        # pnpm audit v6 format
        advisories = audit_data.get("advisories", {})
        if not advisories:
            report_content += "No known vulnerabilities found.\n"
        else:
            for id, adv in advisories.items():
                report_content += f"### {adv.get('title')} ({adv.get('severity')})\n"
                report_content += f"- Package: {adv.get('module_name')}\n"
                report_content += f"- URL: {adv.get('url')}\n\n"
    elif "vulnerabilities" in audit_data:
        # pnpm audit v7+ format might differ, usually it's a list or nested structure
        # Simplified handling
        vulns = audit_data.get("vulnerabilities", {})
        if not vulns:
             report_content += "No known vulnerabilities found.\n"
        else:
            report_content += "Vulnerabilities found:\n"
            report_content += "```json\n" + json.dumps(vulns, indent=2) + "\n```\n"
    else:
         report_content += "Audit output format unrecognized or no issues found.\n"
         if "raw" in audit_data:
             report_content += f"\nRaw Output:\n```\n{audit_data['raw']}\n```\n"

    report_content += "\n## Python Dependencies\n\n"
    for file, deps in python_deps.items():
        report_content += f"### {file}\n"
        report_content += "```\n" + "\n".join(deps) + "\n```\n"
        report_content += "*Note: Manual review against CVE database recommended for Python packages.*\n\n"

    with open(os.path.join(REPORTS_DIR, "DEPENDENCY_VULNERABILITY_REPORT.md"), "w") as f:
        f.write(report_content)

def task_31_build_analysis():
    print("Running Task 31: Build Analysis...")
    config_file = "next.config.ts"
    report_content = "# Build Performance Report\n\n"

    if os.path.exists(config_file):
        with open(config_file, "r") as f:
            content = f.read()

        report_content += "## next.config.ts Analysis\n\n"
        if "swcMinify" in content:
            report_content += "- `swcMinify` detected: Checking value...\n"
        else:
            report_content += "- `swcMinify`: Not explicitly set (Next.js 13+ defaults to true).\n"

        if "compiler" in content:
             report_content += "- Custom compiler options detected.\n"

        if "turbopack" in content:
             report_content += "- Turbopack usage detected in config.\n"

    else:
        report_content += "next.config.ts not found.\n"

    with open("package.json", "r") as f:
        pkg = json.load(f)

    report_content += "\n## Package.json Build Scripts\n\n"
    scripts = pkg.get("scripts", {})
    if "dev" in scripts and "--turbopack" in scripts["dev"]:
        report_content += "- `dev` script uses `--turbopack`. Good for iteration speed.\n"
    else:
        report_content += "- `dev` script does NOT use `--turbopack`. Recommend adding it.\n"

    report_content += "\n## Recommendations\n"
    report_content += "1. Ensure `swcMinify: true` is enabled (default).\n"
    report_content += "2. Use `next build --debug` to profile build if slow.\n"
    report_content += "3. Verify `.next/cache` is persisting in CI/CD.\n"

    with open(os.path.join(REPORTS_DIR, "BUILD_PERFORMANCE_REPORT.md"), "w") as f:
        f.write(report_content)

def task_32_api_audit():
    print("Running Task 32: API Audit...")
    api_dir = "src/app/api"
    report_content = "# API Naming & REST Convention Audit\n\n"

    report_content += "| Path | Methods | Naming Convention |\n"
    report_content += "|---|---|---|\n"

    for root, dirs, files in os.walk(api_dir):
        if "route.ts" in files:
            rel_path = os.path.relpath(root, api_dir)
            path_segments = rel_path.split(os.sep)

            # Check naming (kebab-case preferred for URLs)
            naming_issue = []
            for segment in path_segments:
                if re.search(r'[A-Z]', segment):
                    naming_issue.append(f"Uppercased segment: {segment}")
                if "_" in segment:
                    naming_issue.append(f"Underscore in segment: {segment}")

            # Check methods
            with open(os.path.join(root, "route.ts"), "r") as f:
                content = f.read()
            methods = []
            for m in ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"]:
                if f"export async function {m}" in content or f"export const {m}" in content:
                    methods.append(m)

            status = "✅ Clean"
            if naming_issue:
                status = "⚠️ " + ", ".join(naming_issue)

            report_content += f"| /api/{rel_path} | {', '.join(methods)} | {status} |\n"

    with open(os.path.join(REPORTS_DIR, "API_NAMING_AUDIT.md"), "w") as f:
        f.write(report_content)

def task_33_35_ast_analysis():
    print("Running Task 33 & 35: AST Analysis...")
    stdout, stderr, code = run_command("npx tsx scripts/ast_analysis.ts")
    if code != 0:
        print("Error running ast_analysis.ts:", stderr)
        return

    try:
        data = json.loads(stdout)
    except:
        print("Failed to parse AST analysis output")
        return

    # Task 33 Report
    hooks_report = "# Hook Dependency Audit\n\n"
    hooks_report += "| File | Line | Hook | Dependencies | Status |\n"
    hooks_report += "|---|---|---|---|---|\n"

    for item in data.get("hooks", []):
        deps = item.get("deps")
        status = "✅ OK"
        dep_str = "[]"
        if deps is None:
            status = "⚠️ No dependency array (runs on every render)"
            dep_str = "N/A"
        else:
            dep_str = f"`[{', '.join(deps)}]`"
            # Heuristic: empty deps for useEffect might be intentional (mount only)
            if not deps and item["hook"] == "useEffect":
                status = "ℹ️ Mount only"
            else:
                status = "✅ Array Present"

        hooks_report += f"| {item['file']} | {item['line']} | {item['hook']} | {dep_str} | {status} |\n"

    with open(os.path.join(REPORTS_DIR, "HOOK_DEPENDENCY_AUDIT.md"), "w") as f:
        f.write(hooks_report)

    # Task 35 Report
    strict_report = "# Type Safety Violation Report\n\n"
    strict_report += "| File | Line | Type | Recommendation |\n"
    strict_report += "|---|---|---|---|\n"

    for item in data.get("strict", []):
        rec = ""
        if item['type'] == 'any':
            rec = "Replace `any` with specific type or `unknown`."
        elif item['type'] == 'non-null-assertion':
            rec = "Use optional chaining `?.` or type guard."
        elif item['type'] == 'ts-ignore':
            rec = "Remove `@ts-ignore` and fix type error."

        strict_report += f"| {item['file']} | {item['line']} | {item['type']} | {rec} |\n"

    with open(os.path.join(REPORTS_DIR, "TYPE_SAFETY_VIOLATION_REPORT.md"), "w") as f:
        f.write(strict_report)

def task_34_error_boundary():
    print("Running Task 34: Error Boundary Coverage...")
    report_content = "# Error Boundary Coverage Report\n\n"
    report_content += "## Next.js App Router `error.tsx` Coverage\n\n"
    report_content += "| Directory | Has error.tsx | Status |\n"
    report_content += "|---|---|---|\n"

    app_dir = "src/app"
    for root, dirs, files in os.walk(app_dir):
        rel_path = os.path.relpath(root, app_dir)
        if rel_path == ".": rel_path = "/"

        has_page = "page.tsx" in files or "page.js" in files
        has_layout = "layout.tsx" in files or "layout.js" in files

        if has_page or has_layout:
            has_error = "error.tsx" in files or "error.js" in files
            status = "✅ Covered" if has_error else "⚠️ Missing"
            report_content += f"| {rel_path} | {has_error} | {status} |\n"

    report_content += "\n## Component Manual `ErrorBoundary` Usage\n\n"
    report_content += "Scanning `src/components` for `<ErrorBoundary>`...\n\n"

    components_dir = "src/components"
    found_usage = []
    for root, dirs, files in os.walk(components_dir):
        for file in files:
            if file.endswith(".tsx") or file.endswith(".ts"):
                path_full = os.path.join(root, file)
                with open(path_full, "r") as f:
                    if "<ErrorBoundary" in f.read():
                        found_usage.append(path_full)

    if found_usage:
        for f in found_usage:
            report_content += f"- Found usage in `{f}`\n"
    else:
        report_content += "No manual `<ErrorBoundary>` usage found in components.\n"

    with open(os.path.join(REPORTS_DIR, "ERROR_BOUNDARY_COVERAGE.md"), "w") as f:
        f.write(report_content)

def task_36_loading_state():
    print("Running Task 36: Loading State Consistency...")
    report_content = "# Loading State Consistency Report\n\n"
    report_content += "## Next.js App Router `loading.tsx` Coverage\n\n"
    report_content += "| Directory | Has loading.tsx | Status |\n"
    report_content += "|---|---|---|\n"

    app_dir = "src/app"
    for root, dirs, files in os.walk(app_dir):
        rel_path = os.path.relpath(root, app_dir)
        if rel_path == ".": rel_path = "/"

        has_page = "page.tsx" in files

        if has_page:
            has_loading = "loading.tsx" in files or "loading.js" in files
            status = "✅ Covered" if has_loading else "⚠️ Missing (uses parent or default)"
            report_content += f"| {rel_path} | {has_loading} | {status} |\n"

    report_content += "\n## Component Loading Patterns\n\n"
    report_content += "Scanning `src/components` for `isLoading`, `loading`, `Skeleton`...\n\n"

    components_dir = "src/components"
    report_content += "| Component | Pattern Detected |\n"
    report_content += "|---|---|\n"

    for root, dirs, files in os.walk(components_dir):
        for file in files:
            if file.endswith(".tsx"):
                path_full = os.path.join(root, file)
                with open(path_full, "r") as f:
                    content = f.read()
                    patterns = []
                    if "isLoading" in content: patterns.append("isLoading")
                    if "loading" in content.lower() and "isLoading" not in content: patterns.append("loading var")
                    if "<Skeleton" in content: patterns.append("<Skeleton />")

                    if patterns:
                         report_content += f"| {os.path.relpath(path_full, components_dir)} | {', '.join(patterns)} |\n"

    with open(os.path.join(REPORTS_DIR, "LOADING_STATE_CONSISTENCY.md"), "w") as f:
        f.write(report_content)

def main():
    task_30_dependency_scan()
    task_31_build_analysis()
    task_32_api_audit()
    task_33_35_ast_analysis()
    task_34_error_boundary()
    task_36_loading_state()
    print(f"\nAll reports generated in {REPORTS_DIR}/")

if __name__ == "__main__":
    main()
