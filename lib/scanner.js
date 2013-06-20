//
// A generic text scanner for the META II virtual machine.
//

var Scanner = exports.Scanner = function(text) {
  this.text = text;
  this.lastMatch = null;
};

(function() {

  // Remove initial blanks from the text.
  this.blanks = function() {
    this.text = this.text.replace(/^\s+/, '');
  };

  // Try to match the regular expression or string
  // given as argument.
  // If there is a match, it is removed from the text,
  // saved in `lastMatch` and the method returns true.
  // Otherwise, the text is not modified and the
  // method returns false.
  this.match = function(pattern) {
    if (pattern instanceof RegExp) {
      return this.matchRegularExpression(pattern);
    }
    return this.matchString(pattern);
  };

  this.matchRegularExpression = function(re) {
    var result = re.exec(this.text)
    if (result !== null) {
      this.lastMatch = result[0];
      this.text = this.text.substring(result[0].length);
      return true;
    }
    return false;
  };

  this.matchString = function(str) {
    if (this.text.substring(0, str.length) === str) {
      this.lastMatch = str;
      this.text = this.text.substring(str.length);
      return true;
    }
    return false;
  };

}).call(Scanner.prototype);



