sw.page = {};
sw.onload.push(function(){
    

    sw.socket.on("pageTask", function(data){
        //console.log(data);
    });

});

sw.page.create = function(pageName){
    sw.socket.emit('pageTask', {
                                    pageName: document.querySelector("#newPageName").value,
                                    type: "create",
                                    page: sw.listName
                                } );
}

sw.page.touch = function(pageName){
    sw.socket.emit('pageTask', {
                                    pageName: document.querySelector("#newPageName").value,
                                    type: "touch",
                                    page: sw.listName
                                } );
}

