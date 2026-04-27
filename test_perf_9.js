function test() {
  const materials = Array.from({ length: 1000 }, (_, i) => ({
    id: i.toString(),
    nextReview: new Date(Date.now() + Math.random() * 1000000000).toISOString()
  }));

  console.time('original');
  for (let iter = 0; iter < 1000; iter++) {
    const sorted = [...materials].sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime());
  }
  console.timeEnd('original');

  console.time('schwartzian');
  for (let iter = 0; iter < 1000; iter++) {
    const sorted = materials.map(m => ({ m, t: new Date(m.nextReview).getTime() })).sort((a, b) => a.t - b.t).map(x => x.m);
  }
  console.timeEnd('schwartzian');
}
test();
