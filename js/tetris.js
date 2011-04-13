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
			if(!this.movePiece(0,-1))
				this.enterPiece();
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
		placePiece:function(newCubes){
			var piece = this.current_piece;
			var orgCubes = piece.cubes;
			var arena = current.arena;
			var result;
			if (newCubes.every(function(i){return (i.y>=0 && i.x>=0 && i.x<14)  
										       && (   i.y>=23 || arena[i.y][i.x].empty
												   || orgCubes.some(function(j){
																		 return i.x === j.x && i.y === j.y;
																	 }));
									   })){
				//remove original cubes
				orgCubes.forEach(function(i){
									 if(i.y<23)
										 arena[i.y][i.x].put();
								 });
				//place new cubes
				newCubes.forEach(function(i){
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
		moveLeft:function(){
			this.movePiece(-1,0);
		},
		moveRight:function(){
			this.movePiece(1,0);
		},
		rotate:function(){
			var piece = this.current_piece;
			var cubes = piece.cubes;
			var defaultx = cubes[0].x;
			var defaulty = cubes[0].y;
			var newCubes = cubes.map(function(i){
										 return {x:(i.y-defaulty)+defaultx,y:(-(i.x-defaultx)+defaulty)};
									 });
			this.placePiece(newCubes);
			
			console.log('rotate');
		},
		moveDown:function(){
			this.turn();
		}
	};

	return {
		loop:function(){
			setTimeout("gameManager.loop()",500);
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
	document.addEventListener('keydown',function(e){
								  switch(e.keyCode){
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