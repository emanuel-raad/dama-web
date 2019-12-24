var board = null
var $board = $('#board')
var squareToHighlight = null
var squareClass = 'square-55d63'

function removeHighlights (color) {
  $board.find('.' + squareClass)
    .removeClass('highlight-' + color)
}

/* 
function onDragStart (source, piece, position, orientation) {
  // only pick up pieces for White
  if (piece.search(/^b/) !== -1) return false
}
*/

function onDrop (source, target) {
  // highlight white's move
  removeHighlights('white')
  $board.find('.square-' + source).addClass('highlight-white')
  $board.find('.square-' + target).addClass('highlight-white')
  
  /*
  At the end of onDrop, get the AI to make a move by calling
  another AI move function. Highlight the AI moves inside their move func
  */
}

/*
function onMoveEnd () {
  $board.find('.square-' + squareToHighlight)
    .addClass('highlight-black')
}
*/

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  
}

var board = Chessboard('board', {
    draggable: true,
    dropOffBoard: 'snapback',
    sparePieces: false,
    position:'8/pppppppp/pppppppp/8/8/PPPPPPPP/PPPPPPPP/8',
    orientation: 'black',
    //onDragStart: onDragStart,
    onDrop: onDrop,
    //onMoveEnd: onMoveEnd,
    onSnapEnd: onSnapEnd,
})

$('#startBtn').on('click', function() {
    removeHighlights('white')
    removeHighlights('black')
    board.start()
})

$('#clearBtn').on('click', function() {
    removeHighlights('white')
    removeHighlights('black')
    board.clear()
})

$('#flipOrientationBtn').on('click', board.flip)

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function movePromise(str1, str2) {
    console.log('moving: ' + str1 + ' and ' + str2)
    board.move(str1, str2)
    
    $board.find('.square-' + str1.substring(0,2)).addClass('highlight-white')
    $board.find('.square-' + str2.substring(3)).addClass('highlight-white')

    return sleep(500)
}

$('#move1Btn').on('click', async function () {
  
  console.log('Button clicked')
  
  removeHighlights('white')
  
  await movePromise('e3-e5', 'e5-e8')
  await movePromise('e8-c8', 'c8-a8')
  
  // await movePromise('h1-h5', 'h5-h8')
  // await movePromise('h8-c8', 'c8-a8')
  
  console.log('Done Moving')
});