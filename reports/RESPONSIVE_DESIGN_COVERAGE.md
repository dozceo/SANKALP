# Mobile Responsive Breakpoint Coverage Audit

**Date:** 2026-02-19T19:21:05.488Z

## Methodology
- Scanned 88 files.
- Flagged usage of fixed width/height/grid classes (e.g., `w-96`, `grid-cols-3`) that appear without responsive prefixes (`sm:`, `md:`, etc.) on the same line.
- **Note**: This is a heuristic. Some fixed widths are intentional (e.g., icons, avatars).

## Potential Violations

### `src/app/(auth)/join-class/page.tsx`
- **Line 98**: `w-8` - No responsive prefix detected.
  - Context: `<Loader2 className="w-8 h-8 animate-spin text-primary" />...`
- **Line 98**: `h-8` - No responsive prefix detected.
  - Context: `<Loader2 className="w-8 h-8 animate-spin text-primary" />...`
- **Line 117**: `h-16` - No responsive prefix detected.
  - Context: `className="text-center text-3xl tracking-[0.5em] font-mono h-16 uppercase placeholder:tracking-norma...`
- **Line 128**: `h-12` - No responsive prefix detected.
  - Context: `className="w-full h-12 text-lg"...`

### `src/app/(auth)/login/page.tsx`
- **Line 82**: `h-10` - No responsive prefix detected.
  - Context: `<BrainCircuit className="h-10 w-10 text-primary" />...`
- **Line 82**: `w-10` - No responsive prefix detected.
  - Context: `<BrainCircuit className="h-10 w-10 text-primary" />...`

### `src/app/(auth)/onboarding/page.tsx`
- **Line 94**: `w-8` - No responsive prefix detected.
  - Context: `<Loader2 className="w-8 h-8 animate-spin text-primary" />...`
- **Line 94**: `h-8` - No responsive prefix detected.
  - Context: `<Loader2 className="w-8 h-8 animate-spin text-primary" />...`
- **Line 187**: `h-1` - No responsive prefix detected.
  - Context: `className={'h-1.5 flex-1 rounded-full transition-all duration-500 ${...`
- **Line 207**: `w-3` - No responsive prefix detected.
  - Context: `<Sparkles className="w-3 h-3" />...`
- **Line 207**: `h-3` - No responsive prefix detected.
  - Context: `<Sparkles className="w-3 h-3" />...`
- **Line 226**: `h-12` - No responsive prefix detected.
  - Context: `className="h-12 text-lg"...`
- **Line 379**: `h-14` - No responsive prefix detected.
  - Context: `className="h-14 text-2xl text-center font-mono tracking-widest uppercase"...`

### `src/app/(auth)/sign-up/page.tsx`
- **Line 86**: `h-10` - No responsive prefix detected.
  - Context: `<BrainCircuit className="h-10 w-10 text-primary" />...`
- **Line 86**: `w-10` - No responsive prefix detected.
  - Context: `<BrainCircuit className="h-10 w-10 text-primary" />...`

### `src/app/(auth)/teacher-onboarding/page.tsx`
- **Line 74**: `w-8` - No responsive prefix detected.
  - Context: `<Loader2 className="w-8 h-8 animate-spin text-primary" />...`
- **Line 74**: `h-8` - No responsive prefix detected.
  - Context: `<Loader2 className="w-8 h-8 animate-spin text-primary" />...`
- **Line 155**: `h-1` - No responsive prefix detected.
  - Context: `className={'h-1.5 flex-1 rounded-full transition-all duration-500 ${...`
- **Line 174**: `w-16` - No responsive prefix detected.
  - Context: `<div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 t...`
- **Line 174**: `h-16` - No responsive prefix detected.
  - Context: `<div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 t...`
- **Line 187**: `h-12` - No responsive prefix detected.
  - Context: `className="h-12 text-lg"...`
- **Line 199**: `w-16` - No responsive prefix detected.
  - Context: `<div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">...`
- **Line 199**: `h-16` - No responsive prefix detected.
  - Context: `<div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">...`
- **Line 200**: `w-8` - No responsive prefix detected.
  - Context: `<BookOpen className="w-8 h-8 text-primary" />...`
- **Line 200**: `h-8` - No responsive prefix detected.
  - Context: `<BookOpen className="w-8 h-8 text-primary" />...`
- **Line 261**: `w-16` - No responsive prefix detected.
  - Context: `<div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">...`
- **Line 261**: `h-16` - No responsive prefix detected.
  - Context: `<div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">...`
- **Line 262**: `w-8` - No responsive prefix detected.
  - Context: `<School className="w-8 h-8 text-primary" />...`
- **Line 262**: `h-8` - No responsive prefix detected.
  - Context: `<School className="w-8 h-8 text-primary" />...`
- **Line 276**: `h-12` - No responsive prefix detected.
  - Context: `className="pl-10 h-12"...`

### `src/app/(main)/brain-map/page.tsx`
- **Line 54**: `h-8` - No responsive prefix detected.
  - Context: `<Loader2 className="h-8 w-8 animate-spin text-primary" />...`
- **Line 54**: `w-8` - No responsive prefix detected.
  - Context: `<Loader2 className="h-8 w-8 animate-spin text-primary" />...`
- **Line 108**: `h-2` - No responsive prefix detected.
  - Context: `<div className="w-full bg-secondary rounded-full h-2.5">...`
