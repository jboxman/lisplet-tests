const readlineSync = require("readline-sync");
const Lisplet = require('./lib');

let lisplet = new Lisplet();

console.log(`Lisplet is ready! Type a command like so:

  run (define pi 3.14159)
  run (define circle-area (lambda (r) (* pi (* r r))))
  run (circle-area 10)
`);

readlineSync.promptCLLoop({
  run: (...code) => console.log('=>', lisplet.run(code.join(' '))),
});
