import PySimpleGUI as sg
from circuit_generatorV2 import *
from PIL import Image 

start = False

Circuits = None
Plays = None
no_qubits = None
no_rounds = None
current_round = 0
unveil = False
display_empty = False
demo = False


while not start:
    layout = [[sg.Text('Welcome to the game')],
        [sg.Text('Number of qubit', size=(15, 1)), sg.InputText()],
        [sg.Text('Number of rounds', size=(15, 1)), sg.InputText()],
        [sg.Text('Mode', size=(15, 1)), sg.Listbox(values = ('Normal','Hidden','Poker','Demo')),sg.Text('Press to select', size=(15, 1))],
        [sg.Submit(), sg.Cancel()]]
    
    window = sg.Window('QuantumPokerGame', layout)
    
    event, values = window.Read()
    if values[2] == []:
        values[2] = ['dskjgoisjfguoihdgguoihjerio']
    no_qubits = int(values[0])
    no_rounds = int(values[1])
    if values[2][0] == 'Demo':
        demo = True
        no_qubits = 3
        no_rounds = 4
    elif values[2][0] == 'Hidden':
        unveil = True
    elif values[2][0] == 'Poker':
        display_empty = True
    
    
    Circuits, Plays = generate_game(int(no_qubits),int(no_rounds), demo=demo)
    start = True
    window.Close()

while start:
    draw_game(Circuits,Plays,unveil=unveil,display_empty=display_empty)
    hand_0, hand_1 = distribute_cards(no_rounds,demo=demo)

    image = 'stage.png'
    resize_img(image,1700)
    resize_img_height('stage.png',400)
    column = [[sg.Text('')],
      # [sg.Text('Player 0'), sg.Input(key='_0_',size=(5,1))],
      # [sg.Text('Player 1'), sg.Input(key='_1_',size=(5,1))],
          [sg.Button('Player 0',size = (20,2),font=("Times", 12, "bold")),
           sg.Button('Player 1',size=(20,2),font=("Times", 12, "bold"))],
        
          [sg.Button('Play',size=(42,2),font=("Times", 12, "bold"))]]
    init_circuit = get_played_game(Circuits,Plays)
    state = compute_state(init_circuit)
    #print(state)
    state_draw(state)
    resize_img('state_prb.png',640)
    layout = [[ sg.Image(image, key='_CHANGE_') ],
        [sg.Image('state_prb.png', key='_GRAPH_'),  sg.Column(column, justification="center")],
        [sg.Button('Exit',font=("Times", 8, "bold"),size = (10,1))]]
    window = sg.Window('QuantumPokerGame', layout, location = (0,0), keep_on_top=False) #size = (1700,800), )
    while True:  # Event Loop
        event, values = window.Read()
        #print(event, values)
        if event is None or event == 'Exit':
            start = False
            break
        if event == 'Play':
            # Update the "output" element to be the value of "input" element
            if player1_play == '':
                #print(player2_play)
                #print(type(player2_play))
                sg.Popup("Player 0 didn't make a move")
            elif player2_play == '':
                #print(player2_play)
                #print(type(player2_play))
                sg.Popup("Player 1 didn't make a move")    
            else:
                Plays = play_round(current_round, Plays,player1_play,player2_play )
                draw_game(Circuits,Plays,unveil=unveil,display_empty=display_empty)
                init_circuit = get_played_game(Circuits,Plays)
                state = compute_state(init_circuit)
                ###PARTIAL CIRCUIT
                #we have circuit that stops at end
                #get played game stops before next play
                #we want to use this to feed the draw_circuit, remember to edit number of Plays entries
                #add additional barrier
                
                #print(state)
                state_draw(state)
                resize_img('stage.png',1700)
                resize_img_height('stage.png',400)
                resize_img('state_prb.png',640)

                window.Element('_CHANGE_').Update('stage.png')
                window.Element('_GRAPH_').Update('state_prb.png')

                player1_play = ''
                player2_play = ''
                current_round += 1
                if current_round == no_rounds:
                    final_circuit = get_played_game(Circuits,Plays)
                    state_draw(state)
                    state = compute_state(final_circuit)
                    window.Element('_CHANGE_').Update('stage.png')
                    window.Element('_GRAPH_').Update('state_prb.png')
                    score_1 = score_counts(state)
                    score_0 = 100 - score_1
                    if score_1 < score_0:
                        sg.Popup('PLAYER 0 WINS!!!!!!!!!! score: %s / 100' % int(score_0))
                    elif score_0 < score_1:
                        sg.Popup('Player 0 does not win!!!! Player 1 score: %s / 100' % int(score_1))
                        
                    else:
                        sg.Popup('Player 0 does not win nor lose!!!!')
                        

        
                    

            
        if event == 'Player 0':
            # Update the "output" element to be the value of "input" element
            hand_0_str = '  '.join(['%s: %s   ' % (key, value) for (key, value) in hand_0.items()])
            player1_play = sg.PopupGetText(hand_0_str,'Select your gate, Player 0').upper()
            if player1_play in hand_0:
                hand_0[player1_play] = hand_0[player1_play] - 1
            else:
                sg.Popup("Invalid move, choose a card in your hand.")
            
        if event == 'Player 1':
            # Update the "otput" element to be the value of "input" element
            hand_1_str = '  '.join(['%s: %s    ' % (key, value) for (key, value) in hand_1.items()])
            player2_play = sg.PopupGetText(hand_1_str,'Select your gate, Player 1').upper()
            if player2_play in hand_1:
                hand_1[player2_play] = hand_1[player2_play] - 1
            else:
                sg.Popup("Invalid move, choose a card in your hand.")



window.Close()