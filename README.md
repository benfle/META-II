# META II

> "Get used to a way of thinking in which the hardware of the realization of an idea is much less important than the idea itself."
>
> **Valentino Braitenberg**, *Vehicles*, p. 2

## Overview

This is a JavaScript implementation of the META II [metacompiler](http://en.wikipedia.org/wiki/Metacompiler) as described by Val Shorre in [the original paper from 1964](http://dl.acm.org/citation.cfm?doid=800257.808896).

I used the same byte-code interpreter. So I was able to bootstrap the system using [James Neighbors' compiled version of META II](http://www.bayfronttechnologies.com/mc_tutorial.html).

META II contains three important ideas in computing:

1. the creation of domain-specific languages,
2. the use of a virtual machine,
3. and the ability for a system to host its own evolution.

## Metalinguistic Abstraction

When developing software systems, [creating new languages](http://en.wikipedia.org/wiki/Metalinguistic_abstraction) is sometimes the best approach for dealing with complexity. It allows the programmer to focus on the problem instead of being distracted by implementation details.

META II is itself a language specific to the domain of compiler writing.

> "META II is a compiler writing language which consists of syntax equations resembling Backus normal form and into which instructions to output assembly language commands are inserted."
>
> **D. V. Shorre**, [*META II A Syntax-Oriented Compiler Writing Language*](http://dl.acm.org/citation.cfm?doid=800257.808896)

To create a new domain-specific language with META II, the programmer has to:

1. implement the basic objects and operations of the domain in a byte-code interpreter,
2. and specify the syntax and semantics of the language by writing a grammar in the META II language.

Please note that the byte-code interpreter is just one implementation of the idea that made sense in 1964. Today, we would probably implement the compiler with [threaded code](http://en.wikipedia.org/wiki/Threaded_code) or directly compile the grammar into executable code in a high-level language.

This approach has several advantages:

1. The syntax and semantics of the language can be designed iteratively in a high-level domain-specific language.

2. Porting the language to a new system only requires the implementation of the primitives objects and operations of the domain

3. Other languages can take advantage of the primitives to implement languages with very different syntax and semantics.

## Metacompiler

The main difference between META II and other [compiler writing tools](http://en.wikipedia.org/wiki/Compiler-compiler) is that META II can compile itself. In other words, META II is described using the language it implements. That is why it is called a [metacompiler](http://en.wikipedia.org/wiki/Metacompiler).

Below is the description of META II in META II from the [original paper](http://dl.acm.org/citation.cfm?doid=800257.808896).

    .SYNTAX PROGRAM

    OUT1 = '*1'     .OUT('GN1')
         / '*2'     .OUT('GN2')
         / '*'      .OUT('CI')
         / .STRING  .OUT('CL ' *).,

    OUTPUT = ('.OUT' '(' $ OUT1 ')' / '.LABEL' .OUT('LB') OUT1)
             .OUT('OUT') .,

    EX3 = .ID               .OUT('CLL ' *)
        / .STRING           .OUT('TST ' *)
        / '.ID'             .OUT('ID')
        / '.NUMBER'         .OUT('NUM')
        / '.STRING'         .OUT('SR')
        / '(' EX1 ')' 
        / '.EMPTY'          .OUT('SET')
        / '$' .LABEL *1 EX3 .OUT('BT ' *1) .OUT('SET').,

    EX2 = (EX3 .OUT('BF ' *1) / OUTPUT)
          $ (EX3 .OUT('BE') / OUTPUT)
          .LABEL *1 .,

    EX1 = EX2
          $ ('/' .OUT('BT ' *1) EX2)
          .LABEL *1 .,

    ST = .ID .LABEL * '=' EX1 '.,' .OUT('R').,

    PROGRAM = '.SYNTAX' .ID .OUT('ADR ' *)
              $ ST
              '.END'        .OUT('END').,

    .END

A detailed explanation of the syntax and semantics of META II is given in [METAII.md](METAII.md).

Because the META II language is described in itself, we can change its syntax by simply modifying the grammar and recompiling it. This operation generally requires two steps:

1. Modify the grammar to recognize the new language
2. Re-write the grammar in the new META language

Please note that the language we obtained after the first step is not a META language since it cannot compile itself.

## Usage

### To Create a Language

Create the compiler for your new language with:

    node compile.js bootstrap/meta2.o <grammar file>

This should write the assembly code for the new compiler on stdout.

To use the new compiler on a program:

    node compile.js <compiled grammar> <your program>

This should write the assembly code for your own byte-code interpreter on stdout.

### To Create a META language

First, you can make sure our META II language compile itself with:

    node compile.js bootstrap/meta2.o lib/meta2 | diff bootstrap/meta2.o -

You can modify the grammar to recognize a new META language and compile it with:

    node compile.js bootstrap/meta2.o <new grammar>

Then you can use your new META language to describe itself and compile it with:

    node compile.js <compiled grammar> <new META grammar>

You should get back the compiled version of the new META grammar.
