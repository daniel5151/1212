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
        spacing: 1
    },
    grid: [12, 12],
    BScale: 1,
    SScale: 0.6,
    chunk: function () {
        return sizes[getScreenType()].chunk
    },
    spacing: function () {
        return sizes[getScreenType()].spacing
    }
}
var Pieces = {
    ln2: {
        size: [2, 1],
        layout: [
            [1, 1]
        ],
        points: 2,
        color: '#009688'
    },
    ln3: {
        size: [3, 1],
        layout: [
            [1, 1, 1]
        ],
        points: 3,
        color: '#35A79C'
    },
    ln4: {
        size: [4, 1],
        layout: [
            [1, 1, 1, 1]
        ],
        points: 4,
        color: '#65C3BA'
    },
    ln5: {
        size: [5, 1],
        layout: [
            [1, 1, 1, 1, 1]
        ],
        points: 5,
        color: 'rgb(45, 145, 219)'
    },
    ln6: {
        size: [6, 1],
        layout: [
            [1, 1, 1, 1, 1,1]
        ],
        points: 6,
        color: 'rgb(45, 52, 219)'
    },
    sBlock: {
        size: [1, 1],
        layout: [
            [1]
        ],
        points: 1,
        color: '#03396C'
    },
    mBlock: {
        size: [2, 2],
        layout: [
            [1, 1],
            [1, 1]
        ],
        points: 4,
        color: '#EB8C00'
    },
    lBlock: {
        size: [3, 3],
        layout: [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1]
        ],
        points: 9,
        color: '#c71818'
    },
    smallL: {
        size: [2, 2],
        layout: [
            [1, 0],
            [1, 1]
        ],
        points: 3,
        color: '#49b52f'
    },
    bigL: {
        size: [3, 3],
        layout: [
            [1, 0, 0],
            [1, 0, 0],
            [1, 1, 1]
        ],
        points: 5,
        color: '#0078FF'
    },
    plus: {
        size: [3, 3],
        layout: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 1, 0]
        ],
        points: 5,
        color: '#9300ff'
    },
};
var isGameOver = false;
var score = 0;
var topScore = 0;
var topScoreNotificationFired = false;
var currentPieces = {
    1: 'EMPTY',
    2: 'EMPTY',
    3: 'EMPTY'
};
var grid = [];