- **Line 110**: `h-2` - No responsive prefix detected.
  - Context: `className="bg-primary h-2.5 rounded-full"...`

### `src/app/(main)/chat/page.tsx`
- **Line 147**: `h-8` - No responsive prefix detected.
  - Context: `<Avatar className="h-8 w-8">...`
- **Line 147**: `w-8` - No responsive prefix detected.
  - Context: `<Avatar className="h-8 w-8">...`
- **Line 159**: `h-8` - No responsive prefix detected.
  - Context: `className="absolute -bottom-4 -right-4 h-8 w-8 rounded-full bg-background opacity-0 group-hover:opac...`
- **Line 159**: `w-8` - No responsive prefix detected.
  - Context: `className="absolute -bottom-4 -right-4 h-8 w-8 rounded-full bg-background opacity-0 group-hover:opac...`
- **Line 174**: `h-8` - No responsive prefix detected.
  - Context: `<Avatar className="h-8 w-8">...`
- **Line 174**: `w-8` - No responsive prefix detected.
  - Context: `<Avatar className="h-8 w-8">...`
- **Line 182**: `h-8` - No responsive prefix detected.
  - Context: `<Avatar className="h-8 w-8">...`
- **Line 182**: `w-8` - No responsive prefix detected.
  - Context: `<Avatar className="h-8 w-8">...`

### `src/app/(main)/classes/page.tsx`
- **Line 74**: `h-8` - No responsive prefix detected.
  - Context: `<Loader2 className="h-8 w-8 animate-spin text-primary" />...`
- **Line 74**: `w-8` - No responsive prefix detected.
  - Context: `<Loader2 className="h-8 w-8 animate-spin text-primary" />...`
- **Line 119**: `h-8` - No responsive prefix detected.
  - Context: `<GraduationCap className="h-8 w-8 text-primary-foreground" />...`
- **Line 119**: `w-8` - No responsive prefix detected.
  - Context: `<GraduationCap className="h-8 w-8 text-primary-foreground" />...`
- **Line 124**: `h-3` - No responsive prefix detected.
  - Context: `<ShieldCheck className="h-3 w-3 text-green-600" />...`
- **Line 124**: `w-3` - No responsive prefix detected.
  - Context: `<ShieldCheck className="h-3 w-3 text-green-600" />...`
- **Line 193**: `h-12` - No responsive prefix detected.
  - Context: `<BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />...`
- **Line 193**: `w-12` - No responsive prefix detected.
  - Context: `<BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />...`
- **Line 214**: `w-16` - No responsive prefix detected.
  - Context: `<div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">...`
- **Line 214**: `h-16` - No responsive prefix detected.
  - Context: `<div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">...`
- **Line 215**: `h-8` - No responsive prefix detected.
  - Context: `<Users className="h-8 w-8 text-primary" />...`
- **Line 215**: `w-8` - No responsive prefix detected.
  - Context: `<Users className="h-8 w-8 text-primary" />...`
- **Line 229**: `h-20` - No responsive prefix detected.
  - Context: `className="text-center text-3xl tracking-[0.5em] font-mono h-20 border-2 focus-visible:ring-primary/...`
- **Line 236**: `h-14` - No responsive prefix detected.
  - Context: `className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.0...`

### `src/app/(main)/home/page.tsx`
- **Line 58**: `h-8` - No responsive prefix detected.
  - Context: `<Loader2 className="h-8 w-8 animate-spin text-primary" />...`
- **Line 58**: `w-8` - No responsive prefix detected.
  - Context: `<Loader2 className="h-8 w-8 animate-spin text-primary" />...`
- **Line 150**: `h-32` - No responsive prefix detected.
  - Context: `<Users className="h-32 w-32" />...`
- **Line 150**: `w-32` - No responsive prefix detected.
  - Context: `<Users className="h-32 w-32" />...`

### `src/app/(main)/mentor/page.tsx`
- **Line 82**: `h-8` - No responsive prefix detected.
  - Context: `<Avatar className="h-8 w-8">...`
- **Line 82**: `w-8` - No responsive prefix detected.
  - Context: `<Avatar className="h-8 w-8">...`
- **Line 92**: `h-8` - No responsive prefix detected.
  - Context: `<Avatar className="h-8 w-8">...`
- **Line 92**: `w-8` - No responsive prefix detected.
  - Context: `<Avatar className="h-8 w-8">...`
- **Line 100**: `h-8` - No responsive prefix detected.
  - Context: `<Avatar className="h-8 w-8">...`
- **Line 100**: `w-8` - No responsive prefix detected.
  - Context: `<Avatar className="h-8 w-8">...`

### `src/app/(main)/profile/page.tsx`
- **Line 18**: `h-32` - No responsive prefix detected.
  - Context: `<Skeleton className="h-32 w-32 rounded-full" />...`
- **Line 18**: `w-32` - No responsive prefix detected.
  - Context: `<Skeleton className="h-32 w-32 rounded-full" />...`
- **Line 20**: `h-8` - No responsive prefix detected.
  - Context: `<Skeleton className="h-8 w-1/2" />...`
- **Line 20**: `w-1` - No responsive prefix detected.
  - Context: `<Skeleton className="h-8 w-1/2" />...`
- **Line 21**: `w-1` - No responsive prefix detected.
  - Context: `<Skeleton className="h-4 w-1/3" />...`
