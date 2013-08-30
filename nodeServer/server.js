var io      = require('socket.io').listen(10303, { log: false })                //require socketio and start it listening
var fs      = require('fs');
var jsdom   = require('jsdom');
var jquery  = fs.readFileSync("./jquery.js", "utf-8");
var url     = require('url');

var config  = JSON.parse(fs.readFileSync('../config.json'));
var sqlite3 = new require('sqlite3').verbose();
var db      = new sqlite3.Database('../' + config.databaseFile);


io.sockets.on('connection', function (socket) {                 //when somebody connects...
    
    
    socket.on('page', function(data) {                          //Client tells you it's current list name
        emitItems(socket, data.list, 0);                        //Send it it's items
        emitIndex(socket, data.list);                           //send it it's index
        socket.set("page", data.list);
    });
    
    socket.on('items', function (data) {                        //when you are told about an item
        socket.get("page", function(err, val){          //store the new item
            addItem(socket, val, data);
        });                              
    });
    socket.on('index', function (data) {                        //when you are told about an index
        socket.get("page", function(err, val){
            storeIndex(socket, val, data.index);
        });
    });
    socket.on('moveIndex', function (data) {
        socket.get("page", function(err, val){
            moveItem(socket, val, data.currentIndex, data.newIndex);
        }); 
    });
    
    socket.on('pageTask', function(data) {
        pageTask(socket, data);
    });
    
    
});

function emitItems(socket, list, start) {
    db.serialize(function() {
        var query = "select * from items where listId = (select id from lists where name = '"+list+"') and listIndex > "+start+";";
        db.all(query, function(err, row)
        {
            socket.emit('items', row);
        });
    });
}

function addItem(socket, list, item) {
    
    function addItemFromParams(user, title, icon) {
    
        var time  = new Date().getTime();
        db.serialize(function() {
        
            var query = "insert into items(createdOn, createdBy, latitude, longitude, url, title, thumbnail, listId, listIndex) values (" +
                                time+","+
                                "'"+user+"',"+
                                item.latitude+", "+item.longitude+","+
                                "'"+item.message+"',"+
                                "'"+ title +"',"+
                                "'"+icon +"',"+
                                "(select id from lists where name = '"+list+"'),"+
                                "("+
                                    "(SELECT CASE "+
                                       " WHEN ( (SELECT MAX(listIndex) FROM items) IS NULL )"+
                                       " THEN 1 "+
                                      "  ELSE (SELECT MAX(listIndex) FROM items) + 1"+
                                   " END)"+
                               " )"+
                                ");";
                                
            db.run("BEGIN TRANSACTION;", function(){
            db.run(query, function(){
            db.all("select * from items where id = (select MAX(id) from items) and listId = (select id from lists where name = '"+list+"');", function(err, data){
                socket.broadcast.emit('items', data);
                socket.emit('items', data);
            db.run("COMMIT TRANSACTION;");
            });});});
        });
    
    }
    
    try {
    jsdom.env(
        url.parse(item.message.replace("\n", ""), true).href, [url.parse("http://code.jquery.com/jquery.js").href],
        function (errors, window) {
            var title = "" + item.message + "";
            var icon = "about:blank";
            if(window != undefined){ if(window.$ != undefined){ if(window.$("title").html() != undefined) {
                title = window.$("title").html();
                icon  = url.parse(item.message).protocol + "//" + url.parse(item.message).host + "/favicon.ico";
            } } }
           
            
            var user  = socket.handshake.address.address + ":" + socket.handshake.address.port;
            addItemFromParams(user, title, icon);
        }
    );}
    catch(er){
        var title = "" + item.message + "";
        var icon = "about:blank";
       
        var user  = socket.handshake.address.address + ":" + socket.handshake.address.port;
        addItemFromParams(user, title, icon);
    }
    
}

function storeIndex(socket, list, index) {
    db.serialize(function() {
    
        var query = "update lists set currentListId = "+index+" where name = '"+list+"';";
        db.all(query, function(err, row){
            emitIndex(socket, list);
        });
    });
}

