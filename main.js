var sizes = {
    grid:[12,12],
    chunk: 46,
    chunkS: 32.5
}

var Pieces = {
    ln2: {
        size: [2, 1],
        layout: [
            [1, 1]
        ],
        color: '#000'
    },
    ln3: {
        size: [3, 1],
        layout: [
            [1, 1, 1]
        ],
        color: '#111'
    },
    ln4: {
        size: [4, 1],
        layout: [
            [1, 1, 1, 1]
        ],
        color: '#222'
    },
    ln5: {
        size: [5, 1],
        layout: [
            [1, 1, 1, 1, 1]
        ],
        color: '#333'
    },
    sBlock: {
        size: [1, 1],
        layout: [
            [1]
        ],
        color: '#444'
    },
    mBlock: {
        size: [2, 2],
        layout: [
            [1, 1],
            [1, 1]
        ],
        color: '#555'
    },
    lBlock: {
        size: [3, 3],
        layout: [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1]
        ],
        color: '#666'
    },
    smallL: {
        size: [2, 2],
        layout: [
            [1, 0],
            [1, 1]
        ],
        color: '#777'
    },
    bigL: {
        size: [3, 3],
        layout: [
            [1, 0, 0],
            [1, 0, 0],
            [1, 1, 1]
        ],
        color: '#888'
    },
}

function initPieceHtml() {
    // Just for readability
    var htmlRow = "<div class='chunk-row'></div>";
    var htmlChunk = "<div class='chunk'></div>";
    var htmlPlaceholder = "<div class='chunk placeholder'></div>";
    var container = "#invisible-template-container ";

    for (var piece in Pieces) {
        $(container).append("<div class='piece " + piece + "'></div>")
        for (var row = 0; row < Pieces[piece].layout.length; row++) {
            $(container + ' .' + piece).append(htmlRow)
            for (var chunk = 0; chunk < Pieces[piece].layout[row].length; chunk++) {
                if (Pieces[piece].layout[row][chunk] == 0) {
                    $(container + '.' + piece + ' .chunk-row:last-child').append(htmlPlaceholder)
                } else {
                    $(container + '.' + piece + ' .chunk-row:last-child').append(htmlChunk)
                }
            }
        }
    }
}

function initGrid() {
    // Just for readability
    var htmlRow = "<div class='grid-row'>";
    var htmlChunk = "<div class='chunk'></div>";
    
    for (var row = 0; row < sizes.grid[1]; row++) {
        $('.grid-container').append(htmlRow)
        for (var chunk = 0; chunk < sizes.grid[0]; chunk++) {
            $('.grid-container .grid-row:last-child').append(htmlChunk)
        }
    }
}

function spawnPiece(type, slot, rotation) {
    $('#invisible-template-container .' + type).clone().appendTo('#s' + slot + ' .drag-container')
}

function changePieceSize(piece, growShrink) {
    var pieceType = piece.attr("class").split(' ')[1];
    var newSize = (growShrink == 'shrink') ? sizes.chunkS : sizes.chunk;


    $(piece).width(newSize * Pieces[pieceType].size[0] + (Pieces[pieceType].size[0] - 1) * 2)
    $(piece).height(newSize * Pieces[pieceType].size[1] + (Pieces[pieceType].size[1] - 1) * 2)

    $(piece).find('.chunk').height(newSize);
    $(piece).find('.chunk').width(newSize);
}

window.onload = function() {
    initGrid()
    initPieceHtml();

    spawnPiece(pickRandomProperty(Pieces), 1)
    spawnPiece(pickRandomProperty(Pieces), 2)
    spawnPiece(pickRandomProperty(Pieces), 3)


    var centerCursor = {
        left: $(".drag-container").width() / 2,
        bottom: $(".drag-container").height() / 2
    }

    $(".drag-container").draggable({
        start: function() {
            changePieceSize($(this).find('.piece'), 'grow')
        },
        revert: function() {
            // check if it was a good drop, valid position and such.
            var allGood = false;

            if (allGood) {
                // actually drop it
                // delete this thing
                return false;
            } else {
                // Shrink them back
                changePieceSize($(this).find('.piece'), 'shrink')

                // Return the piece to starting position
                $(this).data("uiDraggable").originalPosition = {
                    top: 0,
                    left: 0
                };

                return true;
            }
        },
        cursorAt: centerCursor
    });
}

function pickRandomProperty(obj) {
    var result;
    var count = 0;
    for (var prop in obj)
        if (Math.random() < 1 / ++count)
            result = prop;
    return result;
}