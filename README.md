# Quantum Hold'em

## Introduction
- Quantum Hold'em is a two-player game designed to develop an intuition about common operations on qubits.
- In the beginning, every player gets a set of cards with gates. In the simple version of the game, they are drawn from the set (_X_, _H_, _Z_, _HZ_).
- A quantum circuit with randomly distributed gates and several empty fields is generated. The gates are splitted into several layers separated by barriers. In each round of the game, players fill the empty fields (starting from the left) by placing their cards on the spots denoted by _P0_ and _P1_ for the player number 0 and 1, respectively.

![picture](./circuit_example.png)

- When the last empty layer is filled, the game finishes and the final state is calculated.
- Player 0 wins if 0's are represented in the final state with probability higher than 50%, and vice versa for player 1.