- **Line 28**: `h-64` - No responsive prefix detected.
  - Context: `<Skeleton className="h-64" />...`
- **Line 29**: `h-64` - No responsive prefix detected.
  - Context: `<Skeleton className="h-64" />...`

### `src/app/(main)/quiz/page.tsx`
- **Line 139**: `h-8` - No responsive prefix detected.
  - Context: `<Loader2 className="h-8 w-8 animate-spin" />...`
- **Line 139**: `w-8` - No responsive prefix detected.
  - Context: `<Loader2 className="h-8 w-8 animate-spin" />...`
- **Line 150**: `h-16` - No responsive prefix detected.
  - Context: `<Award className="mx-auto h-16 w-16 text-yellow-500" />...`
- **Line 150**: `w-16` - No responsive prefix detected.
  - Context: `<Award className="mx-auto h-16 w-16 text-yellow-500" />...`
- **Line 168**: `h-3` - No responsive prefix detected.
  - Context: `<Loader2 className="h-3 w-3" />...`
- **Line 168**: `w-3` - No responsive prefix detected.
  - Context: `<Loader2 className="h-3 w-3" />...`

### `src/app/(main)/rewards/page.tsx`
- **Line 84**: `h-3` - No responsive prefix detected.
  - Context: `<Progress value={averageMastery} className="h-3" />...`
- **Line 106**: `h-2` - No responsive prefix detected.
  - Context: `<Progress value={subject.value} className="h-2" />...`
- **Line 143**: `w-12` - No responsive prefix detected.
  - Context: `<IconComponent className={'w-12 h-12 mb-2 ${badge.color || 'text-primary'}'} />...`
- **Line 143**: `h-12` - No responsive prefix detected.
  - Context: `<IconComponent className={'w-12 h-12 mb-2 ${badge.color || 'text-primary'}'} />...`
- **Line 152**: `w-12` - No responsive prefix detected.
  - Context: `<Award className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-2" />...`
- **Line 152**: `h-12` - No responsive prefix detected.
  - Context: `<Award className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-2" />...`

### `src/app/(main)/syllabus/page.tsx`
- **Line 159**: `h-8` - No responsive prefix detected.
  - Context: `<AlertTriangle className="h-8 w-8 text-destructive" />...`
- **Line 159**: `w-8` - No responsive prefix detected.
  - Context: `<AlertTriangle className="h-8 w-8 text-destructive" />...`
- **Line 172**: `h-3` - No responsive prefix detected.
  - Context: `<AlertTriangle className="h-3 w-3" />...`
- **Line 172**: `w-3` - No responsive prefix detected.
  - Context: `<AlertTriangle className="h-3 w-3" />...`

### `src/app/(main)/teacher/classes/[classId]/page.tsx`
- **Line 160**: `h-8` - No responsive prefix detected.
  - Context: `<Loader2 className="h-8 w-8 animate-spin" />...`
- **Line 160**: `w-8` - No responsive prefix detected.
  - Context: `<Loader2 className="h-8 w-8 animate-spin" />...`
- **Line 316**: `w-64` - No responsive prefix detected.
  - Context: `<div className="relative w-64">...`
- **Line 331**: `h-12` - No responsive prefix detected.
  - Context: `<Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />...`
- **Line 331**: `w-12` - No responsive prefix detected.
  - Context: `<Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />...`
- **Line 339**: `h-12` - No responsive prefix detected.
  - Context: `<Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />...`
- **Line 339**: `w-12` - No responsive prefix detected.
  - Context: `<Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />...`

### `src/app/(main)/teacher/classes/page.tsx`
- **Line 267**: `h-8` - No responsive prefix detected.
  - Context: `<Loader2 className="h-8 w-8 animate-spin" />...`
- **Line 267**: `w-8` - No responsive prefix detected.
  - Context: `<Loader2 className="h-8 w-8 animate-spin" />...`
- **Line 461**: `h-16` - No responsive prefix detected.
  - Context: `<BookOpen className="h-16 w-16 text-muted-foreground mb-4" />...`
- **Line 461**: `w-16` - No responsive prefix detected.
  - Context: `<BookOpen className="h-16 w-16 text-muted-foreground mb-4" />...`

### `src/app/(main)/teacher/page.tsx`
- **Line 124**: `h-8` - No responsive prefix detected.
  - Context: `<Loader2 className="h-8 w-8 animate-spin text-primary" />...`
- **Line 124**: `w-8` - No responsive prefix detected.
  - Context: `<Loader2 className="h-8 w-8 animate-spin text-primary" />...`
- **Line 188**: `w-10` - No responsive prefix detected.
  - Context: `<span className="text-sm text-muted-foreground font-semibold w-10 text-right">...`

### `src/app/(main)/teacher/student/[studentId]/StudentAnalyticsClient.tsx`
- **Line 120**: `h-16` - No responsive prefix detected.
  - Context: `<Avatar className="h-16 w-16 bg-primary">...`
- **Line 120**: `w-16` - No responsive prefix detected.
  - Context: `<Avatar className="h-16 w-16 bg-primary">...`
- **Line 142**: `h-3` - No responsive prefix detected.
  - Context: `<Progress value={performance.avgScore} className="h-3" />...`

### `src/app/(main)/teacher/students/[studentId]/page.tsx`
- **Line 127**: `h-8` - No responsive prefix detected.
  - Context: `<Loader2 className="h-8 w-8 animate-spin" />...`
