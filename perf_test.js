function testDateOptimizations() {
    const N = 10000;
    const dates = Array.from({length: N}, () => new Date(Date.now() - Math.random() * 10000000000));

    console.time("Date.now() instead of new Date().getTime()");
    let count1 = 0;
    for (let i = 0; i < N; i++) {
        const days = (Date.now() - new Date(dates[i]).getTime()) / (1000 * 60 * 60 * 24);
        if (days < 7) count1++;
    }
    console.timeEnd("Date.now() instead of new Date().getTime()");
}
testDateOptimizations();
