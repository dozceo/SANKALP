function test() {
  const students = Array.from({ length: 10000 }, (_, i) => ({
    id: i.toString(),
    name: `Student ${i}`,
    email: `student${i}@test.com`,
    progress: Math.floor(Math.random() * 100),
  }));

  console.time('original');
  for (let iter = 0; iter < 1000; iter++) {
    const atRisk = students.filter(s => s.progress < 60).length;
    const avgPerformance = students.length > 0
        ? Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length)
        : 0;
  }
  console.timeEnd('original');

  console.time('optimized');
  for (let iter = 0; iter < 1000; iter++) {
    let atRisk = 0;
    let sum = 0;
    for (let i = 0; i < students.length; i++) {
        if (students[i].progress < 60) atRisk++;
        sum += students[i].progress;
    }
    const avgPerformance = students.length > 0
        ? Math.round(sum / students.length)
        : 0;
  }
  console.timeEnd('optimized');
}
test();
