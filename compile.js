var fs = require('fs');
var parse = require('./lib/program.js').parse;
var Meta2 = require('./lib/meta2.js').Meta2;

if (process.argv.length < 4) {
  console.log('Usage: node compiled.js <compiler assembly code> <grammar>');
  process.exit(1);
}

var t = fs.readFileSync(process.argv[2], 'utf-8');
var program = parse(t);
var compiler = new Meta2(program);
var grammar = fs.readFileSync(process.argv[3], 'utf-8');
console.log(compiler.compile(grammar));

