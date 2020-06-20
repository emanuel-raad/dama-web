from dama.render.renderer import Renderer
from dama.game.bitboard import Bitboard
from dama.game.move import MoveNode
from typing import List
from dama.agents.player import Player
from routes import updateBoard

class DamaJS(Renderer):

    def setup(self):
        pass

    def drawBoard(self, board:Bitboard):
        pass

    def animateMove(self, move:List[MoveNode]):
        pass

    def requestMoveFromPlayer(self, board:Bitboard, player:Player, legalMoves:List[List[MoveNode]]):
        pass

    def animateWinner(self, winner:Player):
        pass

    def cleanup(self):
        pass
