// GLOBAL VARS
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
        spacing: 2
    },
    grid: [12, 12],
    BScale: 1,
    SScale: 0.75
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

// INIT FUNCTIONS
function initDynamicSizes() {
    sizes.bigScreen.SChunk = sizes.SScale * sizes.bigScreen.chunk
    sizes.smallScreen.SChunk = sizes.SScale * sizes.smallScreen.chunk
    sizes.bigScreen.BChunk = sizes.BScale * sizes.bigScreen.chunk
    sizes.smallScreen.BChunk = sizes.BScale * sizes.smallScreen.chunk
}

function initGridHtml() {
    // Just for readability
    var htmlRow = "<div class='grid-row'>";
    var htmlChunk = "<div class='chunk'></div>";

    for (var row = 0; row < sizes.grid[1]; row++) {
        $('.grid-container')
            .append(htmlRow)
        for (var chunk = 0; chunk < sizes.grid[0]; chunk++) {
            $('.grid-container .grid-row:last-child')
                .append(htmlChunk)
        }
    }
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

function initGrid(size) {
    // Generates 2d array of variable size filled with 0's.
    // Thank you based Stackoverflow Wizards
    grid = Array.apply(null, Array(size[1]))
        .map(function () {
            return Array.apply(null, Array(size[0])).map(function () {
                return 0
            });
        });
}

function initDragboxes() {
    $(".drag-container").each(function () {
        $(this).draggable({
            start: pickUpPiece,
            revert: dropPiece,
            revertDuration: 250,
            scroll: false
        });
        var currSlot = $(this).parent().attr('id').match(/\d+/)[0]
        updateDragbox(currSlot)
    });
}

// PIECE MANIPULATION FUNCTIONS
function spawnPiece(type, slot, rotation) {
    var layout = rotateArray(Pieces[type].layout, rotation / 90);
    currentPieces[slot] = {
        type: type,
        color: Pieces[type].color,
        layout: layout
    }

    // Generate Piece HTML on the fly
    var htmlRow = "<div class='chunk-row'></div>";
    var htmlChunk = "<div class='chunk'></div>";
    var htmlPlaceholder = "<div class='chunk placeholder'></div>";
    var container = '#s' + slot + ' .drag-container'

    $(container).append(String.format("<div class='piece {0}'></div>", type))
    for (var row = 0; row < layout.length; row++) {
        $(container + " ." + type).append(htmlRow)
        for (var chunk = 0; chunk < layout[row].length; chunk++) {
            if (layout[row][chunk] == 0) {
                $(container + " ." + type + " .chunk-row:last-child").append(htmlPlaceholder)
            } else {
                $(container + " ." + type + " .chunk-row:last-child").append(htmlChunk)
            }
        }
    }

    $(container).find('.chunk').each(function () {
        $(this).fadeOut(0).fadeIn('slow', function () {
            if (typeof(callback) == 'function') callback()
        })
    })

    // Fix cursor positioning and size issues
    updateDragbox(slot);
}

function removePiece(slot) {
    $('#s' + slot + " .drag-container")
        .empty()
        .css('top', 0)
        .css('left', 0);
    currentPieces[slot] = 'EMPTY'
}

function changePieceSize(slot, growShrink) {
    // Error handling
    if (currentPieces[slot] == 'EMPTY') {
        return false
    }

    var pieceSelector = "#s" + slot + " .piece";
    var newSize = (growShrink == 'shrink') ? sizes[getScreenType()].SChunk : sizes[getScreenType()].BChunk;
    var spacing = sizes[getScreenType()].spacing;

    $(pieceSelector)
        .css('width', newSize * currentPieces[slot].layout[0].length + (currentPieces[slot].layout[0].length - 1) * spacing)
        .css("height", newSize * currentPieces[slot].layout.length + (currentPieces[slot].layout.length - 1) * spacing)

    $(pieceSelector).find('.chunk')
        .css('width', newSize)
        .css("height", newSize);
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

        var bottomOffset = (getScreenType() == 'smallScreen') ? -sizes[getScreenType()].chunk * 2 : 0;

        if (containerPieceWDiff > 0) {
            centerCursor = {
                left: ($(".drag-container").width() + containerPieceWDiff) / 2,
                bottom: bottomOffset
            }
        } else {
            centerCursor = {
                left: $(".drag-container").width() / 2,
                bottom: bottomOffset
            }
        }
    }

    $("#s" + slot + " .drag-container").draggable("option", "cursorAt", centerCursor);

    changePieceSize(slot, 'shrink')
}

// GAME MECHANICS
function Roll() {
    removePiece(1)
    removePiece(2)
    removePiece(3)
    spawnPiece(pickRandomProperty(Pieces), 1, getRandomRotation())
    spawnPiece(pickRandomProperty(Pieces), 2, getRandomRotation())
    spawnPiece(pickRandomProperty(Pieces), 3, getRandomRotation())
}

function checkValidDrop(drag_container) {
    var slot = $(drag_container).parent().attr('id').match(/\d+/)[0];

    var topLeftPieceChunk = $(drag_container).find(".chunk").first()
    var topLeftGridChunk = $('.grid-container .grid-row:first .chunk:first')
    
    getOffset(topLeftPieceChunk, topLeftGridChunk)
    
    return true;
}

function getOffset (elem1, elem2) {
    var dx = elem1.offset().left - elem2.offset().left;
    var dy = elem1.offset().top - elem2.offset().top;
    var offset = {
        top:dx,
        left:dy
    };
    return offset
}

// USER INTERACTION
function pickUpPiece() {
    // 'this' is actually $(".drag-container")
    // Why? Good question. JavaScript, amirite?

    var slot = $(this).parent().attr('id').match(/\d+/)[0]
    changePieceSize(slot, 'grow')
}

function dropPiece() {
    // 'this' is actually $(".drag-container")
    // Why? Good question. JavaScript, amirite?

    var slot = $(this).parent().attr('id').match(/\d+/)[0]
    if (currentPieces[slot] == 'EMPTY') return true
    
    if (checkValidDrop(this)) {
        // update the grid visually and object
        // WRITE DIS FUNCTION
        
        // Move the piece to it's final position
        
        // offset is supposed to bring the peiece to the right place
        
        var offset = {top: 0, left:0}
        
        $(this).animate(offset, 125, function () {
            // delete the piece
            removePiece(slot)
            
            // check if player has lost
            // WRITE DIS FUNCTION

            // Check if a re-roll is needed
            // Don't judge me. A loop is overkill IMHO
            if (currentPieces[1] == 'EMPTY' && currentPieces[2] == 'EMPTY' && currentPieces[3] == 'EMPTY') {
                Roll()
            }
        })
    } else {
        // Shrink them back
        changePieceSize(slot, 'shrink')
    }

    // Revert handles bringing the drag-container back to it's original position
    return true;
}

// FIRSTRUN MAIN FUNCTION
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
    // Run
window.onload = init;

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
    var res = Array.apply(null, Array(piece[0].length)).map(function () {
        return Array(piece.length)
    });
    for (var x = 0; x < piece.length; x++) {
        for (var y = 0; y < piece[0].length; y++) {
            res[(res.length - 1) - y][x] = piece[x][y];
        }
    }
    return rotateArray(res, rotations - 1)
}