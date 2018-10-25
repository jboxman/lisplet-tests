const test = require('tape');
const Lisplet = require('../lib');

let lisplet = new Lisplet();
lisplet.run('(define aa 1.1)');

function parse(program) {
  const l = new Lisplet();
  return lisplet.parse(program);
}

function run(program) {
  const l = new Lisplet();
  return lisplet.run(program);
}

test('empty list', t => {
  t.deepEqual(parse('()'), []);
  t.end();
});

test('list', t => {
  t.deepEqual(parse('(1 2 3)'), [1, 2, 3]);
  t.end();
});

test('nested list', t => {
  t.deepEqual(parse('(1 (2 (3)))'), [1, [2, [3]]]);
  t.end();
});

test('add', t => {
  t.deepEqual(parse('(+ 1 1)'), ['+', 1, 1]);
  t.end();
});

test('addition', t => {
  t.equal(run('(+ 1 1)'), 2);
  t.equal(run('(+ 1 -1)'), 0);
  t.equal(run('(+ 1 1 1)'), 3);
  t.end();
});

test('substraction', t => {
  t.equal(run('(- 1 1)'), 0);
  t.equal(run('(- 0 1)'), -1);
  t.end();
});

test('multiplication', t => {
  t.equal(run('(* 1 1)'), 1);
  t.equal(run('(* -1 -1)'), 1);
  t.end();
});

test('division', t => {
  t.equal(run('(/ 1 0)'), Infinity);
  t.equal(run('(/ 1 1)'), 1);
  t.end();
});

test('cond', t => {
  t.equal(run('(if (> 1 0) true false)'), true);
  t.end();
});

test('function', t => {
  run('(define x 7)');
  t.equal(global.x, 7);
  // Doesn't unset x
  //delete global.x;

  run('(define y 9)');
  t.equal(run('(* y y)'), 81);
  t.end();

  // FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory
  /*
  run('(define fn (lambda (z) (z)))');
  t.deepEqual(run('(fn 2)'), [2]);
  t.equal(run('(+ 3 (fn 2)'), 5);
  */

});