function emitIndex(socket, list) {
     db.serialize(function() {
    
        var query = "select currentListId from lists where name = '"+list+"';";
        db.all(query, function(err, row){
            socket.emit('index', row );
            socket.broadcast.emit('index', row );
        });
    });
}

function moveItem(socket, page, currentIndex, newIndex) {


    console.log("Move: ");
    console.log(page, currentIndex, newIndex);
    
    //1) set the new index
    //2) set the element at that index and all future elements to +1
    var queries = [];
    queries.push("BEGIN TRANSACTION;");
    queries.push("drop table if exists oldId;");
    queries.push("create temp table oldId (value integer primary key);");
    queries.push("insert into oldId (value) values ( (select id from items where listIndex = "+currentIndex+") );");
    var rising = currentIndex > newIndex;
    if(rising) {
        console.log("rising");
        queries.push(" update items set listIndex = listIndex + 1 "
          +  " where listIndex  <= " + currentIndex + " - 1 "
          +  " and   listIndex  >= " + newIndex 
          +  " and listId = (select id from lists where name = '"+page+"');");
    }
    else { 
        console.log("falling");
        queries.push(" update items set listIndex = listIndex - 1 "
          +  " where listIndex  >= " + currentIndex + " + 1 "
          +  " and   listIndex  <= " + newIndex 
          +  " and listId = (select id from lists where name = '"+page+"');");
    }
    
    queries.push(" update items set listIndex = " + newIndex          //<---- set current index to new index.
               +  " where id = (select * from oldId)" 
               +  " and listId = (select id from lists where name = '" + page + "');");
    queries.push("COMMIT TRANSACTION;");
    
    var toSend = { from: currentIndex, to: newIndex, queries: queries};
    socket.broadcast.emit('moveIndex', toSend );
    socket.emit('moveIndex', toSend );
    
    sequenceQueries(queries);   
    
    
    
} 
//I'm real proud of this baby. Dequeues a list of queries and runs the sequentially. 
//I was a bit... bored? and so it's a bit convoluted.
function sequenceQueries(queries){
    db.serialize(function() {
        (function doNext(toDo){
            if(toDo.length > 0) {
                db.run(toDo.shift(), function(error){
                    console.log(error);
                    doNext(toDo);
                });
            }
        })(queries);
    });
}




function pageTask(socket, data) {
    if(data.type == "touch") {
        isNameSafe(data.pageName, function(isSafe){
                    socket.emit('pageTask', {type: data.type,
                                             reply: isSafe });
            });    
    }
    if(data.type == "create") {
        isNameSafe(data.pageName, function(isSafe){
            if(isSafe == "safe"){
                db.serialize(function() {
                    var time  = new Date().getTime();
                    var user  = socket.handshake.address.address + ":" + socket.handshake.address.port;
                    db.serialize(function(){
                        db.run("insert into lists (createdOn, createdBy, currentListId, name) values ("+time+", '"+user+"', 0, '"+data.pageName+"');", function(){
                            socket.emit('pageTask', {type:data.type,
                                                        created:true,
                                                        pageName:data.pageName} );
                        });
                    });
                });
                //create the page
            } else {
                //don't create the page
                socket.emit('pageTask', {type:data.type, created:false, pageName:data.pageName} );
            }
        });
    }
}


function isNameSafe(name, callback) {
    db.serialize(function() {
        db.all("select * from lists where name = '" + name + "';", function(err, databaseReply){
            var replyData = "safe";
            if(databaseReply.length != 0 || (/[^a-zA-Z0-9]/.test( name )) ){ 
                replyData = "unsafe";
            }
            callback(replyData);
        });
    });
}


/*



//falling
        /*for(var i = currentIndex + 1; i <= newIndex; i++) {
            at(i) = at(i) - 1;
        }*/

//able to choose your own page

//display/check for xFrame error //display text //provide a placeholder until the page loads

/*

    socket.on('checkXFrame', function (data) {
                socket.broadcast.emit('formData', data);
            });
*/