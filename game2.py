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
	layout = [[ sg.Image(image, key='_CHANGE_') ],
		   [sg.Image('Foto.png', key='_GRAPH_'), sg.Input(key='_IN_',size=(5,1)), sg.Button('Play')],
			 [sg.Button('Player1')],[sg.Button('Player2')],[sg.Button('Exit')]]
	window = sg.Window('QuantumPokerGame', layout)
	while True:  # Event Loop
	   event, values = window.Read()
	   print(event, values)
	   if event is None or event == 'Exit':
		   start = False
		   break
	   if event == 'Play':
		   # Update the "output" element to be the value of "input" element
		   window.Element('_CHANGE_').Update('geek.jpg')
	   if event == 'Player1':
		   # Update the "output" element to be the value of "input" element
		   window.Element('_CHANGE_').Update('geek.jpg')
	   if event == 'Player2':
		   # Update the "output" element to be the value of "input" element
		   window.Element('_CHANGE_').Update('geek.jpg')
		
		
window.Close()