var sizes = {
    bigScreen: {
        chunk: 46,
        BChunk: 'generateMeBruh',
        SChunk: 'generateMeBruh',
        spacing: 2
    },
    smallScreen: {
        chunk: 23,
        BChunk: 'generateMeBruh',
        SChunk: 'generateMeBruh',
        spacing: 1
    },
    grid: [12, 12],
    BScale: 1,
    SScale: 0.75
}
function initDynamicSizes () {
    sizes.bigScreen.SChunk = sizes.SScale*sizes.bigScreen.chunk
    sizes.smallScreen.SChunk = sizes.SScale*sizes.smallScreen.chunk
    sizes.bigScreen.BChunk = sizes.BScale*sizes.bigScreen.chunk
    sizes.smallScreen.BChunk = sizes.BScale*sizes.smallScreen.chunk
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
};
var currentPieces = {
    1: 'EMPTY',
    2: 'EMPTY',
    3: 'EMPTY'
};
var grid;

function initGridHtml() {
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

function genPieceHtml(type, slot, layout) {
    // Just for readability
    var htmlRow = "<div class='chunk-row'></div>";
    var htmlChunk = "<div class='chunk'></div>";
    var htmlPlaceholder = "<div class='chunk placeholder'></div>";
    var container = '#s' + slot + ' .drag-container'
    
    $(container).append(String.format("<div class='piece {0}'></div>", type))
    for (var row = 0; row < layout.length; row++) {
        $(String.format("{0} .{1}", container, type)).append(htmlRow)
        for (var chunk = 0; chunk < layout[row].length; chunk++) {
            if (layout[row][chunk] == 0) {
                $(String.format("{0} .{1} .chunk-row:last-child", container, type)).append(htmlPlaceholder)
            } else {
                $(String.format("{0} .{1} .chunk-row:last-child", container, type)).append(htmlChunk)
            }
        }
    }
}

function spawnPiece(type, slot, rotation) {
    console.log(type, slot, rotation)
    
    var layout = rotateArray(Pieces[type].layout, rotation/90);
    currentPieces[slot] = {
        type: type,
        color: Pieces[type].color,
        layout: layout
    }
    
    genPieceHtml(type, slot, layout)
    updateDragbox(slot);
}

function checkValidDrop (drag_container) {
    var slot = $(drag_container).parent().attr('id').match(/\d+/)[0];
    
    return false;
}

function removePiece(slot) {
    $('#s' + slot + " .drag-container").empty();
    $("#s" + slot + "_rotation").remove();
    currentPieces[slot] = 'EMPTY'
}

function changePieceSize(slot, growShrink) {
    // Error handling
    if (slot == 'EMPTY') {
        return false
    }
    
    var pieceSelector = "#s"+slot+" .piece";
    var newSize = (growShrink == 'shrink') ? sizes[getScreenType()].SChunk : sizes[getScreenType()].BChunk;
    var spacing = sizes[getScreenType()].spacing;

    $(pieceSelector).css('width', newSize * currentPieces[slot].layout[0].length + (currentPieces[slot].layout[0].length - 1) * spacing)
    $(pieceSelector).css("height", newSize * currentPieces[slot].layout.length + (currentPieces[slot].layout.length - 1) * spacing)

    $(pieceSelector).find('.chunk').css('width', newSize);
    $(pieceSelector).find('.chunk').css("height", newSize);
}

function initCSS() {
    // Piece Color CSS
    for (var piece in Pieces) {
        var color = Pieces[piece].color;
        var pieceCSS = String.format("\
            .{0} .chunk {\
                background: {1};\
            }", piece, color);

        $("<style>")
            .prop("type", "text/css")
            .prop("id", piece + "_CSS")
            .html(pieceCSS)
            .appendTo("head");
    };
}

function updateDragbox(slot) {
    if (currentPieces[slot] == 'EMPTY') {
        return false
    }
    // You'd think finding where to place a cursor would be easy right?
    // Guess again.
    var centerCursor = false;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        var pieceType = $("#s" + slot + " .drag-container").find('.piece').attr("class").split(' ')[1];
        var rotationMod = (currentPieces[slot] == 90 || currentPieces[slot] == 270) ? 1 : 0;

        var pieceWidth = (sizes[getScreenType()].chunk * Pieces[pieceType].size[rotationMod]);
        var containerPieceWDiff = pieceWidth - $(".drag-container").width()
        if (containerPieceWDiff > 0) {
            centerCursor = {
                left: ($(".drag-container").width() + containerPieceWDiff) / 2,
                bottom: 0
            }
        } else {
            centerCursor = {
                left: $(".drag-container").width() / 2,
                bottom: 0
            }
        }
    }
    
    $("#s" + slot + " .drag-container").draggable( "option", "cursorAt", centerCursor );
    
    changePieceSize(slot, 'shrink')
}

