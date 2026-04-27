function test() {
  const students = Array.from({ length: 10000 }, (_, i) => ({
    id: i.toString(),
    name: `Student ${i}`,
    email: `student${i}@test.com`,
    progress: Math.floor(Math.random() * 100),
    lastActivity: i % 2 === 0 ? new Date() : new Date(Date.now() - 1000000000),
    quizzesTaken: Math.floor(Math.random() * 50),
    className: i % 5 === 0 ? 'Class A' : i % 3 === 0 ? 'Class B' : undefined
  }));

  const sortBy = 'activity';

  console.time('original');
  for (let iter = 0; iter < 100; iter++) {
    const sorted = [...students].sort((a, b) => {
        switch (sortBy) {
            case "name":
                return a.name.localeCompare(b.name);
            case "performance":
                return b.progress - a.progress;
            case "activity":
                const aTime = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
                const bTime = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
                return bTime - aTime;
            case "quizzes":
                return b.quizzesTaken - a.quizzesTaken;
            default:
                return 0;
        }
    });
  }
  console.timeEnd('original');

  console.time('optimized');
  for (let iter = 0; iter < 100; iter++) {
    let sorted;
    if (sortBy === 'activity') {
        sorted = students.map(s => ({
            s,
            t: s.lastActivity ? s.lastActivity.getTime() : 0
        })).sort((a, b) => b.t - a.t).map(x => x.s);
    } else {
        sorted = [...students].sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return a.name.localeCompare(b.name);
                case "performance":
                    return b.progress - a.progress;
                case "quizzes":
                    return b.quizzesTaken - a.quizzesTaken;
                default:
                    return 0;
            }
        });
    }
  }
  console.timeEnd('optimized');
}
test();
