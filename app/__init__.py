from flask import Flask
from flask_bootstrap import Bootstrap
from flask_socketio import SocketIO, send, emit

from dama.game.dama2 import DamaGame
from dama.agents.human import Human
from dama.agents.random import Random
from dama.agents.alphaBeta import AlphaBeta
from dama.game.constants import Color
from dama.game.fen import bitboard2fen

from app.damaJS import DamaJS

app = Flask(__name__)

# Bootstrap
bootstrap = Bootstrap(app)
socketio = SocketIO(app)

# game.start()

@socketio.on('connected-event')
def handle_message(json):
    print('received message: ' + str(json))

@socketio.on('button-event')
def button_handler(json):
    print('clicked on button: ' + str(json))

@socketio.on('start-event')
def start_game(status):
    renderer = DamaJS(socketio)

    game = DamaGame(renderer=renderer)
    emit('reset-board')
    emit('draw-event', bitboard2fen(game.bitboard))

    player1 = Human(Color.WHITE)
    player2 = AlphaBeta(Color.BLACK, movesAhead=3)

    game.setPlayer(player1)
    game.setPlayer(player2)

    game.start()

from app import routes