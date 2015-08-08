var sizes = {
    bigScreen: {
        chunk: 46,
        SChunk: 34.5,
        spacing: 2
    },
    smallScreen: {
        chunk: 23,
        SChunk: 17.25,
        spacing: 1
    },
    grid: [12, 12],
    shrinkScale: 0.75
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
            transform: translateY(-50%) rotate({2}deg);\
            -ms-transform: translateY(-50%) rotate({2}deg);\
            -webkit-transform: translateY(-50%) rotate({2}deg);\
            -moz-transform: translateY(-50%) rotate({2}deg);\
            -o-transform: translateY(-50%) rotate({2}deg);\
        }", slot, type, rotation);

    $("<style>")
        .prop("type", "text/css")
        .prop("id", "s" + slot + "_rotation")
        .html(rotatedPieceCSS)
        .appendTo("head");

    updateDragbox(slot);
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

    var pieceType = piece.attr("class").split(' ')[1];
    var newSize = (growShrink == 'shrink') ? sizes[getScreenType()].SChunk : sizes[getScreenType()].chunk;
    var spacing = sizes[getScreenType()].spacing;

    $(piece).css('width', newSize * Pieces[pieceType].size[0] + (Pieces[pieceType].size[0] - 1) * spacing)
    $(piece).css("height", newSize * Pieces[pieceType].size[1] + (Pieces[pieceType].size[1] - 1) * spacing)

    $(piece).find('.chunk').css('width', newSize);
    $(piece).find('.chunk').css("height", newSize);
}

function initCSS() {
    // First, check for existing CSS and delete it.
    // How else are you going to update it?
    if ($("#chunkS_CSS").length > 0) {
        $("#chunkS_CSS").remove()
        for (var piece in Pieces) {
            $("#" + piece + "_CSS").remove()
        }
    }

    // Piece CSS
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
        var rotation = (currentPieces[slot] == 90 || currentPieces[slot] == 270) ? 1 : 0;

        var pieceWidth = (sizes[getScreenType()].chunk * Pieces[pieceType].size[rotation]);
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
    
    changePieceSize($("#s" + slot + " .drag-container").find('.piece'), 'shrink')
}

function initDragboxes() {
    $(".drag-container").each(function () {
        $(this).draggable({
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
    initGridHtml()
    initPieceHtml();
    initCSS();
    
    initDragboxes();
    
    initGrid(sizes.grid);

    Roll();

    $(window).resize(function () {
        updateDragbox(1)
        updateDragbox(2)
        updateDragbox(3)
        $(".drag-container").each(function () {
            changePieceSize($(this).find('.piece'), 'shrink')
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

// Run
window.onload = init;