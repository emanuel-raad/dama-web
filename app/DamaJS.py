from typing import List
import json

from dama.agents.player import Player
from dama.game.bitboard import Bitboard, flip_color
from dama.game.move import MoveNode
from dama.render.renderer import Renderer
from dama.game.fen import bitboard2fen, movelist2fen, flipFen
import time

class DamaJS(Renderer):

    def __init__(self, socketio):
        super().__init__()
        self.socketio = socketio

    def setup(self):
        pass

    def drawBoard(self, board:Bitboard):
        # self.socketio.emit('draw-event', bitboard2fen(board))
        pass

    def animateMove(self, board, player, move:List[MoveNode]):

        moveStr, capStr = movelist2fen(move)
        if player.type == 'AI':
            moveStr = flipFen(moveStr)
            capStr = flipFen(capStr)

        data = {
            'color' : player.color.value,
            'move' : moveStr,
            'remove' : capStr
        }

        self.socketio.emit('animate-move-event', json.dumps(data))

        timedout = False
        self.animationDone = False

        def animation_done(c):
            self.animationDone = True

        self.socketio.on_event('animation-event-done', animation_done)

        timedout = True

        while timedout:
            if self.animationDone:
                timedout = False
                if player.type == 'AI':
                    self.socketio.emit('draw-event', bitboard2fen(flip_color(board)))
                else:
                    self.socketio.emit('draw-event', bitboard2fen(board))
            else:
                self.socketio.sleep(0.001)
                time.sleep(0.001)


    def requestMoveFromPlayer(self, board:Bitboard, player:Player, legalMoves:List[List[MoveNode]]):

        if player.type == 'Human':
            
            moveStr = [movelist2fen(move)[0] for move in legalMoves]
            capStr = [movelist2fen(move)[1] for move in legalMoves]

            html = ''
            for i, (move, cap) in enumerate(zip(moveStr, capStr)):
                html += "<div id='move' data-move='{}' data-remove='{}' data-idx='{}' ><p> {} </p></div>\n".format(
                    move, cap, i, move
                )

            self.socketio.emit('display-moves', html)

            self.choice = None

            def receive_choice(c):
                self.choice = int(c)

            self.socketio.on_event('player-choice', receive_choice)
            self.socketio.emit('message-log', 'Waiting for player input')

            timedout = True

            while timedout:
                if self.choice is None:
                    self.socketio.sleep(0.001)
                    time.sleep(0.001)
                else:
                    timedout = False
            
            self.socketio.emit('message-log', 'Player picked: ' + str(self.choice))

            # print("Player picked: {}".format(self.choice))

            return self.choice
        else:
            return player.request_move(board, legalMoves)

    def animateWinner(self, winner:Player):
        self.socketio.emit('display-moves', '')
        self.socketio.emit('message-log', 'Congrats to {}'.format(winner.color.value))

    def cleanup(self):
        pass