// INIT FUNCTIONS
function initDynamicSizes() {
    sizes.bigScreen.SChunk = sizes.SScale * sizes.bigScreen.chunk
    sizes.smallScreen.SChunk = sizes.SScale * sizes.smallScreen.chunk
    sizes.bigScreen.BChunk = sizes.BScale * sizes.bigScreen.chunk
    sizes.smallScreen.BChunk = sizes.BScale * sizes.smallScreen.chunk
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
    
    // Anti CSS
    var numPieces = countProperties(Pieces);
    var keyPercent = 0;
    var keyPercentIterator = Math.ceil(100 / numPieces)
    var keyframes = [];
    for (var piece in Pieces) {
        keyframes.push(keyPercent+"% {background: "+Pieces[piece].color+";}")
        keyPercent += keyPercentIterator;
    }
    
    
    var keyframesCSS = keyframes.join("\n")
        
    var antiCSS = String.format("\
        @keyframes anti {\n{0}}\
        @-webkit-keyframes anti {\n{0}}\
        @-moz-keyframes anti {\n{0}}\
        @-o-keyframes anti {\n{0}}\
        ", keyframesCSS);

    $("<style>")
        .prop("type", "text/css")
        .prop("id", "anti_CSS")
        .html(antiCSS)
        .appendTo("head");
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
function spawnPiece(type, slot, rotation, anti) {
    var layout = rotateArray(Pieces[type].layout, rotation / 90);
    currentPieces[slot] = {
        type: type,
        points: Pieces[type].points,
        color: Pieces[type].color,
        layout: layout,
        size: [layout[0].length, layout.length],
        anti: anti
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

    if (anti) {
        $(container).find('.chunk').each(function () {
            if (!$(this).hasClass("placeholder")) $(this).addClass("anti-chunk")
        })
    }

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

    var piece = "#s" + slot + " .piece";
    var newSize = (growShrink == 'shrink') ? sizes[getScreenType()].SChunk : sizes[getScreenType()].BChunk;
    var spacing = sizes.spacing();

    $(piece).find('.chunk')
        .css('width', newSize)
        .css("height", newSize);
    
    $(piece)
        .css('width', newSize * currentPieces[slot].size[0] + (currentPieces[slot].size[0] - 1) * spacing)
        .css("height", newSize * currentPieces[slot].size[1] + (currentPieces[slot].size[1] - 1) * spacing)
}

function updateDragbox(slot) {
    if (currentPieces[slot] == 'EMPTY') {
        return false
    }
    
    // You'd think finding where to place a cursor would be easy right?
    // Guess again.
    
    // non touch displays should have cursor centered in piece
    var centerCursor = {
        bottom:$(".drag-container").height() / 2,
        left:$(".drag-container").width() / 2
    };
    
    // But we must still account for the fact that some pieces grow and exceed 
    // the boundaries of the drag-container. If we do not account for the extra
    // chunk sticking out, the centering will be off
    var pieceHeight = (sizes.chunk() * currentPieces[slot].layout.length);
    var pieceWidth = (sizes.chunk() * currentPieces[slot].layout[0].length);
    
    var containerPieceHDiff = pieceHeight - $(".drag-container").height()
    var containerPieceWDiff = pieceWidth - $(".drag-container").width()
    
    if (containerPieceHDiff > 0) centerCursor.top = ($(".drag-container").height() + containerPieceHDiff) / 2
    if (containerPieceWDiff > 0) centerCursor.left = ($(".drag-container").width() + containerPieceWDiff) / 2;
    
    // For mobile, we want to position the cursor in such a way that the player's finger does not
    // block the piece they are trying to position.
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        if ((getScreenOrientation() == "landscape") && (getScreenType() == "smallScreen")) {
            centerCursor.left = $(".drag-container").width() + sizes.chunk() * 2;
            if (containerPieceWDiff > 0) centerCursor.left += containerPieceWDiff;
        } else {
            centerCursor.bottom = (getScreenType() == 'smallScreen') ? -sizes.chunk() * 2 : 0;
            if (containerPieceHDiff > 0) centerCursor.bottom -= containerPieceHDiff;
        }
    }

    $("#s" + slot + " .drag-container").draggable("option", "cursorAt", centerCursor);

    changePieceSize(slot, 'shrink')
}

// GAME MECHANICS
function returnPieceIfValidDrop(drag_container) {
    var slot = $(drag_container).parent().attr('id').match(/\d+/)[0];
    var layout = currentPieces[slot].layout

    // We want to determine where in the grid the user wanted to place his piece
    // We do this by a relatively simple process of converting the offsets
    // between the top-left chunk in the piece and the top left chunk on the grid
    // (the 0,0 chunk)
    var topLeftPieceChunk = $(drag_container).find(".chunk").first();
    var topLeftGridChunk = getChunkFromCords({
        x: 0,
        y: 0
    });
    var offset = getOffset(topLeftPieceChunk, topLeftGridChunk);
    var cords = {
        x: Math.round(offset.left / (sizes.chunk() + sizes.spacing())),
        y: Math.round(offset.top / (sizes.chunk() + sizes.spacing()))
    };

    // localGrid is a grid localized to the are a piece wished to occupy
    var localGrid = getLocalizedGrid(cords, currentPieces[slot].size)

    // This loop checks to see if the local grid can support the piece being placed
    var valid = true;
    var antiChunkOnEmptySpace = 0;
    for (var y = 0; y < localGrid.length; y++) {
        for (var x = 0; x < localGrid[y].length; x++) {
            if (!currentPieces[slot].anti) {
                if (localGrid[y][x] !== 0 && layout[y][x] == 1) valid = false;
            } else {
                if (localGrid[y][x] == 2 && layout[y][x] == 1) valid = false;
                if (localGrid[y][x] == 0 && layout[y][x] == 1) antiChunkOnEmptySpace += 1
            }
        }
    }
    if (antiChunkOnEmptySpace == currentPieces[slot].points) valid = false;

    if (valid) {
        // return the chunk to which the piece should gravitate
        return {
            cords: cords,
            html: getChunkFromCords(cords)
        };
    } else {
        return false;
    }
}

function returnStartChunksForLnClear(cords, layout) {
    var sx = cords.x;
    var sy = cords.y;

    var cleared = {
        linesCleared: 0,
        row: {},
        col: {}
    };
    for (var y = 0; y < layout.length; y++) {
        for (var x = 0; x < layout[y].length; x++) {
            if (layout[y][x] == 1) {
                // check column
                var clearedCol = true;
                for (var col = 0; col < grid[0].length; col++) {
                    if (grid[col][sx + x] == 0) clearedCol = false;
                }
                if (clearedCol && (!cleared.col[sx + x])) {
                    cleared.col[sx + x] = {
                        x: sx + x,
                        y: sy + y
                    };
                    cleared.linesCleared += 1
                }

                // check row
                var clearedRow = true;
                for (var row = 0; row < grid.length; row++) {
                    if (grid[sy + y][row] == 0) clearedRow = false;
                }
                if (clearedRow && (!cleared.row[sy + y])) {
                    cleared.row[sy + y] = {
                        x: sx + x,
                        y: sy + y
                    }
                    cleared.linesCleared += 1
                }
            }
        }
    }

    if (jQuery.isEmptyObject(cleared.row) && jQuery.isEmptyObject(cleared.col)) {
        return false;
    } else {
        return cleared
    }
}

// HTML Update function -- MIGRATE EXISTING FUNCTIONS HERE
var updateHtml = {
    grid: function (colorMap) {
        for (var y = 0; y < grid.length; y++) {
            for (var x = 0; x < grid[y].length; x++) {
                var color;
                if (!colorMap) {
                    color = (grid[y][x] == 0) ? 'rgba(238, 228, 218, 0.35)' : 'black';
                } else {
                    color = (colorMap[y][x] == 0) ? 'rgba(238, 228, 218, 0.35)' : colorMap[y][x];
                }
                getChunkFromCords({
                    x: x,
                    y: y
                }).css('background', color)
            }
        }
    },
    score: function (dScore) {
        $(".score")
            .prop('number', score)
            .animateNumber({
                number: score + dScore
            }, 200);
    },
    topScore: function (dScore) {
        $(".top")
            .prop('number', topScore)
            .animateNumber({
                number: topScore + dScore
            }, 200);
        if (!topScoreNotificationFired && dScore!==0 && !isGameOver) {
            $(".high-score").removeClass("hidden")
            $(".drag-container").draggable('disable')
            topScoreNotificationFired = true;
        }
    },
    pieces: function () {
        for (var slot = 1; slot <= 3; slot++) {
            // remove existng piece html
            $('#s' + slot + " .drag-container")
                .empty()
                .css('top', 0)
                .css('left', 0);

            var piece = currentPieces[slot];
            if (piece == 'EMPTY') continue;

            // generate new html from info in currpieces
            var htmlRow = "<div class='chunk-row'></div>";
            var htmlChunk = "<div class='chunk'></div>";
            var htmlPlaceholder = "<div class='chunk placeholder'></div>";
            var container = '#s' + slot + ' .drag-container'

            $(container).append(String.format("<div class='piece {0}'></div>", piece.type))
            for (var row = 0; row < piece.layout.length; row++) {
                $(container + " ." + piece.type).append(htmlRow)
                for (var chunk = 0; chunk < piece.layout[row].length; chunk++) {
                    if (piece.layout[row][chunk] == 0) {
                        $(container + " ." + piece.type + " .chunk-row:last-child").append(htmlPlaceholder)
                    } else {
                        $(container + " ." + piece.type + " .chunk-row:last-child").append(htmlChunk)
                    }
                }
            }

            if (piece.anti) {
                $(container).find('.chunk').each(function () {
                    if (!$(this).hasClass("placeholder")) $(this).addClass("anti-chunk")
                })
            }

            updateDragbox(slot)
        }
    },
    clearChunk: function (chunk) {
        chunk.animate({backgroundColor: 'rgba(238, 228, 218, 0.35)'},250);
    },
    clearLines: function (cleared) {
        for (var r in cleared.row) {
            var row = cleared.row[r].y;
            for (var col = 0; col < grid[row].length; col++) {
                updateHtml.clearChunk(getChunkFromCords({
                    x: col,
                    y: row
                }))
            }
        }
        for (var c in cleared.col) {
            var col = cleared.col[c].x;
            for (var row = 0; row < grid[col].length; row++) {
                updateHtml.clearChunk(getChunkFromCords({
                    x: col,
                    y: row
                }))
            }
        }
    }
}

function checkGameOver() {
    var validMoves = 0;
    for (var slot = 1; slot <= 3; slot++) {
        if (currentPieces[slot] == 'EMPTY') {
            continue
        }
        for (var gy = 0; gy < grid.length; gy++) {
            for (var gx = 0; gx < grid[gy].length; gx++) {
                // localGrid is a grid localized to the are a piece wished to occupy
                var localGrid = getLocalizedGrid({
                    x: gx,
                    y: gy
                }, currentPieces[slot].size)
                var layout = currentPieces[slot].layout;

                // This loop checks to see if the local grid can support the piece being placed
                var valid = true;
                var antiChunkOnEmptySpace = 0;
                for (var y = 0; y < localGrid.length; y++) {
                    for (var x = 0; x < localGrid[y].length; x++) {
                        if (!currentPieces[slot].anti) {
                            if (localGrid[y][x] !== 0 && layout[y][x] == 1) valid = false;
                        } else {
                            if (localGrid[y][x] == 2 && layout[y][x] == 1) valid = false;
                            if (localGrid[y][x] == 0 && layout[y][x] == 1) antiChunkOnEmptySpace += 1;
                        }
                    }
                }
                if (antiChunkOnEmptySpace == currentPieces[slot].points) valid = false;
                if (valid) validMoves += 1;
            }
        }
    }
    if (validMoves > 0) return false
    else return true
}

function restart() {
    // Hide the gameover overlay
    $(".overlay").each(function () {
        $(this).addClass("hidden")
    })
    isGameOver = false;
    
    // re-enable dragging
    $(".drag-container").draggable('enable')
    
    // reset score
    score = 0
    updateHtml.score(-score)
    
    // reset the high score notification
    topScoreNotificationFired = false;

    // reinitialize blank grid
    initGrid(sizes.grid)

    // color existing grid blank
    updateHtml.grid()

    // Roll new pieces
    Roll()

    save()
}

function Roll() {
    removePiece(1)
    removePiece(2)
    removePiece(3)

    spawnPiece(pickRandomProperty(Pieces), 1, getRandomRotation(), randomBoolean(0.05))
    spawnPiece(pickRandomProperty(Pieces), 2, getRandomRotation(), randomBoolean(0.05))
    spawnPiece(pickRandomProperty(Pieces), 3, getRandomRotation(), randomBoolean(0.05))
}

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

    var piece = returnPieceIfValidDrop(this)

    if (piece !== false) {
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
        var position = piece.html.offset()

        // we need to offset these coordinates by factoring in the fact that
        // the chunk is contained within a piece...
        var containerOffset = getOffset(
            $(this).find(".chunk").first(),
            $(this)
        )

        position.top -= containerOffset.top
        position.left -= containerOffset.left

        $(this).animate(position, 125, function () {
            // revert to relative CSS
            $(this).css({
                width: "100%",
                height: "100%",
                position: "relative"
            });

            // Paint and update the grid where the piece is to be placed
            for (var y = piece.cords.y; y < piece.cords.y + currentPieces[slot].size[1]; y++) {
                for (var x = piece.cords.x; x < piece.cords.x + currentPieces[slot].size[0]; x++) {
                    if (currentPieces[slot].layout[y - piece.cords.y][x - piece.cords.x] == 1) {
                        if (!currentPieces[slot].anti) {
                            getChunkFromCords({
                                x: x,
                                y: y
                            }).css('background', currentPieces[slot].color)
                            grid[y][x] = 1
                        } else {
                            getChunkFromCords({
                                x: x,
                                y: y
                            }).css('background', "rgba(238, 228, 218, 0.35)")
                            grid[y][x] = 0
                        }
                    }
                }
            }

            // update score for piece placement
            updateHtml.score(currentPieces[slot].points)
            score += currentPieces[slot].points

            // check to update line graphics and add score from line clear
            var cleared = returnStartChunksForLnClear(piece.cords, currentPieces[slot].layout)
            if (cleared !== false) {
                // animate the line clear
                updateHtml.clearLines(cleared)
                    // update the board
                for (var r in cleared.row) {
                    var row = cleared.row[r].y;
                    for (var col = 0; col < grid[row].length; col++) {
                        grid[row][col] = 0;
                    }
                }
                for (var c in cleared.col) {
                    var col = cleared.col[c].x;
                    for (var row = 0; row < grid[col].length; row++) {
                        grid[row][col] = 0;
                    }
                }

                var clearScore = 12 * cleared.linesCleared + 12 * (cleared.linesCleared - 1);
                updateHtml.score(clearScore);
                score += clearScore;
            }

            // check if we need to update topScore
            if (score > topScore) {
                updateHtml.topScore(score - topScore);
                topScore = score;
            }

            // delete the piece
            removePiece(slot)

            // Check if a re-roll is needed...
            // Don't judge me. A loop is overkill IMHO
            if (currentPieces[1] == 'EMPTY' && currentPieces[2] == 'EMPTY' && currentPieces[3] == 'EMPTY') {
                Roll()
            }

            // check if player has lost
            var gameOver = checkGameOver();
            if (gameOver) {
                $(".game-over").removeClass("hidden")
                isGameOver = true;
            }

            save();
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

    if (!localStorage.getItem('score')) {
        Roll();
        topScoreNotificationFired = true;         // don't show a HS overlay if it's the user's first time playing
        save()
    } else {
        load()
    }

    $(".again").click(restart);
    $(".keep-playing").click(function () {
        $(".overlay").each(function () {
            $(this).addClass("hidden")
        })
        $(".drag-container").draggable('enable')
    });
    $(".pause").click(function () {
        $(".paused").removeClass("hidden");
        $(".drag-container").draggable('disable')
    });

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
function getOffset(elem1, elem2) {
    // absolute offset between two elements
    var dx = elem1.offset().left - elem2.offset().left;
    var dy = elem1.offset().top - elem2.offset().top;
    var offset = {
        top: dy,
        left: dx
    };
    return offset
}

function genColorMap() {
    var colorMap = []
    for (var y = 0; y < grid.length; y++) {
        var row = []
        for (var x = 0; x < grid[y].length; x++) {
            if (grid[y][x] == 1) {
                row.push(getChunkFromCords({
                    x: x,
                    y: y
                }).css('background'))
            } else {
                row.push(0)
            }
        }
        colorMap.push(row)
    }
    return colorMap;
}

function getChunkFromCords(cords) {
    var x = cords.x + 1
    var y = cords.y + 1
    return $(String.format('.grid-container .grid-row:nth-of-type({1}) .chunk:nth-of-type({0})', cords.x + 1, cords.y + 1));
}

function getLocalizedGrid(cords, size) {
    var localGrid = [];
    for (var y = cords.y; y < cords.y + size[1]; y++) {
        var t = []
        for (var x = cords.x; x < cords.x + size[0]; x++) {
            if (x >= sizes.grid[0] || x < 0 || y >= sizes.grid[1] || y < 0) {
                t.push(2)
            } else {
                t.push(grid[y][x])
            }
        }
        localGrid.push(t)
    }
    return localGrid;
}

// saving and loading
function save() {
    localStorage.setItem('grid', JSON.stringify(grid));
    localStorage.setItem('grid-colormap', JSON.stringify(genColorMap()));
    localStorage.setItem('currentPieces', JSON.stringify(currentPieces));
    localStorage.setItem('score', JSON.stringify(score));
    localStorage.setItem('topScore', JSON.stringify(topScore));
    localStorage.setItem('isGameOver', JSON.stringify(isGameOver));
    localStorage.setItem('topScoreNotificationFired', JSON.stringify(topScoreNotificationFired));
}

function load() {
    grid = JSON.parse(localStorage.getItem('grid'))

    var colorMap = JSON.parse(localStorage.getItem('grid-colormap'))
    updateHtml.grid(colorMap)

    currentPieces = JSON.parse(localStorage.getItem('currentPieces'))
    updateHtml.pieces();

    score = JSON.parse(localStorage.getItem('score'));
    updateHtml.score(0);

    topScore = JSON.parse(localStorage.getItem('topScore'));
    updateHtml.topScore(0);

    isGameOver = JSON.parse(localStorage.getItem('isGameOver'))
    if (isGameOver) $(".game-over").removeClass("hidden")
    
    topScoreNotificationFired = JSON.parse(localStorage.getItem("topScoreNotificationFired"))
}

// General Utilities
function countProperties(obj) {
    var count = 0;

    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            ++count;
    }

    return count;
}

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

function randomBoolean(percent_odds) {
    var boolean = (Math.random() < percent_odds) ? true : false
    return boolean
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getScreenType() {
    var viewportHeight;
    var viewportWidth;
    if (document.compatMode === 'BackCompat') {
        viewportHeight = document.body.clientHeight;
        viewportWidth = document.body.clientWidth;
    } else {
        viewportHeight = document.documentElement.clientHeight;
        viewportWidth = document.documentElement.clientWidth;
    }

    
    if (viewportHeight >= viewportWidth) {
        if (viewportWidth <= 600) {
            return 'smallScreen'
        } else {
            return 'bigScreen'
        }
    } else {
        if (viewportWidth <= 820) {
            return 'smallScreen'
        } else {
            return 'bigScreen'
        }
    }
}

function getScreenOrientation() {
    var viewportHeight;
    var viewportWidth;
    if (document.compatMode === 'BackCompat') {
        viewportHeight = document.body.clientHeight;
        viewportWidth = document.body.clientWidth;
    } else {
        viewportHeight = document.documentElement.clientHeight;
        viewportWidth = document.documentElement.clientWidth;
    }
    
    if (viewportHeight > viewportWidth) {
        return "portrait"
    } else {
        return "landscape"
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