- **Line 127**: `w-8` - No responsive prefix detected.
  - Context: `<Loader2 className="h-8 w-8 animate-spin" />...`
- **Line 183**: `grid-cols-3` - No responsive prefix detected.
  - Context: `<div className="grid grid-cols-3 gap-4">...`
- **Line 243**: `h-12` - No responsive prefix detected.
  - Context: `<BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />...`
- **Line 243**: `w-12` - No responsive prefix detected.
  - Context: `<BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />...`
- **Line 262**: `h-2` - No responsive prefix detected.
  - Context: `<Progress value={data.avg} className="h-2" />...`
- **Line 281**: `h-12` - No responsive prefix detected.
  - Context: `<Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />...`
- **Line 281**: `w-12` - No responsive prefix detected.
  - Context: `<Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />...`

### `src/app/(main)/teacher/students/page.tsx`
- **Line 194**: `h-8` - No responsive prefix detected.
  - Context: `<Loader2 className="h-8 w-8 animate-spin" />...`
- **Line 194**: `w-8` - No responsive prefix detected.
  - Context: `<Loader2 className="h-8 w-8 animate-spin" />...`
- **Line 335**: `h-16` - No responsive prefix detected.
  - Context: `<Users className="h-16 w-16 text-muted-foreground mb-4" />...`
- **Line 335**: `w-16` - No responsive prefix detected.
  - Context: `<Users className="h-16 w-16 text-muted-foreground mb-4" />...`
- **Line 367**: `h-3` - No responsive prefix detected.
  - Context: `<Users className="h-3 w-3" />...`
- **Line 367**: `w-3` - No responsive prefix detected.
  - Context: `<Users className="h-3 w-3" />...`

### `src/app/page.tsx`
- **Line 132**: `h-12` - No responsive prefix detected.
  - Context: `<Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />...`
- **Line 132**: `w-12` - No responsive prefix detected.
  - Context: `<Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />...`

### `src/components/ErrorBoundary.tsx`
- **Line 62**: `h-16` - No responsive prefix detected.
  - Context: `<AlertTriangle className="h-16 w-16 text-destructive" />...`
- **Line 62**: `w-16` - No responsive prefix detected.
  - Context: `<AlertTriangle className="h-16 w-16 text-destructive" />...`

### `src/components/InteractiveGraph.tsx`
- **Line 470**: `h-12` - No responsive prefix detected.
  - Context: `<div className="absolute top-0 left-0 right-0 h-12 bg-card/80 backdrop-blur-sm border-b border-borde...`

### `src/components/LearningStateCard.tsx`
- **Line 78**: `h-3` - No responsive prefix detected.
  - Context: `<AlertTriangle className="h-3 w-3" />...`
- **Line 78**: `w-3` - No responsive prefix detected.
  - Context: `<AlertTriangle className="h-3 w-3" />...`

### `src/components/StudentSelector.tsx`
- **Line 13**: `h-8` - No responsive prefix detected.
  - Context: `<Skeleton className="h-8 w-8 rounded-full" />...`
- **Line 13**: `w-8` - No responsive prefix detected.
  - Context: `<Skeleton className="h-8 w-8 rounded-full" />...`
- **Line 49**: `h-8` - No responsive prefix detected.
  - Context: `<Avatar className={'h-8 w-8 ${getAvatarColor(currentStudent.grade)}'}>...`
- **Line 49**: `w-8` - No responsive prefix detected.
  - Context: `<Avatar className={'h-8 w-8 ${getAvatarColor(currentStudent.grade)}'}>...`

### `src/components/app/audio-conversation.tsx`
- **Line 85**: `h-10` - No responsive prefix detected.
  - Context: `icon: <Mic className="h-10 w-10" />,...`
- **Line 85**: `w-10` - No responsive prefix detected.
  - Context: `icon: <Mic className="h-10 w-10" />,...`
- **Line 93**: `h-10` - No responsive prefix detected.
  - Context: `icon: <MicOff className="h-10 w-10" />,...`
- **Line 93**: `w-10` - No responsive prefix detected.
  - Context: `icon: <MicOff className="h-10 w-10" />,...`
- **Line 101**: `h-10` - No responsive prefix detected.
  - Context: `icon: <Loader2 className="h-10 w-10 animate-spin" />,...`
- **Line 101**: `w-10` - No responsive prefix detected.
  - Context: `icon: <Loader2 className="h-10 w-10 animate-spin" />,...`
- **Line 109**: `h-10` - No responsive prefix detected.
  - Context: `icon: <Bot className="h-10 w-10" />,...`
- **Line 109**: `w-10` - No responsive prefix detected.
  - Context: `icon: <Bot className="h-10 w-10" />,...`
- **Line 123**: `h-24` - No responsive prefix detected.
  - Context: `<BrainCircuit className={cn("h-24 w-24 text-muted-foreground transition-colors duration-500",...`
- **Line 123**: `w-24` - No responsive prefix detected.
  - Context: `<BrainCircuit className={cn("h-24 w-24 text-muted-foreground transition-colors duration-500",...`
- **Line 133**: `h-32` - No responsive prefix detected.
  - Context: `"h-32 w-32 rounded-full flex flex-col items-center justify-center gap-2 text-white transition-all du...`
