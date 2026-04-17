function testDateOptimizations() {
    const N = 10000;
    const dates = Array.from({length: N}, () => new Date(Date.now() - Math.random() * 10000000000));

    console.time("new Date() in loop");
    let count1 = 0;
    for (let i = 0; i < N; i++) {
        const days = (new Date().getTime() - new Date(dates[i]).getTime()) / (1000 * 60 * 60 * 24);
        if (days < 7) count1++;
    }
    console.timeEnd("new Date() in loop");

    console.time("Date.now() hoisted");
    let count2 = 0;
    const now = Date.now();
    for (let i = 0; i < N; i++) {
        const days = (now - new Date(dates[i]).getTime()) / (1000 * 60 * 60 * 24);
        if (days < 7) count2++;
    }
    console.timeEnd("Date.now() hoisted");

    const students = Array.from({length: N}, (_, i) => ({
        name: "Student " + i,
        email: "student" + i + "@test.com",
        className: "Class " + (i % 10)
    }));

    const query = "STUDENT 5";

    console.time("toLowerCase in loop");
    let count3 = 0;
    for (let i = 0; i < N; i++) {
        if (students[i].name.toLowerCase().includes(query.toLowerCase()) ||
            students[i].email.toLowerCase().includes(query.toLowerCase()) ||
            students[i].className.toLowerCase().includes(query.toLowerCase())) {
            count3++;
        }
    }
    console.timeEnd("toLowerCase in loop");

    console.time("toLowerCase hoisted");
    let count4 = 0;
    const q = query.toLowerCase();
    for (let i = 0; i < N; i++) {
        if (students[i].name.toLowerCase().includes(q) ||
            students[i].email.toLowerCase().includes(q) ||
            students[i].className.toLowerCase().includes(q)) {
            count4++;
        }
    }
    console.timeEnd("toLowerCase hoisted");
}

testDateOptimizations();
