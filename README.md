# Tic-Tac-Toe
Odin Project Tic Tac Toe

This was made for the module design lesson. Modular design is different from modules in javascript. 

You can view this page live at: https://Wyatt-Rowland.github.io/Tic-Tac-Toe/

I should go back and clean this code up. It is a mess, as I was trying to learn a lot of different things while I was making it. It was a very frustrating project. 
I was able to use a minmax algorithm for my hard and normalai though, which I think is something.



This is a normal function. Modular design was used in older forms of javascript. It was useless in keeping variables private, and not messing with things at the global scope. 
function example1() {
  console.log("Something")
}

This is a function using the modular design: 
const exampleModule = (function() => {
  function example2() {
    console.log('Something2")
  }
  function _example3() {
    console.log("Something3")
  }
  return {example2}
})();

So now I can call example1 like this:
example1()

To call example2, I can do this:
exampleModule.example2()

And example3 can't be called outside of the exampleModule. 
