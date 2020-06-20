import json

import numpy as np
from dama.agents.alphaBeta import AlphaBeta
from dama.agents.helper import MoveCache
from dama.agents.human import Human
from dama.agents.random import Random
from dama.game import dama, fenController
from dama.game.constants import Color
from dama.game.gameboard import Gameboard
from flask import jsonify, make_response, render_template, request, session

from app import app

@app.route('/')
@app.route('/index')
def index():
    user = {'username': 'Miguel'}

    posts = [
        {
            'author': {'username': 'John'},
            'body': 'Beautiful day in Portland!'
        },
        {
            'author': {'username': 'Susan'},
            'body': 'The Avengers movie was so cool!'
        }
    ]

    return render_template('index.html', title='Home', user=user, posts=posts)

@app.route('/hello', methods=['GET', 'POST'])
def hello():

    # POST request
    if request.method == 'POST':
        print('Incoming..')
        print(request.get_json())  # parse as JSON
        return 'OK', 200

    # GET request
    else:
        message = {'greeting':'Hello from Flask!'}
        return jsonify(message)  # serialize and use JSON headers

@app.route('/test')
def test_page():
    # look inside `templates` and serve `index.html`
    return render_template('json.html')

@app.route('/game')
def game():
    message = {'message':'Hello from Flask!'}

    return render_template('game.html', title="Dama", message=message)

@app.route('/socket')
def socket():
    return render_template('socket.html', title="Socket test")

@app.route('/fen', methods=['GET'])
def get_fen():
    if request.method == 'GET':
        # what a verbose line...
        game = dama.DamaSingleton.getInstance()
        fen = fenController.board2fen(game.gameboard.gameboard)
        # print(fen)

        return jsonify({'fen':fen})  # serialize and use JSON headers

@app.route('/updateBoard', methods=['POST'])
def updateBoard(fen):
    if request.method == 'POST':
        return fen, 200

@app.route('/updateui', methods=['POST'])
def updateui():
    if request.method == 'POST':
        game = dama.DamaSingleton.getInstance()
        game.check_for_promotions()       
        newFen = fenController.board2fen(game.gameboard.gameboard)
        return newFen, 200

@app.route('/nextturn', methods=['POST'])
def nextTurn():
    if request.method == 'POST':
        game = dama.DamaSingleton.getInstance()
        game.nextPlayer()
        # print('Current Player: {}'.format(game.current_player))
        return 'OK', 200

@app.route('/makeaimove', methods=['POST'])
def makeaiturn():
    if request.method == 'POST':
        game = dama.DamaSingleton.getInstance()

        res = game.get_all_legal_moves(game.current_player)
        choice = game.current_player.request_move(game.gameboard, res['move'], res['remove'])
        
        # print('Choice: {}'.format(choice))
        # print(res['move'][choice])
        # print(res['remove'][choice])

        game.performMove(res['move'][choice], res['remove'][choice])


        arr = res['move'][choice]
        fenstr = ''
        for a in arr:
            fenstr += fenController.pos2fen(a)
            fenstr += '-'
        fenstr = fenstr[:-1]

        # print('Current Player: {}'.format(game.current_player))
        # return make_response(jsonify({'fen':fenstr}), 200)
        return fenstr, 200

@app.route('/legalmoves', methods=['GET'])
def get_legalmoves():
    if request.method == 'GET':
        # what a verbose line...
        game = dama.DamaSingleton.getInstance()

        # print(game.gameboard.gameboard)
        # print(game.current_player)

        res = game.get_all_legal_moves(game.current_player)

        fenList = fenController.moves2fen(res['move'])
        removeList = fenController.moves2fen(res['remove'])

        return render_template('moves.html', res=zip(fenList, removeList))  # serialize and use JSON headers
        # return jsonify({'moves':fenList})
