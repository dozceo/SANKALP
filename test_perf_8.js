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
        const aTime = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
        const bTime = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
        return bTime - aTime;
    });
  }
  console.timeEnd('original');

  console.time('optimized_no_new_date');
  for (let iter = 0; iter < 100; iter++) {
    const sorted = [...students].sort((a, b) => {
        const aTime = a.lastActivity ? a.lastActivity.getTime() : 0;
        const bTime = b.lastActivity ? b.lastActivity.getTime() : 0;
        return bTime - aTime;
    });
  }
  console.timeEnd('optimized_no_new_date');
}
test();
