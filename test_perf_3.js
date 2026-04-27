function test() {
  const students = Array.from({ length: 10000 }, (_, i) => ({
    id: i.toString(),
    name: `Student ${i}`,
    email: `student${i}@test.com`,
    progress: Math.floor(Math.random() * 100),
    lastActivity: i % 2 === 0 ? new Date() : new Date(Date.now() - 1000000000)
  }));

  const isActive = (lastActivity) => {
    if (!lastActivity) return false;
    const daysSince = (new Date().getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 7;
  };

  const isActiveOpt = (lastActivity, now) => {
    if (!lastActivity) return false;
    const daysSince = (now - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 7;
  };

  console.time('original');
  for (let iter = 0; iter < 1000; iter++) {
    const activeStudents = students.filter(s => isActive(s.lastActivity)).length;
  }
  console.timeEnd('original');

  console.time('optimized');
  for (let iter = 0; iter < 1000; iter++) {
    let activeStudents = 0;
    const now = Date.now();
    for (let i = 0; i < students.length; i++) {
        if (isActiveOpt(students[i].lastActivity, now)) activeStudents++;
    }
  }
  console.timeEnd('optimized');
}
test();
