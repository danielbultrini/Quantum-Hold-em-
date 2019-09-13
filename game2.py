import PySimpleGUI as sg

start = False

while not start:
    layout = [[sg.Text('Welcome to the game')],
        [sg.Text('Number of qubit', size=(15, 1)), sg.InputText()],
        [sg.Text('Number of rounds desired', size=(15, 1)), sg.InputText()],
        [sg.Submit(), sg.Cancel()]]

    window = sg.Window('QuantumPokerGame', layout)

    event, values = window.Read()

    folder_path, file_path = values[0], values[1] 
    start = True
    window.Close()

while start:
    image = 'circuit.png'
    values=['Listbox 1', 'Listbox 2', 'Listbox 3']
    column = [[sg.Text('Gate Arena')],
      # [sg.Text('Player 0'), sg.Input(key='_0_',size=(5,1))],
      # [sg.Text('Player 1'), sg.Input(key='_1_',size=(5,1))],
          [sg.Button('Player 1')],
          [sg.Button('Player 2')],
        [sg.Button('Play')]]
 
    layout = [[ sg.Image(image, key='_CHANGE_') ],
        [sg.Image('circuit.png', key='_GRAPH_'),  sg.Column(column)],
        [sg.Button('Exit')]]
    window = sg.Window('QuantumPokerGame', layout)
    while True:  # Event Loop
        event, values = window.Read()
        print(event, values)
        if event is None or event == 'Exit':
            start = False
            break
        if event == 'Play':
            # Update the "output" element to be the value of "input" element
            if player1_play == '':
                #print(player2_play)
                #print(type(player2_play))
                sg.Popup("Player 1 didn't make a move")
            elif player2_play == '':
                #print(player2_play)
                #print(type(player2_play))
                sg.Popup("Player 2 didn't make a move")
                
            else:
                print(player2_play)
                print(type(player2_play))
                window.Element('_CHANGE_').Update('circuit.png')
                player1_play = ''
                player2_play = ''

            
        if event == 'Player 1':
            # Update the "output" element to be the value of "input" element
            player1_play = sg.PopupGetText('gates','Select your gate, Player 1')
        if event == 'Player 2':
            # Update the "otput" element to be the value of "input" element
            player2_play = sg.PopupGetText('gates2','Select your gate, Player 2')


window.Close()