- **Line 133**: `w-32` - No responsive prefix detected.
  - Context: `"h-32 w-32 rounded-full flex flex-col items-center justify-center gap-2 text-white transition-all du...`

### `src/components/app/sidebar-nav.tsx`
- **Line 53**: `w-8` - No responsive prefix detected.
  - Context: `<BrainCircuit className="w-8 h-8 text-primary" />...`
- **Line 53**: `h-8` - No responsive prefix detected.
  - Context: `<BrainCircuit className="w-8 h-8 text-primary" />...`
- **Line 96**: `h-3` - No responsive prefix detected.
  - Context: `<Copy className="h-3 w-3" />...`
- **Line 96**: `w-3` - No responsive prefix detected.
  - Context: `<Copy className="h-3 w-3" />...`

### `src/components/app/teacher-sidebar-nav.tsx`
- **Line 44**: `w-8` - No responsive prefix detected.
  - Context: `<BrainCircuit className="w-8 h-8 text-primary" />...`
- **Line 44**: `h-8` - No responsive prefix detected.
  - Context: `<BrainCircuit className="w-8 h-8 text-primary" />...`
- **Line 104**: `h-3` - No responsive prefix detected.
  - Context: `<Copy className="h-3 w-3" />...`
- **Line 104**: `w-3` - No responsive prefix detected.
  - Context: `<Copy className="h-3 w-3" />...`

### `src/components/planner/FocusTimer.tsx`
- **Line 268**: `h-2` - No responsive prefix detected.
  - Context: `<Progress value={progress} className="h-2" />...`
- **Line 273**: `w-32` - No responsive prefix detected.
  - Context: `<Button onClick={handleStart} size="lg" className="w-32">...`
- **Line 278**: `w-32` - No responsive prefix detected.
  - Context: `<Button onClick={handlePause} size="lg" variant="secondary" className="w-32">...`

### `src/components/planner/ScheduleView.tsx`
- **Line 66**: `h-8` - No responsive prefix detected.
  - Context: `<AlertTriangle className="h-8 w-8 text-destructive" />...`
- **Line 66**: `w-8` - No responsive prefix detected.
  - Context: `<AlertTriangle className="h-8 w-8 text-destructive" />...`
- **Line 121**: `h-12` - No responsive prefix detected.
  - Context: `<Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />...`
- **Line 121**: `w-12` - No responsive prefix detected.
  - Context: `<Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />...`

### `src/components/planner/StudyLibrary.tsx`
- **Line 103**: `h-12` - No responsive prefix detected.
  - Context: `<BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />...`
- **Line 103**: `w-12` - No responsive prefix detected.
  - Context: `<BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />...`
- **Line 209**: `grid-cols-2` - No responsive prefix detected.
  - Context: `<div className="grid grid-cols-2 gap-4">...`
- **Line 239**: `h-3` - No responsive prefix detected.
  - Context: `<ExternalLink className="h-3 w-3" />...`
- **Line 239**: `w-3` - No responsive prefix detected.
  - Context: `<ExternalLink className="h-3 w-3" />...`

### `src/components/profile/StudentProfile.tsx`
- **Line 27**: `h-32` - No responsive prefix detected.
  - Context: `<Skeleton className="h-32 w-32 rounded-full" />...`
- **Line 27**: `w-32` - No responsive prefix detected.
  - Context: `<Skeleton className="h-32 w-32 rounded-full" />...`
- **Line 29**: `h-8` - No responsive prefix detected.
  - Context: `<Skeleton className="h-8 w-1/2" />...`
- **Line 29**: `w-1` - No responsive prefix detected.
  - Context: `<Skeleton className="h-8 w-1/2" />...`
- **Line 30**: `w-1` - No responsive prefix detected.
  - Context: `<Skeleton className="h-4 w-1/3" />...`
- **Line 37**: `h-64` - No responsive prefix detected.
  - Context: `<Skeleton className="h-64" />...`
- **Line 38**: `h-64` - No responsive prefix detected.
  - Context: `<Skeleton className="h-64" />...`
- **Line 79**: `h-32` - No responsive prefix detected.
  - Context: `<div className="h-32 bg-gradient-to-r from-primary/80 to-accent/80 relative">...`
- **Line 84**: `h-32` - No responsive prefix detected.
  - Context: `<Avatar className={'h-32 w-32 border-4 border-background shadow-lg ${getAvatarColor(currentStudent.g...`
- **Line 84**: `w-32` - No responsive prefix detected.
  - Context: `<Avatar className={'h-32 w-32 border-4 border-background shadow-lg ${getAvatarColor(currentStudent.g...`
- **Line 98**: `h-3` - No responsive prefix detected.
  - Context: `<Mail className="h-3 w-3" /> {currentStudent.email}...`
- **Line 98**: `w-3` - No responsive prefix detected.
  - Context: `<Mail className="h-3 w-3" /> {currentStudent.email}...`
- **Line 102**: `h-3` - No responsive prefix detected.
  - Context: `<School className="h-3 w-3" /> Sankalp High...`
- **Line 102**: `w-3` - No responsive prefix detected.
  - Context: `<School className="h-3 w-3" /> Sankalp High...`
- **Line 109**: `h-3` - No responsive prefix detected.
  - Context: `<Pencil className="h-3 w-3" />...`
- **Line 109**: `w-3` - No responsive prefix detected.
  - Context: `<Pencil className="h-3 w-3" />...`
