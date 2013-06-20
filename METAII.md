# META II Grammar Explained

Even after reading the paper, I had a hard time understanding how the grammar worked. Below are my notes on the grammar itself.

This description assumes that you have read the paper and that you are familiar with the different syntactic and semantic constructs of the language.

A META II grammar starts with `.SYNTAX` followed by an identifier pointing to the first syntax equation. The control must go there first, `.OUT('ADR ' *)`.

    PROGRAM = '.SYNTAX' .ID .OUT('ADR ' *)

A grammar is composed of zero or more syntax equations.

              $ ST

A grammar terminates with `.END`.

              '.END'        .OUT('END').,

A syntax equation starts with an identifier, the metalinguistic variable, separated from a first-order expression by the `=` character. Each syntax equation is translated into a recursive subroutine, `.LABEL *` and `.OUT('R')`.

    ST = .ID .LABEL * '=' EX1 '.,' .OUT('R').,

The syntax equation for first-order expressions implements the alternative operator of the language. If the previous second-order expression, `EX2`, returns true, the control is redirected to the end of the subroutine, `.OUT('BT ' *1)`.

    EX1 = EX2
          $ ('/' .OUT('BT ' *1) EX2)
          .LABEL *1 .,

The syntax equation for second-order expressions implements the concatenation mechanism of the language. A second-order expression can be a concatenation of third-order expressions or output directives.

If the first construct fails, the control is redirected to the end of the subroutine, `.OUT('BF ' *1)`. Otherwise, the parsing continue. If no third-order expression or output directive is found, the subroutine finishes. If one is found but the parsing failed, a syntax error is thrown, `.OUT('BE')`.

    EX2 = (EX3 .OUT('BF ' *1) / OUTPUT)
          $ (EX3 .OUT('BE')     / OUTPUT)
          .LABEL *1 .,

The syntax equation for third-order expressions implements:

* the mechanism to combine syntax equations, `.ID`, which calls the subroutine with the same name, `.OUT('CLL ' *)`.
* the syntax recognizers: `.STRING`, `'.ID'`, `'.NUMBER'`, `'.STRING'` which call the appropriate string matching procedure
* the precedence mechanism using parenthesis
* the optional operator: `'.EMPTY'`
* the optional sequence operator: `'$'`, a syntax alternative to `'.EMPTY'`

The optional sequence operator tries to recognize as many third-order expressions as possible and always succeeds, `.OUT('SET')`.

    EX3 = .ID               .OUT('CLL ' *)
        / .STRING           .OUT('TST ' *)
        / '.ID'             .OUT('ID')
        / '.NUMBER'         .OUT('NUM')
        / '.STRING'         .OUT('SR')
        / '(' EX1 ')' 
        / '.EMPTY'          .OUT('SET')
        / '$' .LABEL *1 EX3 .OUT('BT ' *1) .OUT('SET').,

The syntax equations for output directives implement the `.OUT` and `.LABEL` directives to generate assembly code.

    OUTPUT = ('.OUT' '(' $ OUT1 ')'
           / '.LABEL' .OUT('LB') OUT1)
           .OUT('OUT') .,

`.OUT` and `.LABEL` accept the same arguments. `GN1` and `GN2` are used to generate and copy labels for implementing subroutines and control structures. `*` is used to copy what has just been parsed. `.STRING` is used to copy a string literal

    OUT1 = '*1'     .OUT('GN1')
         / '*2'     .OUT('GN2')
         / '*'      .OUT('CI')
         / .STRING  .OUT('CL ' *).,
