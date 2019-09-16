import numpy as np
from qiskit import *
from qiskit.visualization import plot_histogram
from qiskit.tools.visualization import circuit_drawer
from qiskit.circuit import Gate
from collections import Counter
import math
from PIL import Image

def apply_gate(circuit,gate_str,applied,ctrl=0):
    if gate_str == 'H':
        circuit.h(applied)
    elif gate_str == 'HZ':
        circuit.z(applied)
        circuit.h(applied)
    elif gate_str == 'X':
        circuit.x(applied)
    elif gate_str == 'Z':
        circuit.z(applied)
    elif gate_str == 'CX':
        circuit.cx(ctrl,applied)
    elif gate_str == 'I':
        circuit.iden(applied)
    elif gate_str == 'Id':
        pass
    return circuit


def generate_subcircuit(no_qubits):
    gates_lists = ['H', 'HZ', 'X', 'Z', 'CX'] + 3*['Id']
    circuit = QuantumCircuit(no_qubits)
    all_ids = True
    for q in range(no_qubits):
        gate = np.random.choice(gates_lists)
        if gate != 'Id':
            all_ids = False
        ctrl = 0
        if gate == 'CX':
            list_qubits = list(range(no_qubits))
            list_qubits.pop(q)
            ctrl = np.random.choice(list_qubits)
        apply_gate(circuit, gate, q, ctrl)
    if not all_ids:
        circuit.barrier()
    return circuit

#------------------------------------------------------------------------------
#main functions

def generate_game(no_qubits, no_rounds, demo = False):
    Circuits = []
    Plays = []

    if demo:
        init_circuit = QuantumCircuit(no_qubits)
        init_circuit.h(range(no_qubits))
        init_circuit.barrier()
        Circuits.append(init_circuit)
        #ROUND 0
        circuit = QuantumCircuit(no_qubits)
        circuit.cx(2,0)
        circuit.barrier()
        Circuits.append(circuit)
        #ROUND 1
        circuit = QuantumCircuit(no_qubits)
        circuit.z(1)
        circuit.barrier()
        Circuits.append(circuit)
        #ROUND 2
        circuit = QuantumCircuit(no_qubits)
        circuit.x(2)
        circuit.z(0)
        circuit.h(0)
        circuit.barrier()
        Circuits.append(circuit)
        #ROUND 3
        circuit = QuantumCircuit(no_qubits)
        circuit.cx(0,2)
        circuit.barrier()
        Circuits.append(circuit)

        Plays = [[('P0',2),('P1',0)],
                 [('P0',1),('P1',2)],
                 [('P0',0),('P1',1)],
                 [('P0',2),('P1',0)]
                ]

    else:
        init_circuit = QuantumCircuit(no_qubits)
        init_circuit.h(range(no_qubits))
        init_circuit.barrier()
        Circuits.append(init_circuit)

        for n in range(no_rounds):
            qubits_play = np.random.choice(list(range(no_qubits)),2,replace = False)
            np.random.shuffle(qubits_play)
            play = [('P0',qubits_play[0]), ('P1',qubits_play[1])]
            Plays.append(play)
            Circuits.append(generate_subcircuit(no_qubits))

    return Circuits, Plays


def draw_game(Circuits, Plays, unveil = False, display_empty = False):
    if display_empty:
        final_circ = get_played_game(Circuits, Plays, display_empty = display_empty)
        final_circ.barrier()
    else:
        final_circ = Circuits[0].copy()
        FLAG = 0
        for play, circ in zip(Plays, Circuits[1:]):
            for player, qubit in play:
                if player in ['P0','P1']:
                    if FLAG <= 1:
                        final_circ.append(Gate(name = '-> ' + player, num_qubits = 1, params = []),[qubit])
                    else:
                        final_circ.append(Gate(name = player, num_qubits = 1, params = []),[qubit])
                    FLAG += 1
                else:
                    final_circ = apply_gate(final_circ,gate_str = player,applied = qubit)
            final_circ.barrier()
            if unveil and FLAG > 1:
                for q in range(circ.n_qubits):
                    final_circ.append(Gate(name = '?', num_qubits = 1, params = []),[q])
                final_circ.barrier()
            else:
                final_circ = final_circ + circ
            #final_circ.measure()

    final_circ.draw(output = 'mpl').savefig('stage.png')


def distribute_cards(no_rounds, demo = False):
    if demo:
        hand_P0 = {'Z':1, 'HZ': 1, 'X': 1, 'H':2}
        hand_P1 = {'I':2, 'X': 1, 'Z': 1, 'HZ': 1}
    else:
        cards_list = ['H', 'HZ', 'X', 'Z', 'I']
        deck = np.array(no_rounds*cards_list)
        np.random.shuffle(deck)
        hand_size = no_rounds + 1
        hand_P0 = dict(Counter(deck[0:hand_size]))
        hand_P1 = dict(Counter(deck[hand_size:2*hand_size]))
    return hand_P0, hand_P1


def play_round(n_round,Plays,P0,P1):
    Plays[n_round][0] = (P0, Plays[n_round][0][1])
    Plays[n_round][1] = (P1, Plays[n_round][1][1])
    return Plays


def get_played_game(Circuits, Plays, display_empty = False):
    final_circ = Circuits[0].copy()
    for play, circ in zip(Plays, Circuits[1:]):
        for player, qubit in play:
            if player in ['P0','P1']:
                if not display_empty:
                    return final_circ
                else:
                    final_circ.append(Gate(name = player, num_qubits = 1, params = []),[qubit])
            else:
                final_circ = apply_gate(final_circ, gate_str = player,applied = qubit)
        if display_empty and player in ['P0','P1']:
            return final_circ
        final_circ.barrier()
        final_circ = final_circ + circ
    return final_circ

def compute_state(partial_circ):
    backend = Aer.get_backend('statevector_simulator')
    job = execute(partial_circ, backend)
    result = job.result()
    state = result.get_statevector(partial_circ, decimals=3)
    return state


def score_counts(state_v):
    e_ones = 0
    for i, p in enumerate(np.abs(state_v)**2):
        e_ones += p*np.sum(np.array(list(bin(i)[2:])).astype(np.int))
    return np.around(e_ones/np.log2(len(state_v))*100,decimals = 1)


def state_draw(state):
    state_dict = {}
    state = list(state)
    n_qubits = int(math.log(len(state),2))
    for i in range(len(state)):
        state_dict[bin(i)[2:].zfill(n_qubits)[::-1]] = 1000*np.abs(state[i])**2
    plot_histogram(state_dict).savefig("state_prb.png")

def resize_img(title, basewidth):
    img = Image.open(title)
    if img.size[0] > basewidth:
        wpercent = (basewidth/float(img.size[0]))
        hsize = int((float(img.size[1])*float(wpercent)))
        img = img.resize((basewidth,hsize), Image.ANTIALIAS)
        img.save(title)
    else:
        pass

def resize_img_height(title, base_height):
    img = Image.open(title)
    if img.size[1] > base_height:
        img = img.resize((img.size[0],base_height), Image.ANTIALIAS)
        img.save(title)
    else:
        pass