- **Line 146**: `h-2` - No responsive prefix detected.
  - Context: `<Progress value={score * 100} className="h-2" />...`
- **Line 232**: `h-3` - No responsive prefix detected.
  - Context: `<Brain className="h-3 w-3 text-primary" />...`
- **Line 232**: `w-3` - No responsive prefix detected.
  - Context: `<Brain className="h-3 w-3 text-primary" />...`
- **Line 242**: `h-3` - No responsive prefix detected.
  - Context: `<GraduationCap className="h-3 w-3 text-primary" />...`
- **Line 242**: `w-3` - No responsive prefix detected.
  - Context: `<GraduationCap className="h-3 w-3 text-primary" />...`

### `src/components/profile/TeacherProfile.tsx`
- **Line 25**: `h-32` - No responsive prefix detected.
  - Context: `<Skeleton className="h-32 w-32 rounded-full" />...`
- **Line 25**: `w-32` - No responsive prefix detected.
  - Context: `<Skeleton className="h-32 w-32 rounded-full" />...`
- **Line 27**: `h-8` - No responsive prefix detected.
  - Context: `<Skeleton className="h-8 w-1/2" />...`
- **Line 27**: `w-1` - No responsive prefix detected.
  - Context: `<Skeleton className="h-8 w-1/2" />...`
- **Line 28**: `w-1` - No responsive prefix detected.
  - Context: `<Skeleton className="h-4 w-1/3" />...`
- **Line 35**: `h-64` - No responsive prefix detected.
  - Context: `<Skeleton className="h-64" />...`
- **Line 36**: `h-64` - No responsive prefix detected.
  - Context: `<Skeleton className="h-64" />...`
- **Line 65**: `h-32` - No responsive prefix detected.
  - Context: `<div className="h-32 bg-gradient-to-r from-blue-600/80 to-indigo-600/80 relative">...`
- **Line 69**: `h-32` - No responsive prefix detected.
  - Context: `<Avatar className="h-32 w-32 border-4 border-background shadow-lg bg-blue-500">...`
- **Line 69**: `w-32` - No responsive prefix detected.
  - Context: `<Avatar className="h-32 w-32 border-4 border-background shadow-lg bg-blue-500">...`
- **Line 83**: `h-3` - No responsive prefix detected.
  - Context: `<Mail className="h-3 w-3" /> {teacher.email}...`
- **Line 83**: `w-3` - No responsive prefix detected.
  - Context: `<Mail className="h-3 w-3" /> {teacher.email}...`
- **Line 88**: `h-3` - No responsive prefix detected.
  - Context: `<School className="h-3 w-3" /> {teacher.schoolName}...`
- **Line 88**: `w-3` - No responsive prefix detected.
  - Context: `<School className="h-3 w-3" /> {teacher.schoolName}...`
- **Line 96**: `h-3` - No responsive prefix detected.
  - Context: `<Pencil className="h-3 w-3" />...`
- **Line 96**: `w-3` - No responsive prefix detected.
  - Context: `<Pencil className="h-3 w-3" />...`
- **Line 169**: `h-8` - No responsive prefix detected.
  - Context: `<Users className="h-8 w-8 text-muted-foreground/50" />...`
- **Line 169**: `w-8` - No responsive prefix detected.
  - Context: `<Users className="h-8 w-8 text-muted-foreground/50" />...`

### `src/components/rewards/RewardsSkeleton.tsx`
- **Line 10**: `h-10` - No responsive prefix detected.
  - Context: `<Skeleton className="h-10 w-1/3" />...`
- **Line 10**: `w-1` - No responsive prefix detected.
  - Context: `<Skeleton className="h-10 w-1/3" />...`
- **Line 11**: `w-1` - No responsive prefix detected.
  - Context: `<Skeleton className="h-4 w-1/2" />...`
- **Line 18**: `w-32` - No responsive prefix detected.
  - Context: `<Skeleton className="h-6 w-32" />...`
- **Line 21**: `h-12` - No responsive prefix detected.
  - Context: `<Skeleton className="h-12 w-24 mb-2" />...`
- **Line 21**: `w-24` - No responsive prefix detected.
  - Context: `<Skeleton className="h-12 w-24 mb-2" />...`
- **Line 22**: `w-48` - No responsive prefix detected.
  - Context: `<Skeleton className="h-4 w-48" />...`
- **Line 29**: `w-40` - No responsive prefix detected.
  - Context: `<Skeleton className="h-6 w-40 mb-2" />...`
- **Line 30**: `w-64` - No responsive prefix detected.
  - Context: `<Skeleton className="h-4 w-64" />...`
- **Line 40**: `w-48` - No responsive prefix detected.
  - Context: `<Skeleton className="h-6 w-48" />...`
- **Line 43**: `h-20` - No responsive prefix detected.
  - Context: `<Skeleton className="h-20 w-full" />...`
- **Line 51**: `w-32` - No responsive prefix detected.
  - Context: `<Skeleton className="h-6 w-32 mb-2" />...`
- **Line 52**: `w-64` - No responsive prefix detected.
  - Context: `<Skeleton className="h-4 w-64" />...`
- **Line 57**: `w-12` - No responsive prefix detected.
  - Context: `<Skeleton className="w-12 h-12 mb-2 rounded-full" />...`
