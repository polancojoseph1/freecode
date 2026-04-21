async function test() {
  const arr = Array.fromAsync((async function* () {
    yield 1;
    yield 2;
  })());
  console.log(await arr);
}
test();
