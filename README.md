# Quantum Hold'em

## Introduction
- Quantum Hold'em is a two-player game designed to develop an intuition about common operations on qubits.
- In the beginning, every player gets a set of cards with gates. In the simple version of the game, they are drawn from the set (_X_, _H_, _Z_, _HZ_).
- A quantum circuit with randomly distributed gates and several empty fields is generated. The gates are splitted into several layers separated by barriers. During the game, the players start filling the layers with empty fields from the left by placing their cards on the spots denoted by _P0_ and _P1_ for the player number 0 and 1, respectively.

![picture](./circuit_example.png)

- When the last empty layer is filled, the game finishes and the final state is measured.
- Player 0 wins if 0's are represented in the measured state with higher probability than 50%, player 1 wins if 1's occur with probability higher than 50%.
