//
// A compiled program is a JavaScript array containing
// instructions as tuples [op-code argument].
//
// Use the array's methods to iterate over the instructions:
//
//   program.forEach(function(instruction) { ... })
//
// Use the object's properties to access the instructions using
// labels:
//
//   pc = program["label"]
//

// PARSER: String -> Program
//
// A program can be represented by a collection of lines.
// A line can be a label starting at column 1 or an instruction
// starting at column 8 composed of an op code of up to 3
// characters and an optional argument.
//
// LABEL  CODE    ADDRESS
// 1- -6  8- -10  12-
//
// Note: Strings are enclosed in simple quotes in assembly code
//       to make the parsing easier for the human and the machine.
//       These quotes are removed here before sending the instruction
//       to the virtual machine.
//
var parse = exports.parse = function(text) {
  return text.split('\n').reduce(function(program, line) {
    if (line.trim().length > 0) { // skip blank lines
      if (line[0] == ' ') {
        program.push(parseInstruction(line));
      } else {
        program[parseLabel(line)] = program.length;
      }
    }
    return program;
  }, []);
};

function parseInstruction(line) {
  var instr = line.trim();
  var idx = instr.indexOf(' ');
  if (idx === -1) { // no argument
    instr = [instr];
  } else {
    var argument = instr.slice(idx).trim().replace(/^'(.*)'$/, '$1');
    instr = [instr.slice(0, idx), argument];
  }
  return instr;
}

function parseLabel(line) {
  return line.trim();
}

// BUILDER
//
// A text-based program builder with modes for 
// the Meta II virtual machine.
//

var Builder = exports.Builder = function() {
  this.text = '       ';
};

(function() {

  this.copy = function(string) {
    this.text += string;
  },

  this.label = function() {
    this.text = this.text.slice(0, -7);
  },

  this.newLine = function() {
    this.text += '\n       ';
  },

  this.getProgram = function() {
    return parse(this.text);
  }

}).call(Builder.prototype);
