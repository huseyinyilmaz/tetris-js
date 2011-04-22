"use strict";
window['gameManager'] = function(){
    /////////////////
    // ELEMENTS    //
    /////////////////

    //game piece types
    var elements = [
    //  X
    // XXX
    {color:'#f00',
     cubes:[{x:0,y:0},{x:1,y:0},{x:-1,y:0},{x:0,y:1}]},
    // XXXX
    {color:'#0f0',
     cubes:[{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:-1,y:0}]},
    // XX
    // XX
    {color:'#00f',
     cubes:[{x:0,y:0},{x:1,y:0},{x:0,y:1},{x:1,y:1}]},
    // X
    // XXX
    {color:'#ff0',
     cubes:[{x:0,y:0},{x:1,y:0},{x:-1,y:0},{x:-1,y:1}]},
    //   X
    // XXX
    {color:'#fff',
     cubes:[{x:0,y:0},{x:1,y:0},{x:-1,y:0},{x:1,y:1}]},
    //  XX
    // XX
    {color:'#0ff',
     cubes:[{x:0,y:0},{x:0,y:1},{x:1,y:1},{x:-1,y:0}]},
    // XX
    //  XX
    {color:'#f0f',
     cubes:[{x:0,y:0},{x:0,y:1},{x:-1,y:1},{x:1,y:0}]}];
    //holds current game
    var current = null;

    //prototype for cubes on the screen
    var cubeProto = {
        emptyCubeColor:"#000",

        //refreshes the cube with given color
        put:function(c){
            var dim = current.cubeDimantion;
            //if there is no color defined remove cube
            if(typeof(c) === 'undefined'){
                c=this.emptyCubeColor;
                current.paper.ctx.clearRect(this.x,this.y,dim,dim);
                this.empty = true;
            }else{
                this.empty = false;
                current.paper.fillRect(this.x,this.y,dim,dim,c);
            }
            this.color=c;
        }
    };

    //prototype for the game
    var gameProto = {
        width: 600,
        height: 700,
        cubeDimantion:30,//dimention of every piece.
        arenaSize:14,//arena size in cube count
        previewArenaSize:5,
        previewArenaHeight:5,
        //Draw base of the gaming arena
        drawBase:function(){
            var paper = this.paper;
            var arenaWidth = gameProto.cubeDimantion * gameProto.arenaSize;
            // Game Arena Cover
            paper.strokeRect(5,5,arenaWidth,this.height-10);
            // Info Window Cover
            paper.strokeRect(arenaWidth+10,5,this.width-arenaWidth-15,this.height-10);
            //next piece text
            paper.ctx.textAlign = 'left';
            paper.fillText('NextPiece',arenaWidth+25,30);
            paper.ctx.textAlign = 'end';

        },
        //removes completed rows and rerenders the board
        render:function(){
            var arena = this.arena;
            var newArena = [];
            var totalscore = 0;

            //calculate newarena and score
            arena.forEach(function(row,i){
                              if (row.every(function(x){return !x.empty;})){
                                  totalscore += i+1;
                              }else{
                                  newArena.push(row);
                              }
                          });

            newArena.forEach(function(valRow,i){
                                 arena[i].forEach(function(cube,j){
                                                      var valCube = valRow[j];
                                                      if (valCube.empty)
                                                          cube.put();
                                                      else
                                                          cube.put(valCube.color);
                                                  });
                             });

            arena.slice(newArena.length).forEach(function(row){row.forEach(function(cube){cube.put();});});

            this.score +=totalscore;
            this.refreshScore();

        },
        //refresh score on the board
        refreshScore:function(){
            this.putScore(this.score);
        },
        //process one turn of the game
        turn:function(){
            var result = true;
            if(!this.movePiece(0,-1)){
                var piece = this.current_piece;
                if(piece.cubes.some(function(x){return x.y>=23;})){
                    clearTimeout(this.timeInterval);
                    alert('game over');
                }else{
                    this.enterPiece();
                }
                result = false;
            }
            return result;
        },
        //chooses next piece and returns old one back
        chooseNewNextPiece:function(){
            var index = Math.floor(Math.random()*elements.length);
            var e = this.next_piece;
            var previewArena = this.previewArena;
            if(e != null)
                e.cubes.forEach(function(x){
                                    previewArena[x.y+2][x.x+2].put();
                                });
            this.next_piece = elements[index];
            var color = this.next_piece.color;
            this.next_piece.cubes.forEach(function(x){
                                              previewArena[x.y+2][x.x+2].put(color);
                                          });
            return e;
        },
        //stops current piece and enters the new piece to game arena
        enterPiece:function(){
            var e = this.chooseNewNextPiece();
            var piece = {element: e,
                         cubes:e.cubes.map(function(i){return {x:i.x+7, y:i.y+23};})};
            current.current_piece = piece;
            this.render();
        },
        //place current piece to given location
        placePiece:function(newCubes){
            var piece = this.current_piece;
            var orgCubes = piece.cubes;
            var arena = current.arena;
            var arenaSize = current.arenaSize;
            var result;
            if (newCubes.every(function(i){return (i.y>=0 && i.x>=0 && i.x<arenaSize)  
                                               && (   i.y>=23 || arena[i.y][i.x].empty
                                                   || orgCubes.some(function(j){
                                                                         return i.x === j.x && i.y === j.y;
                                                                     }));
                                       })){
                //cubes that needs to be removed
                var rmCubes = orgCubes.filter(function(cube){
                                                  return newCubes.every(function(x){
                                                                           return !(x.x===cube.x && x.y ===cube.y);
                                                                       });
                                              });
                //cubes that needs to be added
                var addCubes = newCubes.filter(function(cube){
                                                  return orgCubes.every(function(x){
                                                                           return !(x.x===cube.x && x.y ===cube.y);
                                                                       });
                                              });
                //remove cubes
                rmCubes.forEach(function(i){
                                     if(i.y<23)
                                         arena[i.y][i.x].put();
                                 });
                //add cubes
                addCubes.forEach(function(i){
                                     if (i.y<23)
                                         arena[i.y][i.x].put(piece.element.color);
                                 });
                piece.cubes = newCubes;
                result = true;
            }else{
                result = false;
            }
            return result;
        },
        //move piece by given values
        movePiece:function(x,y){
            var newCubes = this.current_piece.cubes.map(function(i){return {x:i.x+x,y:i.y+y};});
            return this.placePiece(newCubes);
        },
        //start game
        start:function(){
            this.chooseNewNextPiece();
            this.enterPiece();
            gameManager.loop();
        },//start
        //left arrow event handler
        moveLeft:function(){
            this.movePiece(-1,0);
        },
        //right arrow event handler
        moveRight:function(){
            this.movePiece(1,0);
        },
        //up arrow event handler
        rotate:function(){
            var piece = this.current_piece;
            var cubes = piece.cubes;
            var defaultx = cubes[0].x;
            var defaulty = cubes[0].y;
            var newCubes = cubes.map(function(i){
                                         return {x:(i.y-defaulty)+defaultx,y:(-(i.x-defaultx)+defaulty)};
                                     });
            this.placePiece(newCubes);
        },
        //down arrow event handler
        moveDown:function(){
            this.turn();
        },
        //enter event handler
        moveAllDown:function(){
            while(this.turn());
        }
    };

    return {
        //loop function that called by setTimeout Method
        //This function creates main game loop
        loop:function(){
            current.timeInterval = setTimeout("gameManager.loop()",current.interval-current.score);
            current.turn();
        },
        //initialize the game and return initialized game
        initialize:function(element){
            // Prepare main game object
            var paper = {
                ctx:element.getContext('2d'),
                strokeRect:function(x,y,width,height){
                    var ctx = this.ctx;
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth   = 1;
                    ctx.strokeRect(x,y,width,height);
                },//strokeRect
                fillText:function(st,x,y){
                    var ctx = this.ctx;
                    ctx.fillStyle = '#fff';
                    ctx.fillText(st,x,y);
                },//fillText
                fillRect:function(x,y,width,height,color){
                    var ctx = this.ctx;
                    ctx.fillStyle = color;
                    ctx.fillRect(x,y,width,height);
                }
            };
            var putScore = function(s){
                paper.fillText(s,gameProto.width-25,350);
            };

            paper.ctx.font = "20pt Arial";
            paper.ctx.textAlign = 'end';

            var game = {
                paper:paper,
                pieces:[],
                current_piece: null,
                next_piece:null,
                score:0,
                interval:500,
                putScore:putScore
            };
            current = game;
            //Create game arena blocks
            var dim = gameProto.cubeDimantion;
            var arenaSize = gameProto.arenaSize;
            var arena = [];
            var indexStart = gameProto.height-5-dim;
            for(var i = 0;i<23;i++){//height
                var row = [];
                for(var j = 0;j<arenaSize;j++){
                    var cube ={empty:true,
                               color:null,
                               x:j*dim+5,
                               y:indexStart-i*dim};
                    cube.__proto__ = cubeProto;
                    row.push(cube);
                };//inner for
                arena.push(row);
            };//outer for
            //set newly created arena to game.arena
            game.arena = arena;
            //create preview arena blocks
            var preview = [];
            var previewx = dim*arenaSize + 15;
            var previewArenaSize = gameProto.previewArenaSize;
            var previewArenaHeight = gameProto.previewArenaHeight;
            var previewIndexStart = 5 + dim*previewArenaHeight;
            for(i=0;i<previewArenaHeight;i++){
                var row = [];
                for(var j=0;j<previewArenaSize;j++){
                    var cube = {empty:true,
                                color:null,
                                x:j*dim+5+previewx,
                                y:previewIndexStart-i*dim};
                    cube.__proto__ = cubeProto;
                    row.push(cube);
                }
                preview.push(row);
            }
            game.previewArena = preview;
            //put score numbers
            game.putScore(game.score);

            //set prototype of game object
            game.__proto__ = gameProto;
            game.drawBase();
            return game;
        }//initialize
    };//returned object
}();

window.onload = function() {
    //initialize a new game
    var game = gameManager.initialize(document.getElementById('c'));
    //bind event handlers to ducument
    document.addEventListener('keydown',function(e){
                                  switch(e.keyCode){
                                case 13://enter
                                      game.moveAllDown();
                                      break;
                                  case 37://left arrow
                                      game.moveLeft();
                                      break;
                                  case 38://up arrow
                                      game.rotate();
                                      break;
                                  case 39://right arrow
                                      game.moveRight();
                                      break;
                                  case 40://down arrow
                                      game.moveDown();
                                      break;
                                  }; },false);
    game.start();
};