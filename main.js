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
    SScale: 0.75,
    chunk:function () {
        return sizes[getScreenType()].chunk
    },
    spacing:function () {
        return sizes[getScreenType()].spacing
    }
}
var Pieces = {
    ln2: {
        size: [2, 1],
        layout: [
            [1, 1]
        ],
        color: '#009688'
    },
    ln3: {
        size: [3, 1],
        layout: [
            [1, 1, 1]
        ],
        color: '#35A79C'
    },
    ln4: {
        size: [4, 1],
        layout: [
            [1, 1, 1, 1]
        ],
        color: '#65C3BA'
    },
    ln5: {
        size: [5, 1],
        layout: [
            [1, 1, 1, 1, 1]
        ],
        color: 'rgb(45, 145, 219)'
    },
    sBlock: {
        size: [1, 1],
        layout: [
            [1]
        ],
        color: '#03396C'
    },
    mBlock: {
        size: [2, 2],
        layout: [
            [1, 1],
            [1, 1]
        ],
        color: '#EB8C00'
    },
    lBlock: {
        size: [3, 3],
        layout: [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1]
        ],
        color: '#c71818'
    },
    smallL: {
        size: [2, 2],
        layout: [
            [1, 0],
            [1, 1]
        ],
        color: '#49b52f'
    },
    bigL: {
        size: [3, 3],
        layout: [
            [1, 0, 0],
            [1, 0, 0],
            [1, 1, 1]
        ],
        color: '#0078FF'
    },
};
var currentPieces = {
    1: 'EMPTY',
    2: 'EMPTY',
    3: 'EMPTY'
};
var grid=[];

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

