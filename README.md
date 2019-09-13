# Quantum Hold'em

## Introduction
- Quantum Hold'em is a two-player game designed to develop an intuition about common operations on qubits.
- In the beginning, every player gets a set of cards with gates. In the simple version of the game, they are drawn from the set (_X_, _H_, _Z_, _HZ_).
- A quantum circuit with randomly distributed gates and several empty spots is generated. During the game, the players place their cards on the empty spots.

![picture](./circuit_example.png)

in the beginning, quantum circuit is generated, it has empty spots where players place their gates
- in each round, both players place one of their cards on the pre-defined spots in the same layer, and so on until the last layer
- when the last empty layer is filled, the final state is measued
- objective is to maximize the number of 0's or 1's for player 0 and player 1, respectively in the measurement output

## Game example
