var board = null
var $board = $('#board')
var squareToHighlight = null
var squareClass = 'square-55d63'

function onDragStart (source, piece, position, orientation) {
  // disable moving through the board for now
  return false
}

var socket = io();
socket.on('connect', function() {
  socket.emit('my event', {data: 'I\'m connected!'});
});

socket.on('message-log', function(text) {
  console.log(text)
  $("#message_log").html(text)
});

socket.on('reset-board', function(text) {
  console.log('Resetting board')
  board.clear(false)
  board.start
  removeHighlights('white')
  removeHighlights('black')
});

function removeHighlights (color) {
  $board.find('.' + squareClass)
    .removeClass('highlight-' + color)
}

var board = Chessboard('board', {
    draggable: true,
    dropOffBoard: 'snapback',
    sparePieces: false,
    position:'8/pppppppp/pppppppp/8/8/PPPPPPPP/PPPPPPPP/8',
    orientation: 'white',
    onDragStart: onDragStart,
    // onDrop: onDrop,
    // onMoveEnd: onMoveEnd,
    // onSnapEnd: onSnapEnd,
    pieceTheme: "static/img/chesspieces/wikipedia/{piece}.png",
})

$('#startBtn').on('click', function() {
  console.log('Starting game!');
  socket.emit('start-event', 1);
})

socket.on('draw-event', function(fen) {
  console.log('Received draw event for: ' + fen);
  board.position(fen, false);
})

socket.on('display-moves', function(movesHtml) {
  $("#place_for_moves").html(movesHtml)
})

$("body").on({
  // Color the moused over move
  mouseenter: function() {
    $(this).css("background-color", "pink")
    move = $(this).attr('data-move').split('-')

    for(let i = 0; i < move.length ; i++) {
      greySquare(move[i])
    }

  },
  
  // Remove the color
  mouseleave: function() {
    $(this).css("background-color", "transparent")
    removeGreySquares()
  },

  // Do something when it's clicked on
  click: async function() {
    clearMoves()
    move = $(this).attr('data-move')
    remove = $(this).attr('data-remove')
    index = $(this).attr('data-idx')

    console.log("Moving: " + move)
    console.log("Removing: " + remove)

    socket.emit('player-choice', index);
  
}}, "#move");

var whiteSquareGrey = '#a9a9a9'
var blackSquareGrey = '#696969'

function removeGreySquares () {
  $('#board .square-55d63').css('background', '')
}

function greySquare (square) {
  var $square = $('#board .square-' + square)

  var background = whiteSquareGrey
  if ($square.hasClass('black-3c85d')) {
    background = blackSquareGrey
  }

  $square.css('background', background)
}

function clearMoves() {
  $("#place_for_moves").html('Waiting for Computer...');
  removeGreySquares()
}

socket.on('animate-move-event', async function(json) {
  console.log('Animating!');
  
  var obj = JSON.parse(json);
  console.log(obj)

  removeHighlights(obj.color)

  await performMove(obj.color, obj.move, obj.remove);
  await socket.emit('animation-event-done', 1)
});

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function performMove(color, move, remove)
{
  moveSplit = move.split('-')
  if (remove == undefined) remove = ''
  removeSplit = remove.split('-')
  
  for(let i = 0; i < moveSplit.length - 1; i++)
  {
    if (remove == '')
    {
      res = moveSplit[i] + '-' + moveSplit[i+1]
    } else {
      res = moveSplit[i] + '-' + removeSplit[i] + '-' + moveSplit[i+1]
    }
    await movePromise(color, res)
  }

  return sleep(0)

}

async function movePromise(color, res) 
{
  res = res.split('-')

  $board.find('.square-' + res[0]).addClass('highlight-' + color)

  if (res.length == 2)
  {
    board.move(res[0] + '-' + res[1])
    $board.find('.square-' + res[1]).addClass('highlight-' + color)

  } 
  else if (res.length > 2)
  {
    board.move(res[0] + '-' + res[1], res[1] + '-' + res[2])
    $board.find('.square-' + res[2]).addClass('highlight-' + color)
  }

  return sleep(500)
}