- **Line 57**: `h-12` - No responsive prefix detected.
  - Context: `<Skeleton className="w-12 h-12 mb-2 rounded-full" />...`
- **Line 58**: `w-20` - No responsive prefix detected.
  - Context: `<Skeleton className="h-4 w-20 mb-1" />...`
- **Line 59**: `h-3` - No responsive prefix detected.
  - Context: `<Skeleton className="h-3 w-24" />...`
- **Line 59**: `w-24` - No responsive prefix detected.
  - Context: `<Skeleton className="h-3 w-24" />...`
- **Line 68**: `w-48` - No responsive prefix detected.
  - Context: `<Skeleton className="h-6 w-48 mb-2" />...`
- **Line 69**: `w-80` - No responsive prefix detected.
  - Context: `<Skeleton className="h-4 w-80" />...`

### `src/components/settings/StudentProfileForm.tsx`
- **Line 132**: `w-8` - No responsive prefix detected.
  - Context: `return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;...`
- **Line 132**: `h-8` - No responsive prefix detected.
  - Context: `return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;...`
- **Line 189**: `w-3` - No responsive prefix detected.
  - Context: `{formData.subjects.includes(subject) && <CheckCircle className="w-3 h-3 text-primary" />}...`
- **Line 189**: `h-3` - No responsive prefix detected.
  - Context: `{formData.subjects.includes(subject) && <CheckCircle className="w-3 h-3 text-primary" />}...`

### `src/components/settings/TeacherProfileForm.tsx`
- **Line 135**: `w-8` - No responsive prefix detected.
  - Context: `return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;...`
- **Line 135**: `h-8` - No responsive prefix detected.
  - Context: `return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;...`
- **Line 171**: `w-3` - No responsive prefix detected.
  - Context: `{formData.subjects.includes(subject) && <CheckCircle className="w-3 h-3 text-blue-600" />}...`
- **Line 171**: `h-3` - No responsive prefix detected.
  - Context: `{formData.subjects.includes(subject) && <CheckCircle className="w-3 h-3 text-blue-600" />}...`

### `src/components/ui/avatar.tsx`
- **Line 15**: `h-10` - No responsive prefix detected.
  - Context: `"relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",...`
- **Line 15**: `w-10` - No responsive prefix detected.
  - Context: `"relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",...`

### `src/components/ui/button.tsx`
- **Line 23**: `h-10` - No responsive prefix detected.
  - Context: `default: "h-10 px-4 py-2",...`
- **Line 26**: `h-10` - No responsive prefix detected.
  - Context: `icon: "h-10 w-10",...`
- **Line 26**: `w-10` - No responsive prefix detected.
  - Context: `icon: "h-10 w-10",...`

### `src/components/ui/calendar.tsx`
- **Line 30**: `h-7` - No responsive prefix detected.
  - Context: `"h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"...`
- **Line 30**: `w-7` - No responsive prefix detected.
  - Context: `"h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"...`
- **Line 37**: `w-9` - No responsive prefix detected.
  - Context: `"text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",...`
- **Line 39**: `h-9` - No responsive prefix detected.
  - Context: `cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md ...`
- **Line 39**: `w-9` - No responsive prefix detected.
  - Context: `cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md ...`
- **Line 42**: `h-9` - No responsive prefix detected.
  - Context: `"h-9 w-9 p-0 font-normal aria-selected:opacity-100"...`
- **Line 42**: `w-9` - No responsive prefix detected.
  - Context: `"h-9 w-9 p-0 font-normal aria-selected:opacity-100"...`

### `src/components/ui/carousel.tsx`
- **Line 187**: `w-0` - No responsive prefix detected.
  - Context: `"min-w-0 shrink-0 grow-0 basis-full",...`
- **Line 209**: `h-8` - No responsive prefix detected.
  - Context: `"absolute  h-8 w-8 rounded-full",...`
- **Line 209**: `w-8` - No responsive prefix detected.
  - Context: `"absolute  h-8 w-8 rounded-full",...`
- **Line 238**: `h-8` - No responsive prefix detected.
  - Context: `"absolute h-8 w-8 rounded-full",...`
- **Line 238**: `w-8` - No responsive prefix detected.
  - Context: `"absolute h-8 w-8 rounded-full",...`

### `src/components/ui/chart.tsx`
- **Line 197**: `h-2` - No responsive prefix detected.
  - Context: `"flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground...`
- **Line 197**: `w-2` - No responsive prefix detected.
  - Context: `"flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground...`
- **Line 213**: `h-2` - No responsive prefix detected.
  - Context: `"h-2.5 w-2.5": indicator === "dot",...`
- **Line 213**: `w-2` - No responsive prefix detected.
  - Context: `"h-2.5 w-2.5": indicator === "dot",...`
- **Line 214**: `w-1` - No responsive prefix detected.
  - Context: `"w-1": indicator === "line",...`
- **Line 215**: `w-0` - No responsive prefix detected.
  - Context: `"w-0 border-[1.5px] border-dashed bg-transparent":...`
- **Line 296**: `h-3` - No responsive prefix detected.
  - Context: `"flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"...`
- **Line 296**: `w-3` - No responsive prefix detected.
  - Context: `"flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"...`
- **Line 303**: `h-2` - No responsive prefix detected.
  - Context: `className="h-2 w-2 shrink-0 rounded-[2px]"...`
