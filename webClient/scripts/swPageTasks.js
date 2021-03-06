/*
    Creating new pages. Able to "touch" a page name to see if its available, or "create" it to actually make one
*/ 

sw.page = {};
sw.page.lastWasValid = false; //remember if the last list name we posted was valid
sw.onload.push(function(){
    

    sw.socket.on("pageTask", function(data){ //when you're told about a page thingy
        if(data.type == "touch"){ //we ignore the report if the page was successfully created, actually!
            if(data.reply == "safe"){
                document.querySelector("#newPageName").classList.add("validName"); //set the color to red or green. Remember if it was valid
                document.querySelector("#newPageName").classList.remove("invalidName");
                sw.page.lastWasValid = true;
            } else {
                document.querySelector("#newPageName").classList.add("invalidName");
                document.querySelector("#newPageName").classList.remove("validName");
                sw.page.lastWasValid = false;
            }
        }  else {

            if(document.querySelector("#postToCurrent").checked){ //post the name based on what the server says it ended up naming it
                sw.post.send("http://" + window.location.host + "/lists/" + data.pageName, data.pageName); //post back to current page, or to child pages, based on post.send function.
            }

        }
    });


});

sw.page.create = function(pageName){ //the request to create
    if(sw.page.lastWasValid){
        var msg = "http://" + window.location.host + "/lists/" + document.querySelector("#newPageName").value; //put the name together from a few facts
        
        var name = document.querySelector("#newPageName").value; 
        sw.socket.emit('pageTask', { //request the page get made
                                        pageName: name,
                                        type: "create",
                                        page: sw.listName,
                                        domainName: window.location.href
                                    } );

        document.querySelector("#newPageName").classList.remove("invalidName"); //clean up.
        document.querySelector("#newPageName").classList.remove("validName");
        document.querySelector("#listFeedback").value = msg;


        document.querySelector("#newPageName").value = "";
    }
}

sw.page.touch = function(pageName){//sends off the touch. triggered by keydown on entry box. "#newPageName" page
    //document.querySelector("#newPageName").value = encodeURIComponent(document.querySelector("#newPageName").value);
    sw.socket.emit('pageTask', {
                                    pageName: document.querySelector("#newPageName").value,
                                    type: "touch",
                                    page: sw.listName
                                } );
}

//open in new tab
//this is the "pop out" item function. Don't know why its in here, but I guess it works. 
//IT IS NOW UNUSED> THE FUNCTION BELOW IS USED
sw.page.popOut = function(divToPop){
    var toPop = sw.helpers.getItemOfNode(divToPop).url; //popout as a web link
    if(!(toPop.substr(0, 7) == "http://" || toPop.substr(0, 8) == "https://")){
        toPop = sw.helpers.getHPAddress(toPop); //pop out as a hackpad
    }
    
    console.log(toPop);
    var win=window.open(toPop, '_blank');
    win.focus();


}


sw.page.getPopOutLink = function(message){
    var toPop = message;
    if(!(toPop.substr(0, 7) == "http://" || toPop.substr(0, 8) == "https://")){
        toPop = sw.helpers.getHPAddress(toPop); //pop out as a hackpad
    }
    
    return toPop;
}