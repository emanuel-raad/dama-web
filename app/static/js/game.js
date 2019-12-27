var board = null
var $board = $('#board')
var squareToHighlight = null
var squareClass = 'square-55d63'

function removeHighlights (color) {
  $board.find('.' + squareClass)
    .removeClass('highlight-' + color)
}

function onDragStart (source, piece, position, orientation) {
  // only pick up pieces for White
  // if (piece.search(/^b/) !== -1) return false
  
  
  // disable moving through the board for now
  return false
}

// function onDrop (source, target) {
//   // highlight white's move
//   removeHighlights('white')
//   $board.find('.square-' + source).addClass('highlight-white')
//   $board.find('.square-' + target).addClass('highlight-white')

//   /*
//   At the end of onDrop, get the AI to make a move by calling
//   another AI move function. Highlight the AI moves inside their move function
//   */
// }

/*
function onMoveEnd () {
  $board.find('.square-' + squareToHighlight)
    .addClass('highlight-black')
}
*/

// update the board position after the piece snap
// for castling, en passant, pawn promotion
// function onSnapEnd () {
  
// }

var board = Chessboard('board', {
    draggable: true,
    dropOffBoard: 'snapback',
    sparePieces: false,
    position:'8/pppppppp/pppppppp/8/8/PPPPPPPP/PPPPPPPP/8',
    orientation: 'black',
    onDragStart: onDragStart,
    // onDrop: onDrop,
    // onMoveEnd: onMoveEnd,
    // onSnapEnd: onSnapEnd,
    pieceTheme: "static/img/chesspieces/wikipedia/{piece}.png",
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

// function movePromise(str1, str2, color) {
//     console.log('moving: ' + str1 + ' and ' + str2)
//     board.move(str1, str2)
    
//     $board.find('.square-' + str1.substring(0,2)).addClass('highlight-' + color)
//     $board.find('.square-' + str2.substring(3)).addClass('highlight-' + color)

//     return sleep(500)
// }

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

$('#move1Btn').on('click', async function () {
  
  console.log('Button clicked')
  
  removeHighlights('white')
  await performMove('white', 'e3-e8-a8', 'e5-c8')

  // await movePromise('h1-h5', 'h5-h8')
  // await movePromise('h8-c8', 'c8-a8')  
});

$('#getBtn').on('click', getLegalMoves)

$('#postBtn').on('click', function() {
  fetch('/hello', {
      // Specify the method
      method: 'POST',
      headers: {"content-type": "application/json"},
      // A JSON payload
      body: JSON.stringify({
          "greeting": "Hello from the browser!"
      })
  }).then(function (response) { // At this point, Flask has printed our JSON
      return response.text();
  }).then(function (text) {
      console.log('POST response: ');

      // Should be 'OK' if everything was successful
      console.log(text);
  });
})

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

$("body").on({
  mouseenter: function() {
    $(this).css("background-color", "pink")
    move = $(this).attr('data-move').split('-')

    for(let i = 0; i < move.length ; i++) {
      console.log(move[i])
      greySquare(move[i])
    }

  },
  mouseleave: function() {
    $(this).css("background-color", "transparent")
    removeGreySquares()
  },
  click: async function() {
    clearMoves()
    move = $(this).attr('data-move')
    remove = $(this).attr('data-remove')
    console.log("Moving: " + move)
    console.log("Removing: " + remove)
  
    removeHighlights('white')
    removeHighlights('black')
    
    await performMove('white', move, remove)
    await updateBoard()
    await nextTurn()
  
    await makeAIMove()
    await updateui()
    await nextTurn()
    await getLegalMoves()
}
}, "#move");

async function updateBoard() {
  fen = board.fen()
  console.log('Updating board to: '+ fen)

  const response = await fetch('/updateBoard', {
    // Specify the method
    method: 'POST',
    headers: { "content-type": "application/json" },
    // A JSON payload
    body: JSON.stringify({
      "fen": fen
    })
  })

  console.log('POST response: ')
  console.log(response)
  const res = await response.text()

  board.position(res)
}

async function updateui() {
  const response = await fetch('/updateui', {
    // Specify the method
    method: 'POST',
    headers: { "content-type": "application/json" },
  });
  console.log('POST response: ');
  console.log(response);

  const fen = await response.text()
  // Should be 'OK' if everything was successful
  board.position(fen)
}

async function nextTurn() {
  const text = await fetch('/nextturn', {
    // Specify the method
    method: 'POST',
  });
  console.log('POST response: ');
  console.log(text);
}

async function makeAIMove() {
  const response = await fetch('/makeaimove', {
    // Specify the method
    method: 'POST',
    headers: { "content-type": "application/json" },
  })

  console.log('POST response: ')
  console.log(response)

  const text = await response.text()
  res = text.split('-')

  for(let i = 0; i < res.length; i++) {
    console.log(res[i])
    $board.find('.square-' + res[i]).addClass('highlight-' + 'black')
  }

}

// rewrite as async
function getLegalMoves() {
  // const response = await fetch('/legalmoves', {
  //   headers: { "content-type": "application/json" },
  // })
  // console.log(response)
  // const json = await response.json()
  // console.log('GET response as JSON:')
  // console.log(json); // Here’s our JSON object
  // $("#place_for_moves").html(json['moves'])
    return $.ajax({
      url: "/legalmoves",
      type: "get",
      success: function(response) {
        $("#place_for_moves").html(response);
      },
      error: function(xhr) {
        //Do Something to handle error
      }
    });
}

function clearMoves() {
  $("#place_for_moves").html('Waiting for Computer...');
  removeGreySquares()
}