- **Line 303**: `w-2` - No responsive prefix detected.
  - Context: `className="h-2 w-2 shrink-0 rounded-[2px]"...`

### `src/components/ui/dropdown-menu.tsx`
- **Line 108**: `h-3` - No responsive prefix detected.
  - Context: `<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">...`
- **Line 108**: `w-3` - No responsive prefix detected.
  - Context: `<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">...`
- **Line 131**: `h-3` - No responsive prefix detected.
  - Context: `<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">...`
- **Line 131**: `w-3` - No responsive prefix detected.
  - Context: `<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">...`
- **Line 133**: `h-2` - No responsive prefix detected.
  - Context: `<Circle className="h-2 w-2 fill-current" />...`
- **Line 133**: `w-2` - No responsive prefix detected.
  - Context: `<Circle className="h-2 w-2 fill-current" />...`

### `src/components/ui/menubar.tsx`
- **Line 46**: `h-10` - No responsive prefix detected.
  - Context: `"flex h-10 items-center space-x-1 rounded-md border bg-background p-1",...`
- **Line 161**: `h-3` - No responsive prefix detected.
  - Context: `<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">...`
- **Line 161**: `w-3` - No responsive prefix detected.
  - Context: `<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">...`
- **Line 183**: `h-3` - No responsive prefix detected.
  - Context: `<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">...`
- **Line 183**: `w-3` - No responsive prefix detected.
  - Context: `<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">...`
- **Line 185**: `h-2` - No responsive prefix detected.
  - Context: `<Circle className="h-2 w-2 fill-current" />...`
- **Line 185**: `w-2` - No responsive prefix detected.
  - Context: `<Circle className="h-2 w-2 fill-current" />...`

### `src/components/ui/popover.tsx`
- **Line 22**: `w-72` - No responsive prefix detected.
  - Context: `"z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[sta...`

### `src/components/ui/radio-group.tsx`
- **Line 37**: `h-2` - No responsive prefix detected.
  - Context: `<Circle className="h-2.5 w-2.5 fill-current text-current" />...`
- **Line 37**: `w-2` - No responsive prefix detected.
  - Context: `<Circle className="h-2.5 w-2.5 fill-current text-current" />...`

### `src/components/ui/scroll-area.tsx`
- **Line 36**: `w-2` - No responsive prefix detected.
  - Context: `"h-full w-2.5 border-l border-l-transparent p-[1px]",...`
- **Line 38**: `h-2` - No responsive prefix detected.
  - Context: `"h-2.5 flex-col border-t border-t-transparent p-[1px]",...`

### `src/components/ui/select.tsx`
- **Line 22**: `h-10` - No responsive prefix detected.
  - Context: `"flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-...`
- **Line 78**: `h-96` - No responsive prefix detected.
  - Context: `"relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreg...`
- **Line 126**: `h-3` - No responsive prefix detected.
  - Context: `<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">...`
- **Line 126**: `w-3` - No responsive prefix detected.
  - Context: `<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">...`

### `src/components/ui/sidebar.tsx`
- **Line 228**: `w-0` - No responsive prefix detected.
  - Context: `"group-data-[collapsible=offcanvas]:w-0",...`
- **Line 274**: `h-7` - No responsive prefix detected.
  - Context: `className={cn("h-7 w-7", className)}...`
- **Line 274**: `w-7` - No responsive prefix detected.
  - Context: `className={cn("h-7 w-7", className)}...`
- **Line 344**: `h-8` - No responsive prefix detected.
  - Context: `"h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",...`
- **Line 407**: `h-0` - No responsive prefix detected.
  - Context: `"flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",...`
- **Line 424**: `w-0` - No responsive prefix detected.
  - Context: `className={cn("relative flex w-full min-w-0 flex-col p-2", className)}...`
- **Line 442**: `h-8` - No responsive prefix detected.
  - Context: `"duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foregr...`
- **Line 495**: `w-0` - No responsive prefix detected.
  - Context: `className={cn("flex w-full min-w-0 flex-col gap-1", className)}...`
- **Line 524**: `h-8` - No responsive prefix detected.
  - Context: `default: "h-8 text-sm",...`
- **Line 662**: `h-8` - No responsive prefix detected.
  - Context: `className={cn("rounded-md h-8 flex gap-2 px-2 items-center", className)}...`
- **Line 693**: `w-0` - No responsive prefix detected.
  - Context: `"mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",...`
- **Line 725**: `h-7` - No responsive prefix detected.
  - Context: `"flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-fo...`
- **Line 725**: `w-0` - No responsive prefix detected.
  - Context: `"flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-fo...`

### `src/components/ui/slider.tsx`
- **Line 20**: `h-2` - No responsive prefix detected.
  - Context: `<SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary...`

### `src/components/ui/switch.tsx`
- **Line 14**: `w-11` - No responsive prefix detected.
  - Context: `"peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transpa...`

### `src/components/ui/table.tsx`
- **Line 76**: `h-12` - No responsive prefix detected.
  - Context: `"h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",...`

### `src/components/ui/tabs.tsx`
- **Line 17**: `h-10` - No responsive prefix detected.
  - Context: `"inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",...`

### `src/components/ui/toast.tsx`
- **Line 65**: `h-8` - No responsive prefix detected.
  - Context: `"inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm ...`

**Total Potential Violations:** 297
