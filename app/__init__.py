from flask import Flask
from flask_bootstrap import Bootstrap

from dama.game.dama2 import DamaGame
from dama.agents.human import Human
from dama.agents.random import Random
from dama.agents.alphaBeta import AlphaBeta
from dama.game.constants import Color

app = Flask(__name__)

# Bootstrap
bootstrap = Bootstrap(app)

game = DamaGame()

player1 = Human(Color.WHITE)
player2 = Random(Color.BLACK)

game.setPlayer(player1)
game.setPlayer(player2)

game.start()

from app import routes