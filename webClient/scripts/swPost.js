sw.post = {};

sw.onload.push(function(){
    
    sw.socket.on('items', function (data) {
        console.log(data);
        sw.post.display(data);
    });
    
});

//loads all posts since a given post. Just pass in 0 to get all posts to date.
sw.post.display = function(data){
    var htmlPosts = "";
    for(post in data){ post = data[post];
        htmlPosts = "<div class='message text' onclick='sw.preview.itemClicked(this)'>"+ post.url +"</div>" + htmlPosts;
    }
    document.querySelector("#page").innerHTML = htmlPosts;
    /*if(document.querySelector("#jumpToCurrent").checked){
        sw.loadPreviewOf(document.querySelector("#rollingLinks").children[0]);
    }*/
};

//submits a new post
sw.post.send = function() {
    navigator.geolocation.getCurrentPosition(function(pos){
        var msg = document.querySelector("#postBox").value;
        document.querySelector("#postBox").value = "";
        sw.socket.emit('items', {message: msg, latitude: pos.coords.latitude, longitude: pos.coords.longitude }); //post to?
    });
};