function initGrid(size, random) {
    // Empty array of 0's
    for (var xs = 0; xs < size[0]; xs++) {
        grid[xs] = Array.apply(null, new Array(size[1])).map(Number.prototype.valueOf, 0);
    }
    
    // Randomize it maybe?
    if (random) {
        for (var y = 0; y < grid.length; y++) {
            for (var x = 0; x < grid[y].length; x++) {
                grid[y][x] = getRandomInt(0, 1)
            }
        }
    }
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
        layout: layout,
        size: [layout[0].length, layout.length]
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
    var spacing = sizes.spacing();

    $(pieceSelector)
        .css('width', newSize * currentPieces[slot].size[0] + (currentPieces[slot].size[0]) * spacing)
        .css("height", newSize * currentPieces[slot].size[1] + (currentPieces[slot].size[1]) * spacing)

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

        var pieceWidth = (sizes.chunk() * Pieces[pieceType].size[0]);
        var containerPieceWDiff = pieceWidth - $(".drag-container").width()

        var bottomOffset = (getScreenType() == 'smallScreen') ? -sizes.chunk() * 2 : 0;

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

function getLocalizedGrid(cords, size) {
    var localGrid = [];
    for (var y = cords.y; y < cords.y+size[1]; y++) {
        var t = []
        for (var x = cords.x; x < cords.x+size[0]; x++) {
            if (x >= sizes.grid[0] || x < 0 || y >= sizes.grid[1] || y < 0) {
                t.push(1)
            } else {
                t.push(grid[y][x])
            }
        }
        localGrid.push(t)
    }
    return localGrid;
}

function returnValidPieceInfo(drag_container) {
    var slot = $(drag_container).parent().attr('id').match(/\d+/)[0];
    var layout = currentPieces[slot].layout
    
    // We want to determine where in the grid the user wanted to place his piece
    // We do this by a relatively simple process of converting the offsets
    // between the top-left chunk in the piece and the top left chunk on the grid
    // (the 0,0 chunk)
    var topLeftPieceChunk = $(drag_container).find(".chunk").first();
    var topLeftGridChunk = getChunkFromCords({x:0,y:0});
    var offset = getOffset(topLeftPieceChunk, topLeftGridChunk);
    var cords = {
        x: Math.round(offset.left / (sizes.chunk()+sizes.spacing())),
        y: Math.round(offset.top / (sizes.chunk()+sizes.spacing()))
    };
    
    // localGrid is a grid localized to the are a piece wished to occupy
    var localGrid = getLocalizedGrid(cords, currentPieces[slot].size)
    
    // This loop checks to see if the local grid can support the piece being placed
    var valid = true;
    for (var y = 0; y < localGrid.length; y++) {
        for (var x = 0; x < localGrid[y].length; x++) {
            if (localGrid[y][x] == 1 && layout[y][x] == 1) valid = false;
        }
    }
    
    if (valid) {
        // return the chunk to which the piece should gravitate
        return {cords:cords, piece:getChunkFromCords(cords)};
    } else {
        return false;
    }
}

function getChunkFromCords(cords) {
    var x = cords.x+1
    var y = cords.y+1
    return $(String.format('.grid-container .grid-row:nth-of-type({1}) .chunk:nth-of-type({0})',cords.x+1,cords.y+1));
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
    
    var valid = returnValidPieceInfo(this)
    
    if (valid!==false) {
        // update the grid visually and object
        // WRITE DIS FUNCTION
        
        // Move the piece to it's final position
        
        // first, we convert relatively positioned container to absolutely 
        // positioned container to make it infinitely easier to position 
        // relative to the grid
        var newCss = {
            position: 'absolute',
            width: $(this).width(),
            height: $(this).height(),
            top: $(this).offset().top,
            left: $(this).offset().left
        }
        $(this).css(newCss);
        
        // We want the draggable container to go to a absolute position so that
        // the piece inside aligns with the grid where it's being placed
        
        // our base position is the coordinates of the chunk on the grid
        var position = valid.piece.offset()
        
        // we need to offset these coordinates by factoring in the fact that
        // the chunk is contained within a piece...
        var containerOffset = getOffset(
            $(this).find(".chunk").first(),
            $(this)
        )
        
        position.top-=containerOffset.top
        position.left-=containerOffset.left
        
        $(this).animate(position, 125, function () {
            // revert to relative CSS
            $(this).css({
                width:"100%",
                height:"100%",
                position:"relative"
            });
            
            // Paint and update the grid where the piece is to be placed
            for (var y = valid.cords.y; y < valid.cords.y+currentPieces[slot].size[1]; y++) {
                for (var x = valid.cords.x; x < valid.cords.x+currentPieces[slot].size[0]; x++) {
                    if (x >= sizes.grid[0] || x < 0 || y >= sizes.grid[1] || y < 0) {
                        // do nothing
                    } else {
                        if (currentPieces[slot].layout[y-valid.cords.y][x-valid.cords.x] == 1) {
                            getChunkFromCords({x:x,y:y}).css('background',currentPieces[slot].color)
                        }
                        grid[y][x] = currentPieces[slot].layout[y-valid.cords.y][x-valid.cords.x]
                    }
                }
            }
            
            // delete the piece
            removePiece(slot)
            
            // check to update lines
                // WRITE DIS FUNCTION ---------------------------------
                // WRITE DIS FUNCTION ---------------------------------
                // WRITE DIS FUNCTION ---------------------------------
                // WRITE DIS FUNCTION ---------------------------------
            
            // check if player has lost
                // WRITE DIS FUNCTION ---------------------------------
                // WRITE DIS FUNCTION ---------------------------------
                // WRITE DIS FUNCTION ---------------------------------
                // WRITE DIS FUNCTION ---------------------------------

            // Check if a re-roll is needed...
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

// Specialized Utilities
function getOffset (elem1, elem2) {
    // absolute offset between two elements
    var dx = elem1.offset().left - elem2.offset().left;
    var dy = elem1.offset().top - elem2.offset().top;
    var offset = {
        top:dy,
        left:dx
    };
    return offset
}

// General Utilities
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

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getScreenType() {
    if ($(window).height() >= $(window).width()) {
        if ($(window).width() <= 600) {
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