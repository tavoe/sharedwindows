Shared Windows
=============

Share a browsing experience.
----------------------------

#### What is it?

* A list making tool,
* That can show you websites in the list,
* And synchronize that preview with all your friends!

#### What can you do with it?

* Share the web browser with your friends
* Present a slideshow over the internet
* Control what is displayed on many computers from a single computer
* Post lists to lists for a "file directory"-esq experience

#### How to use it:

Go to : [Shared Windows Tutorial](https://sharedwindows.hackpad.com/How%2520to%2520Use%2520Shared%2520Windows#How-to-Use-Shared-Windows)

#### How to access it (pre-alpha):

Got to : [Shared Windows](http://www.sharedwindows.com)

Careful! It's fragile!

#### How to host your own:

###### Install prerequisites:
<<<<<<< HEAD
*  Visual Studio or XCode (sign Xcode's license agreement!!!)
=======
*  Xcode on mac, visual studio on windows, good luck on linux.
*  [nodejs](http://nodejs.org/download/)
>>>>>>> prod_1_b
*  npm install sqlite3
*  npm install socket.io
*  npm install jsdom

<!--[  ]  npm install hackpad
    [  ]  npm install request-->

 
 
1. Open "sharedwindows/server/" in your command prompt.
2. run "node server.js"
3. The default port is 80 (http). To change that, use: "node server.js [http port]". 

> for example: `node server.js 8080`

---------------------------
#### Issues:

###### Database problems? Create a fresh database! 

1. Go into `database/` and delete `db.sqlite`. 
2. Copy `dbClean.sqlite`
3. name it `db.sqlite`.

###### JSDOM issues?
* JSDOM relies on [contextify](https://github.com/brianmcd/contextify), which relies on [node-gyp](https://github.com/TooTallNate/node-gyp).
* Node-gyp needs Visual Studio or XCode installed. 
* Hint for Windows: [node-gyp](https://github.com/TooTallNate/node-gyp/wiki/Visual-Studio-2010-Setup)
* Hints for XCode: [Xcode->Preferences->Downloads and install component named "Command Line Tools"](http://stackoverflow.com/questions/6767481/where-can-i-find-make-program-for-mac-os-x-lion). XCode may ask you to sign a liscense via the command line.
