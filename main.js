var sizes = {
    bigScreen:{
        chunk:46,
        spacing:2
    },
    smallScreen:{
        chunk:23,
        spacing:1
    },
    grid: [12, 12],
    shrinkScale: 0.75
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
        $(container).append(String.format("<div class='piece {0}'></div>", piece))
        for (var row = 0; row < Pieces[piece].layout.length; row++) {
            $(String.format("{0} .{1}", container, piece)).append(htmlRow)
            for (var chunk = 0; chunk < Pieces[piece].layout[row].length; chunk++) {
                if (Pieces[piece].layout[row][chunk] == 0) {
                    $(String.format("{0} .{1} .chunk-row:last-child", container, piece)).append(htmlPlaceholder)
                } else {
                    $(String.format("{0} .{1} .chunk-row:last-child", container, piece)).append(htmlChunk)
                }
            }
        }
    }
}

function spawnPiece(type, slot, rotation) {
    console.log(type, slot, rotation)
    $('#invisible-template-container .' + type).clone().appendTo('#s' + slot + ' .drag-container')
    currentPieces[slot] = {
        type: type,
        rotation: rotation
    }
    var rotatedPieceCSS = String.format("\
        #s{0} .{1} {\
            transform: translateY(-50%) rotate({2}deg)\
        }", slot, type, rotation);

    $("<style>")
        .prop("type", "text/css")
        .prop("id", "s" + slot + "_rotation")
        .html(rotatedPieceCSS)
        .appendTo("head");
}
function removePiece(slot) {
    $('#s' + slot + " .drag-container").empty();
    $("#s" + slot + "_rotation").remove();
    currentPieces[slot] = 'EMPTY'
}
function changePieceSize(piece, growShrink) {
    // Error handling
    if (piece.attr("class") == undefined) {
        return false
    }
    var bigScreenSChunk =  sizes.bigScreen.chunk * sizes.shrinkScale;
    var smallScreenSChunk = sizes.smallScreen.chunk * sizes.shrinkScale;
    
    var pieceType = piece.attr("class").split(' ')[1];
    
    if ($(window).width() < 600) {
        var newSize = (growShrink == 'shrink') ? smallScreenSChunk : sizes.smallScreen.chunk;
        var spacing = sizes.smallScreen.spacing;
    } else {
        var newSize = (growShrink == 'shrink') ? bigScreenSChunk : sizes.bigScreen.chunk;
        var spacing = sizes.bigScreen.spacing;
    }


    $(piece).css('width', newSize * Pieces[pieceType].size[0] + (Pieces[pieceType].size[0] - 1) * spacing)
    $(piece).css("height", newSize * Pieces[pieceType].size[1] + (Pieces[pieceType].size[1] - 1) * spacing)

    $(piece).find('.chunk').css('width', newSize);
    $(piece).find('.chunk').css("height", newSize);
}

function updateCSS() {
    // First, check for existing CSS and delete it.
    // How else are you going to update it?
    if ($("#chunkS_CSS").length > 0) {
        $("#chunkS_CSS").remove()
        for (var piece in Pieces) {
            $("#" + piece + "_CSS").remove()
        }
    }

    // Generic piece chunk CSS
    var bigScreenSChunk =  sizes.bigScreen.chunk * sizes.shrinkScale;
    var smallScreenSChunk = sizes.smallScreen.chunk * sizes.shrinkScale;
    
    var genericPieceChunkCSS = String.format("\
        .piece .chunk {\
            width: {0};\
            height: {0};\
        }\
        @media screen and (max-width: 600px) {\
            .piece .chunk {\
                width: {1};\
                height: {1};\
            }\
        }", bigScreenSChunk, smallScreenSChunk);

    $("<style>")
        .prop("type", "text/css")
        .prop("id", "chunkS_CSS")
        .html(genericPieceChunkCSS)
        .appendTo("head");

    // Piece CSS
    for (var piece in Pieces) {
        var BigW = Pieces[piece].size[0] * bigScreenSChunk + (Pieces[piece].size[0] - 1) * sizes.bigScreen.spacing;
        var BigH = Pieces[piece].size[1] * bigScreenSChunk + (Pieces[piece].size[1] - 1) * sizes.bigScreen.spacing;
        var SmallW = Pieces[piece].size[0] * smallScreenSChunk + (Pieces[piece].size[0] - 1) * sizes.smallScreen.spacing;
        var SmallH = Pieces[piece].size[1] * smallScreenSChunk + (Pieces[piece].size[1] - 1) * sizes.smallScreen.spacing;
        var color = Pieces[piece].color;

        var pieceCSS = String.format("\
            .{0} {\
                width: {2};\
                height: {3};\
            }\
            .{0} .chunk {\
                background: {1};\
            }\
            @media screen and (max-width: 600px) {\
                .{0} {\
                    width: {4};\
                    height: {5};\
                }\
            }", piece, color, BigW, BigH, SmallW, SmallH);

        $("<style>")
            .prop("type", "text/css")
            .prop("id", piece + "_CSS")
            .html(pieceCSS)
            .appendTo("head");
    };

    // Update existing elements to the new CSS
    $('.drag-container').each(function () {
        changePieceSize($(this).find('.piece'), 'shrink')
    });
}

var currentPieces = {
    1: {
        type: 'x',
        rotation: 90
    },
    2: {
        type: 'y',
        rotation: 90
    },
    3: {
        type: 'z',
        rotation: 90
    }
}

function init() {
    initGrid()
    initPieceHtml();
    updateCSS();

    spawnPiece(pickRandomProperty(Pieces), 1, getRandomRotation())
    spawnPiece(pickRandomProperty(Pieces), 2, getRandomRotation())
    spawnPiece(pickRandomProperty(Pieces), 3, getRandomRotation())

    
    $(window).resize(function() {
        updateCSS();
    });
    
    var centerCursor = {
        left: $(".drag-container").width() / 2,
        bottom: 0
    }

    $(".drag-container").draggable({
        start: function () {
            changePieceSize($(this).find('.piece'), 'grow')
        },
        revert: function () {
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

// Run
window.onload = init;