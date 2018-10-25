/**
 * A little LISP written in JavaScript, with many
 * thanks to Anton Davydov and Mary Rose Cook.
 *
 * @see https://github.com/davydovanton/rlisp
 * @see https://github.com/maryrosecook/littlelisp
 *
 * @author Eric Weinstein
 */

class Lisplet {
  constructor() {
    this.env = {
      "==": function() {
        let [a, b] = Array.from(arguments)[0];
        return a === b;
      },
      "!=": function() {
        let [a, b] = Array.from(arguments)[0];
        return a !== b;
      },
      "<": function() {
        let [a, b] = Array.from(arguments)[0];
        return a < b;
      },
      "<=": function() {
        let [a, b] = Array.from(arguments)[0];
        return a <= b;
      },
      ">": function() {
        let [a, b] = Array.from(arguments)[0];
        return a > b;
      },
      ">=": function() {
        let [a, b] = Array.from(arguments)[0];
        return a >= b;
      },
      "+": function() { return Array.from(arguments)[0].reduce((a, e) => { return a + e; }); },
      "-": function() { return Array.from(arguments)[0].reduce((a, e) => { return a - e; }); },
      "*": function() { return Array.from(arguments)[0].reduce((a, e) => { return a * e; }); },
      "/": function() { return Array.from(arguments)[0].reduce((a, e) => { return a / e; }); },
      "true": true,
      "false": false,
    };
  }

  run(code) {
    return this.eval(this.parse(code));
  }

  parse(program) {
    return this.read(this.tokenize(program));
  }

  tokenize(characters) {
    return characters.
      replace(/\s\s+/g, " ").
      replace(/\(/g, " ( ").
      replace(/\)/g, " ) ").
      split(" ").
      filter(t => " \t\n".indexOf(t) === -1);
  }

  read(tokens) {
    if (tokens.length === 0) {
      return;
    }

    // Grab the first token.
    let token = tokens.shift();

    if (token === "(") {
      let list = [];

      while (tokens[0] !== ")") {
        list.push(this.read(tokens));
      }

      // Keep going (since we may have nested lists).
      tokens.shift();

      return list;
    } else if (token === ")") {
      throw new Error("Unexpected token ')'");
    } else {
      return this.atom(token);
    }
  }

  atom(token) {
    if (/\.\d+/.test(token)) {
      return parseFloat(token);
    } else if (/\d+/.test(token)) {
      return parseInt(token, 10);
    } else if (this.env[token] && typeof this.env[token] !== "function") {
      return this.env[token];
    } else {
      return token.toString();
    }
  }

  eval(expression) {
    if (!expression) {
      return;
    } else if (typeof expression === "number" || typeof expression === "boolean") {
      return expression;
    } else if (Object.keys(this.env).indexOf(expression[0]) !== -1) {
      let fn = expression[0];
      let args = expression.slice(1);

      function handleArgs(args) {
        args = [].slice.call(args);

        for (let i = 0; i < args.length; i++) {
          if (Array.isArray(args[i])) {
            args[i] = this.eval(args[i]);
          }
        }
        return this.eval(args);
      }

      return this.env[fn](handleArgs.call(this, args));
    } else if (expression[0] === "define") {
      let args = expression.slice(1);
      this.env[args[0]] = args[1];
      return global[args[0]] = this.eval(args[1]);
    } else if (expression[0] === "if") {
      let args = expression.slice(1);
      let [test, conseq, alt] = args;
      return this.eval(test) ? conseq : alt;
    } else if (expression[0] === "lambda") {
      let args = expression.slice(1);
      let [params, body] = args;
      return new Function(params, this.eval(body));
    } else {
      let args = expression.slice(1);
      let params = expression[0][1];

      if (params) {
        let body = [].slice.call(expression[0][2]);
        let bound = params.reduce((obj, k, i) => ({...obj, [k]: args[i] }), {});

        function replace(bound, body) {
          body = [].slice.call(body);
          bound = Object.assign({}, bound);

          for (let i = 0; i < body.length; i++) {
            if (Array.isArray(body[i])) {
              body[i] = this.eval(replace.call(this, bound, body[i]));
            }
            if (bound[body[i]]) {
              body[i] = bound[body[i]];
            }
          }
          return this.eval(body);
        }
        return replace.call(this, bound, body);
      }

      return eval(expression);
    }
  }
}

module.exports = Lisplet;
