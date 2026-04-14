# Cognitive Load Analysis: Teacher Dashboard

## Overview
The Teacher Dashboard (`/teacher`) serves as the primary interface for educators to monitor student progress and intervene. This analysis focuses on information density, visual hierarchy, and actionable insights.

### Findings

#### 1. Information Density
**High Load**: The dashboard presents multiple complex data sets simultaneously:
- **Class Overview Table**: 5 columns per student (Name/Details, Progress Bar/%, Absentee Streak, Risk Badge, Actions).
- **Student Learning Network**: Interactive graph visualization of students and connections.

**Issues**:
- **Graph Complexity**: The `InteractiveGraph` component, while visually appealing, can be overwhelming if the number of nodes is large. It competes for attention with the primary data table.
- **Pseudo-Random Data**: The "Absentee Streak" metric is generated pseudo-randomly (`hash % 15`). This introduces misleading noise and reduces trust in the dashboard.
- **Risk Visualization**: Risk levels are color-coded (Red/Yellow/Green), but the sheer volume of colors in the table row (Avatar, Progress Bar, Badges) can cause visual fatigue.

#### 2. Student Analytics (`/teacher/student/[id]`)
**High Load**: The detailed student view is vertically long and densely packed.
- **Performance Overview**: Profile Card + Progress Bar.
- **Subject Performance Chart**: Bar chart showing mastery per subject.
- **Strengths & Weaknesses**: Two separate lists.
- **Chatbot Configuration**: A large form taking up 1/3 of the screen width, potentially distracting from the primary task of reviewing performance.

### Recommendations

#### Simplify & Prioritize
1. **Move Learning Network**: Relocate the `InteractiveGraph` to a dedicated "Network Analysis" or "Insights" tab. This declutters the main dashboard and allows the graph to be the primary focus when needed.
2. **Prioritize At-Risk Students**: Introduce a "High Priority" section or card at the top of the dashboard summarizing students with "High Risk" or long absentee streaks.
   - Example: "3 Students Require Attention" (Click to filter table).
3. **Refine Table Actions**: Replace the generic "View" button with direct actions where possible (e.g., "Message Student", "Assign Review").
4. **Fix Absentee Data**: Replace the pseudo-random streak generator with real attendance data or remove the column until real data is available.

#### Optimize Layout
- **Student Analytics**: Move "Chatbot Customization" to a separate "Settings" tab within the student profile. This focuses the main view on performance metrics.
- **Combine Strengths/Weaknesses**: Consider a unified "Performance Insights" card with clear visual indicators instead of two separate lists.

### Estimated Impact
- **Reduced Cognitive Load**: Teachers can focus on critical alerts first.
- **Improved Decision Speed**: Clearer prioritization leads to faster interventions.
- **Increased Trust**: Removing fake data builds confidence in the platform.
