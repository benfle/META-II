var Scanner = require('./scanner.js').Scanner;
var Builder = require('./program.js').Builder;

//
// The META II virtual machine runs compilers
// compiled with the META II grammar.
//
var Meta2 = exports.Meta2 = function(compiler) {
  this.program = compiler;
};

(function() {

  this.compile = function(text) {
    this.input = new Scanner(text);
    this.output = new Builder();
    this.pc = 0;
    this.stack = [];
    this.nextGN1 = 0;
    this.nextGN2 = 0;
    this.done = false;
    while(!this.done) {
      var instr = this.program[this.pc];
      this[instr[0]](instr[1]);
    }
    return this.output.text;
  },

  // TEST
  // 
  // After deleting initial blanks in
  // the input string, compare it to
  // the string given as argument. If the
  // comparison is met, delete the
  // matched portion from the input and
  // set switch. If not met, reset
  // switch.
  this.TST = function(string) {
    this.input.blanks();
    this.branch = this.input.match(string);
    this.pc++;
  },

  // IDENTIFIER
  // 
  // After deleting initial blanks in
  // the input string, test if it begins
  // with an identifier, ie., a letter
  // followed by a sequence of letters
  // and/or digits. If so, delete the
  // identifier and set switch. If not,
  // reset switch.
  this.ID = function() {
    this.input.blanks();
    this.branch = this.input.match(/^[A-Z][A-Z0-9]*/);
    this.pc++;
  },

  // NUMBER
  //
  // After deleting initial blanks in
  // the input string, test if it begins
  // with a number. A number is a
  // string of digits wich may contain
  // imbeded periods, but may not begin
  // or end with a period. Moreover, no
  // two periods may be next to one
  // another. If a number is found,
  // delete it and set switch. If not,
  // reset switch.
  this.NUM = function() {
    this.input.blanks();
    this.branch = this.input.match(/^[0-9]+(,[0-9]+)*/);
    this.pc++;
  },

  // STRING
  //
  // After deleting initial blanks in
  // the input string, test if it begins
  // with a string, ie., a single quote,
  // followed by a sequence of any
  // characters other than single quote
  // followed by another single quote.
  // If a string is found, delete it an
  // set switch. If not, reset switch.
  this.SR = function() {
    this.input.blanks();
    this.branch = this.input.match(/^'[^']*'/);
    this.pc++;
  },

  // CALL
  // 
  // Enter the subroutine beginning in
  // location aaa. Push the stack down 
  // by three cells. The third cell
  // contains the return address.
  // Clear the top two cells to
  // blanks to indicate that they can
  // accept addresses which may be
  // generated within the subroutine.
  this.CLL = function(aaa) {
    this.stack.push(this.pc + 1);
    this.stack.push(null);
    this.stack.push(null);
    this.pc = this.program[aaa];
  },

  // RETURN
  //
  // Return to the exit address, popping
  // up the stack by three cells.
  this.R = function() {
    if (this.stack.length === 0) {
      // FIXME: required to keep original META II syntax
      this.END();
    }
    this.stack.pop();
    this.stack.pop();
    this.pc = this.stack.pop();
  },

  // SET
  //
  // Set branch switch on.
  this.SET = function() {
    this.branch = true;
    this.pc++;
  },

  // BRANCH
  //
  // Branch unconditionally to location
  // aaa.
  this.B = function(aaa) {
    this.pc = this.program[aaa];
  },

  // BRANCH IF TRUE
  //
  // Branch to location aaa, if switch is
  // on. Otherwise, continue in sequence.
  this.BT = function(aaa) {
    if (this.branch) {
      this.pc = this.program[aaa];
    } else {
      this.pc++;
    }
  },

  // BRANCH IF FALSE
  //
  // Branch to location aaa, is switch
  // is off. Otherwise, continue in
  // sequence.
  this.BF = function(aaa) {
    if (!this.branch) {
      this.pc = this.program[aaa];
    } else {
      this.pc++;
    }
  },

  // BRANCH TO ERROR IF FALSE
  //
  // Halt if switch is off. Otherwise,
  // continue in sequence.
  this.BE = function() {
    if (!this.branch) {
      throw new Error('HALT');
    }
    this.pc++;
  },

  // COPY LITERAL
  //
  // Output the variable length string
  // given as the argument. A blank
  // character will be inserted in the
  // output following the string.
  this.CL = function(string) {
    this.output.copy(string + ' ');
    this.pc++;
  },

  // COPY INPUT
  //
  // Output the last sequence of char-
  // acters deleted from the input
  // string. This command may not func-
  // tion properly if the last command
  // which could cause deletion failed
  // to do so.
  this.CI = function() {
    this.output.copy(this.input.lastMatch);
    this.pc++;
  },

  // GENERATE 1
  //
  // This concerns the current label 1
  // cell, ie. the next to top cell in
  // the stack, which is either clear or
  // contains a generated label. If
  // clear, generate a label and put it
  // into that cell. Wether the label
  // has just been put into the cell or
  // was already there, output it.
  // Finally, insert a blank character
  // in the output following the label.
  this.GN1 = function() {
    var gn2 = this.stack.pop();
    var gn1 = this.stack.pop();
    if (gn1 === null) {
      gn1 = this.nextGN1++;
    }
    this.stack.push(gn1);
    this.stack.push(gn2);
    this.output.copy('A' + gn1 + ' ');
    this.pc++;
  },

  // GENERATE 2
  //
  // Same as GN1, except that it con-
  // cerns the current label 2 cell,
  // ie., the top cell in the stack.
  this.GN2 = function() {
    var gn2 = this.stack.pop();
    if (gn2 === null) {
      gn2 = this.nextGN2++;
    }
    this.stack.push(gn2);
    this.output.copy('B' + gn2 + ' ');
    this.pc++;
  },

  // LABEL
  //
  // Set the output counter to card
  // column 1.
  this.LB = function() {
    this.output.label();
    this.pc++;
  },
  
  // OUTPUT
  //
  // Punch card and reset output counter
  // to card column 8.
  this.OUT = function() {
    this.output.newLine();
    this.pc++;
  },

  // ADDRESS
  //
  // Produces the address which is
  // assigned to the given identifier
  // as a constant.
  this.ADR = function(ident) {
    this.pc = this.program[ident];
  },

  // END
  //
  // Denotes the end of the program.
  this.END = function() {
    this.done = true;
  }

}).call(Meta2.prototype);
