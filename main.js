var sizes = {
    grid:[12,12],
    chunk: 46,
    chunkS: 32.5,
    spacing: 2,
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
        $(container).append(String.format("<div class='piece {0}'></div>",piece))
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

function updatePieceCSS() {
    if ($("#chunkS_CSS").length > 0) {
        for (var piece in Pieces) {
            $("#"+piece+"_CSS").remove()
        }
    }
    var genericChunkCSS = String.format("\
        .piece .chunk {\
            width: {0};\
            height: {0};\
        }", sizes.chunkS);
    
    $("<style>")
    .prop("type", "text/css")
    .prop("id", "chunkS_CSS")
    .html(genericChunkCSS)
    .appendTo("head");
    
    for (var piece in Pieces) {
        var w = Pieces[piece].size[0]*sizes.chunkS + (Pieces[piece].size[0]-1)*2;
        var h = Pieces[piece].size[1]*sizes.chunkS + (Pieces[piece].size[1]-1)*2;
        var color = Pieces[piece].color;
        
        var pieceCSS = String.format("\
            .{0} {\
                width: {1};\
                height: {2};\
            }\
            .{0} .chunk {\
                background: {3};\
            }", piece, w, h, color);
        
        $("<style>")
        .prop("type", "text/css")
        .prop("id", piece+"_CSS")
        .html(pieceCSS)
        .appendTo("head");
    };
    
    $('.drag-container').each(function () {
        changePieceSize($(this).find('.piece'), 'shrink')
    });
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
    console.log(type, slot, rotation)
    $('#invisible-template-container .' + type).clone().appendTo('#s' + slot + ' .drag-container')
    currentPieces[slot]={
        type:type,
        rotation:rotation
    }
    var rotatedPieceCSS = String.format("\
        #s{0} .{1} {\
            transform: translateY(-50%) rotate({2}deg)\
        }", slot, type, rotation);
    
    $("<style>")
    .prop("type", "text/css")
    .prop("id", "s"+slot+"_rotation")
    .html(rotatedPieceCSS)
    .appendTo("head");
}

function removePiece(slot) {
    $('#s'+slot+" .drag-container").empty();
    $("#s"+slot+"_rotation").remove();
    currentPieces[slot]='EMPTY'
}

function changePieceSize(piece, growShrink) {
    if ( piece.attr("class") == undefined ) { return false }
    
    var pieceType = piece.attr("class").split(' ')[1];
    var newSize = (growShrink == 'shrink') ? sizes.chunkS : sizes.chunk;


    $(piece).css('width',newSize * Pieces[pieceType].size[0] + (Pieces[pieceType].size[0] - 1) * 2)
    $(piece).css("height",newSize * Pieces[pieceType].size[1] + (Pieces[pieceType].size[1] - 1) * 2)

    $(piece).find('.chunk').css('width',newSize);
    $(piece).find('.chunk').css("height",newSize);
}

var currentPieces = {
    1:{
        type:'x',
        rotation:90
    },
    2:{
        type:'y',
        rotation:90
    },
    3:{
        type:'z',
        rotation:90
    }
}

function init() {
    initGrid()
    initPieceHtml();
    updatePieceCSS();
    
    spawnPiece(pickRandomProperty(Pieces), 1, getRandomRotation())
    spawnPiece(pickRandomProperty(Pieces), 2, getRandomRotation())
    spawnPiece(pickRandomProperty(Pieces), 3, getRandomRotation())


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

// Utilities
function pickRandomProperty(obj) {
    var result;
    var count = 0;
    for (var prop in obj)
        if (Math.random() < 1 / ++count)
            result = prop;
    return result;
}

String.format = function() {
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
  return (Math.floor(Math.random() * 4))*90;
}

// Run
window.onload = init;