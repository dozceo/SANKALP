function test() {
  const students = Array.from({ length: 10000 }, (_, i) => ({
    id: i.toString(),
    name: `Student ${i}`,
    email: `student${i}@test.com`,
    className: i % 10 === 0 ? undefined : `Class ${i % 5}`,
  }));

  console.time('original');
  for (let iter = 0; iter < 1000; iter++) {
    const classNames = new Set(students.map(s => s.className).filter(Boolean));
    Array.from(classNames).sort();
  }
  console.timeEnd('original');

  console.time('optimized');
  for (let iter = 0; iter < 1000; iter++) {
    const classNames = new Set();
    for (let i = 0; i < students.length; i++) {
        if (students[i].className) classNames.add(students[i].className);
    }
    Array.from(classNames).sort();
  }
  console.timeEnd('optimized');
}
test();
