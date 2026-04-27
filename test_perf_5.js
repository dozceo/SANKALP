function test() {
  const students = Array.from({ length: 10000 }, (_, i) => ({
    id: i.toString(),
    name: `Student ${i}`,
    email: `student${i}@test.com`,
    progress: Math.floor(Math.random() * 100),
    lastActivity: i % 2 === 0 ? new Date() : new Date(Date.now() - 1000000000),
    className: i % 5 === 0 ? 'Class A' : i % 3 === 0 ? 'Class B' : undefined
  }));

  const isActiveOpt = (lastActivity, now) => {
    if (!lastActivity) return false;
    const daysSince = (now - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 7;
  };

  const searchQuery = 'test';
  const classFilter = 'all';
  const performanceFilter = 'all';
  const activityFilter = 'all';
  const sortBy = 'name';

  console.time('optimized_more');
  for (let iter = 0; iter < 1000; iter++) {
    const searchLower = searchQuery ? searchQuery.toLowerCase() : '';
    let filtered = [];
    const now = Date.now();
    for (let i = 0; i < students.length; i++) {
        const student = students[i];
        if (searchLower) {
            const matchesSearch =
                student.name.toLowerCase().includes(searchLower) ||
                student.email.toLowerCase().includes(searchLower) ||
                (student.className && student.className.toLowerCase().includes(searchLower));
            if (!matchesSearch) continue;
        }
        filtered.push(student);
    }
    const sorted = filtered.sort((a, b) => a.name.localeCompare(b.name));
  }
  console.timeEnd('optimized_more');
}
test();
