"use strict";

var gameManager = function(){
	/////////////////
    // ELEMENTS	   //
    /////////////////
	//First cube in the list is the turning point of the piece
	var elements = [];

	//  X
	// XXX
	elements.push({
					  color:'#f00',
					  cubes:[{x:0,y:0},{x:1,y:0},{x:-1,y:0},{x:0,y:1}]
				  });
	// XXXX
	elements.push({
					  color:'#0f0',
					  cubes:[{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:-1,y:0}]
				  });
	// XX
	// XX
	elements.push({
					  color:'#00f',
					  cubes:[{x:0,y:0},{x:1,y:0},{x:0,y:1},{x:1,y:1}]
				  });

	// X
	// XXX
	elements.push({
					  color:'#ff0',
					  cubes:[{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:0,y:1}]
				  });

	//  XX
	// XX
	elements.push({
					  color:'#0ff',
					  cubes:[{x:0,y:0},{x:0,y:1},{x:1,y:1},{x:-1,y:0}]
				  });

	// XX
	//  XX
	elements.push({
					  color:'#f0f',
					  cubes:[{x:0,y:0},{x:0,y:1},{x:-1,y:1},{x:1,y:0}]
				  });

	//holds current game
	var current = null;
	//piece prototype
	var pieceProto = {
	};

	
	//prototype for the game
	var gameProto = {
		width: 600,
		height: 700,
		cubeDimantion:30,//dimention of every piece.
		arenaSize:14,//arena size in cube count

		//Draw base of the gaming arena
		drawBase:function(){
			var paper = this.paper;
			var arenaWidth = gameProto.cubeDimantion * gameProto.arenaSize;
			// Game Arena Cover
			var cover1 = paper.rect(5,5,arenaWidth,this.height-10);
			cover1.attr("stroke","#fff");
			// Info Window Cover
			var cover2 = paper.rect(arenaWidth+10,5,this.width-arenaWidth-15,this.height-10);
			cover2.attr("stroke","#fff");
		},
		//process one turn of the game
		turn:function(){
			console.log("here");
			this.current_piece.cubes = this.current_piece.cubes.map(function(i){ 
																		if (i.y<23)
																			current.arena[i.y][i.x].put();
																		i.y--;
																		if (i.y<23)
																			current.arena[i.y][i.x].put(this.element.color);
																		return i;
																	},this.current_piece);
			
			
		},
		chooseNewNextPiece:function(){
			var index = Math.floor(Math.random()*elements.length);
			var e = this.next_piece;
			this.next_piece = elements[index];
			return e;
		},
		//stops current piece and enters the new piece to game arena
		enterPiece:function(){
			var e = this.chooseNewNextPiece();
			var piece = {element: e,
						 cubes:e.cubes.map(function(i){return {x:i.x+7, y:i.y+23};})};
			piece.__proto__ = pieceProto;
			current.current_piece = piece;
		},
		//start game
		start:function(){
			this.chooseNewNextPiece();
			this.enterPiece();
			gameManager.loop();
		}//start

	};

	var cubeProto = {
		put:function(c){
			//if there is no color defined remove cube
			if(typeof(c) === 'undefined'){
				c="#000";
				this.empty = true;
			}else{
				this.empty = false;
			}
			this.cube.attr('fill',c);
		}
	};

	return {
		loop:function(){
			setTimeout("gameManager.loop()",1000);
			current.turn();
		},
		initialize:function(element){
			// Prepare main game object
			var game = {
				paper: new Raphael(element, gameProto.width, gameProto.height),
				pieces:[],
				current_piece: null,
				next_piece:null
			};
			current = game;
			//Create game arene blocks
			var dim = gameProto.cubeDimantion;
			var arena = [];
			var indexStart = gameProto.height-5-dim;
			for(var i = 0;i<23;i++){//height
				var row = [];
				for(var j = 0;j<gameProto.arenaSize;j++){
					var cube ={empty:true,
								cube:game.paper.rect(j*dim+5,indexStart-i*dim,dim,dim)
							   };
					cube.__proto__ = cubeProto;
					row.push(cube);
				};//inner for
				arena.push(row);
			};//auther for
			//set newly created arena to game.arena
			game.arena = arena;
			//set prototype of game object
			game.__proto__ = gameProto;
			game.drawBase();
			return game;
		}//initialize
	};//returned object
}();


window.onload = function() {  
	var game = gameManager.initialize(document.getElementById('canvas_container'));
	game.start();
	console.log(game);
}; 