function initDragboxes() {
    $(".drag-container").each(function () {
        $(this).draggable({
            start: function () {
                changePieceSize($(this).parent().attr('id').match(/\d+/)[0], 'grow')
            },
            revert: function () {
                // check if it was a good drop, valid position and such.
                var validDrop = checkValidDrop(this);

                if (validDrop) {
                    // actually drop it
                    // delete this thing
                    return false;
                } else {
                    // Shrink them back
                    changePieceSize($(this).parent().attr('id').match(/\d+/)[0], 'shrink')

                    // Return the piece to starting position
                    $(this).data("uiDraggable").originalPosition = {
                        top: 0,
                        left: 0
                    };

                    return true; // please revert me
                }
            },
            revertDuration: 250,
            scroll: false
        });
        var currSlot = $(this).parent().attr('id').match(/\d+/)[0]
        updateDragbox(currSlot)
    });
}

function Roll() {
    removePiece(1)
    removePiece(2)
    removePiece(3)
    spawnPiece(pickRandomProperty(Pieces), 1, getRandomRotation())
    spawnPiece(pickRandomProperty(Pieces), 2, getRandomRotation())
    spawnPiece(pickRandomProperty(Pieces), 3, getRandomRotation())
}

function initGrid(size) {
    // Stackoverflow Wizardry.
    grid = Array.apply(null, Array(size[1]))
        .map(function () {
            return Array.apply(null, Array(size[0])).map(function () {
                return 0
            });
        });
}

function init() {
    initDynamicSizes();
    initGridHtml()
    initCSS();
    
    initDragboxes();
    
    initGrid(sizes.grid);

    Roll();

    $(window).resize(function () {
        updateDragbox(1)
        updateDragbox(2)
        updateDragbox(3)
        $(".drag-container").each(function () {
            changePieceSize($(this).parent().attr('id').match(/\d+/)[0], 'shrink')
        })
    });
}

// Utilities
function pickRandomProperty(obj) {
    var result;
    var count = 0;
    for (var prop in obj)
        if (Math.random() < 1 / ++count)
            result = prop;
    return result;
}

String.format = function () {
    // The string containing the format items (e.g. "{0}")
    // will and always has to be the first argument.
    var theString = arguments[0];

    // start with the second argument (i = 1)
    for (var i = 1; i < arguments.length; i++) {
        // "gm" = RegEx options for Global search (more than one instance)
        // and for Multiline search
        var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
        theString = theString.replace(regEx, arguments[i]);
    }

    return theString;
}

function getRandomRotation() {
    return (Math.floor(Math.random() * 4)) * 90;
}

function getScreenType() {
    if ($(window).height() >= $(window).width()) {
        if ($(window).width() < 600) {
            return 'smallScreen'
        } else {
            return 'bigScreen'
        }
    } else {
        if ($(window).width() <= 820) {
            return 'smallScreen'
        } else {
            return 'bigScreen'
        }
    }
}

function rotateArray(piece, rotations) {
    // Recursive programming is my jammmmmmm
	if (rotations == 0) {
		return piece
	}
	var res = Array.apply(null, Array(piece[0].length)).map(function(){return Array(piece.length)});
    for (var x = 0; x < piece.length; x++) {
        for (var y = 0; y < piece[0].length; y++) {
            res[(res.length-1)-y][x] = piece[x][y];
        }
    }
    return rotateArray(res, rotations-1)
}

// Run
window.onload = init;