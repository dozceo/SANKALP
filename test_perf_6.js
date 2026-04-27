function test() {
  const students = Array.from({ length: 10000 }, (_, i) => ({
    id: i.toString(),
    name: `Student ${i}`,
    email: `student${i}@test.com`,
    progress: Math.floor(Math.random() * 100),
    lastActivity: i % 2 === 0 ? new Date() : new Date(Date.now() - 1000000000),
    className: i % 5 === 0 ? 'Class A' : i % 3 === 0 ? 'Class B' : undefined
  }));

  const searchQuery = 'student 123';

  console.time('original');
  for (let iter = 0; iter < 1000; iter++) {
    let filtered = students;
    if (searchQuery) {
        filtered = filtered.filter(student =>
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.className?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
  }
  console.timeEnd('original');

  console.time('optimized_name_email');
  for (let iter = 0; iter < 1000; iter++) {
    let filtered = [];
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            if (student.name.toLowerCase().includes(query) ||
                student.email.toLowerCase().includes(query) ||
                (student.className && student.className.toLowerCase().includes(query))) {
                filtered.push(student);
            }
        }
    }
  }
  console.timeEnd('optimized_name_email');
}
test();
