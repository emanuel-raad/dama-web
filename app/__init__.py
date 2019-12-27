from flask import Flask
from flask_bootstrap import Bootstrap

from dama.game import dama

app = Flask(__name__)

# Bootstrap
bootstrap = Bootstrap(app)


from dama.game import dama
from dama.agents.human import Human
from dama.agents.random import Random
from dama.agents.alphaBeta import AlphaBeta
from dama.game.constants import Color

game = dama.DamaSingleton.getInstance()

# player1 = Human(Color.BLACK)
# player2 = Random(Color.WHITE)

player1 = Human(Color.BLACK)
# moveCache = MoveCache(path=path, buildCache = False)
player2 = AlphaBeta(Color.WHITE, moveCache=None, movesAhead=1)

game.setAgent(player1)
game.setAgent(player2)

game.setStartingPlayer(player1)

from app import routes