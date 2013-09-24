sw.index = {};
sw.index.current = {};

sw.onload.push(function(){

    //when you're the one who set the index, move reguardless of if follow the leader is set
    sw.socket.on("yourIndex", function(data){
        if(data.data[0]){
            var index = data.data[0].currentListId;
            if(sw.index.current && sw.index.current[data.page] ){
                sw.index.current[data.page] = index;
                
                sw.post.display(data.page);
                if(sw.post.items[data.page][ index - 1 ] && sw.post.items[data.page][ index - 1 ].url){
                    sw.preview.display( sw.post.items[data.page][ index - 1 ].url, data.page );
                }
            }
        }
    });

    sw.socket.on('index', function (data) {
        //console.log(data);
    
        //if we're following the leader, preview the new node
        if(data.data[0]){
            if(document.querySelector("#followTheLeader").checked) { 
                var index = data.data[0].currentListId;
                if(sw.index.current && sw.index.current[data.page] ){
                    sw.index.current[data.page] = index;
                    
                    sw.post.display(data.page);
                    if(sw.post.items[data.page][ index - 1 ] && sw.post.items[data.page][ index - 1 ].url){
                        sw.preview.display( sw.post.items[data.page][ index - 1 ].url, data.page );
                    }
                }
            }
        }
        
    });

    sw.socket.on("moveItem", function(data){
        sw.index.moveItem(data.page, data.from, data.to);
        sw.post.display(data.page);
    });
});


//most be told what page to move index on
//sends the current item to the server
sw.index.send = function(current, page){
    //debugger;
    sw.socket.emit('index', {index: current, page: page} );
}



sw.index.moveItem = function(page, from, to){



    if((from - 1) >= 0 && sw.post.items[page]){

        var oldUrl = sw.post.items[page][ sw.index.current[page]-1 ].url;

        var toMoveId = sw.post.items[page][from - 1].id;
        
        var rising = from > to;
        for(var i = 0; i < sw.post.items[page].length; i++){
            if(rising) {
                if(sw.post.items[page][i].listIndex < from && sw.post.items[page][i].listIndex >= to) {
                    sw.post.items[page][i].listIndex += 1;
                }
                
            } else {
                if(sw.post.items[page][i].listIndex > from && sw.post.items[page][i].listIndex <= to) {
                    sw.post.items[page][i].listIndex -= 1;
                }
            }
        }
        for(var i = 0; i < sw.post.items[page].length; i++) {
            if(sw.post.items[page][i].id == toMoveId) {
                sw.post.items[page][i].listIndex = to;
                break;
            }
        }
        
        sw.post.items[page].sort(function (a, b) {
            return a.listIndex - b.listIndex;
        });
        
        if(document.querySelector("#followTheLeader").checked){
            sw.index.selectItemByIndex(to, page);
        } else {
            for(var i = 0; i < sw.post.items[page].length; i++){    //find the item you used to be on and select that
                if(sw.post.items[page][i].url == oldUrl){
                    sw.index.selectItemByIndex(sw.post.items[page][i].listIndex, page);
                    break;
                }
            }
        }
    }
}

//called when a message image is clicked
sw.index.itemClicked = function(node){

    var index = (function(node) {
        var n = 0;
        while (node = node.nextSibling){
            n++;
        }
        return n+1;
    })(node);
    sw.index.selectItemByIndex(index, sw.helpers.getListOfNode(node));
    
}

sw.index.selectItemByIndex = function(index, page) {
    sw.index.send( index, page );
    
    //preview etc the new node
    sw.index.current[page] = index;
    
    sw.post.display(page);  //it MAY be possable to remove this
    if(sw.post.items[index] && sw.post.items[index].url){
        sw.preview.display( sw.post.items[index].url, page );
    }
}