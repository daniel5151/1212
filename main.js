var size = {
    chunk: 46,
    chunkS: 32.5,
    shape: {
        ln2:[2,1],
        ln3:[3,1],
        ln4:[4,1],
        ln5:[5,1],
        sBlock:[1,1],
        mBlock:[2,2],
        lBlock:[3,3],
        smallL:[2,2],
        bigL:[3,3]
    }
}

function changePieceSize(piece, growShrink) {
    var shapeType = $(piece).attr("class").split(' ')[1];
    var newSize = (growShrink=='shrink') ? size.chunkS : size.chunk;
    
    
    $(piece).width(newSize*size.shape[shapeType][0]+(size.shape[shapeType][0]-1)*2)
    $(piece).height(newSize*size.shape[shapeType][1]+(size.shape[shapeType][1]-1)*2)

    $(piece).find('.chunk').height(newSize);
    $(piece).find('.chunk').width(newSize);
}

window.onload = function () {
    $('.ln2').clone().appendTo('#s1')
    $('.sBlock').clone().appendTo('#s2')
    $('.bigL').clone().appendTo('#s3')
    
    $(".piece").draggable({
        start: function() {
            changePieceSize(this, 'grow')
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
                changePieceSize(this, 'shrink')
                
                // Return the piece to starting position
                $(this).data("uiDraggable").originalPosition = {
                    top : '50%',
                    left : 0
                };
                
                return true;
            }
        }
    });
}