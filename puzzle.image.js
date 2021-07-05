var image;
var bitmap;
var canvas;
var stage;
var pieces = [];
var pieceSizeW;
var pieceSizeH;
var wrapper_bmp;
var initX, initY, ratio;
var selectedPieces = [];
var shape = [];

const PUZZLE_COLUMN = 4;
const PUZZLE_ROW = 4;
const IMAGE_PATH = "shield.jpg";
const INIT_GAME_MESSAGE = "Solve the puzzle";
const INIT_GAME_SUB_MESSAGE = "Click anywhere to begin";
const END_GAME_MESSAGE  = "Well done!";
const TITLE_FONTSIZE = "2em";
const LINE_HEIGHT = 36;
const SECONDARY_FONTSIZE = "1.5em";

function init () {

	canvas = document.getElementById('canvas');
	canvas.width = document.body.clientWidth;
	canvas.height = document.body.clientHeight;
	stage = new createjs.Stage(canvas);
	stage.enableMouseOver(60);
	createjs.Touch.enable(stage);
	stage.name = "stage";
	wrapper_bmp = new createjs.Container();
	wrapper_bmp.name = "container";
	wrapper_bmp.x = 0;
	wrapper_bmp.y = 0;
	image = new Image();
	image.src = IMAGE_PATH;
	image.onload = handleImage;

	ticker();

}

function handleImage(event) {

	var that = event.target;
		
	var col = 0;
	var row = 0;

	for (var i = 0; i < PUZZLE_COLUMN * PUZZLE_ROW; i++) {

		bitmap = new createjs.Bitmap(that);
		ratio = Math.min(stage.canvas.width / bitmap.image.width, stage.canvas.height / bitmap.image.height);
		
		pieceSizeW = (bitmap.image.width*ratio)/PUZZLE_COLUMN;
		pieceSizeH = (bitmap.image.height*ratio)/PUZZLE_ROW;

		initX = stage.canvas.width/2 - (bitmap.image.width*ratio/2);
		initY = stage.canvas.height/2 - (bitmap.image.height*ratio/2);

		bitmap.scaleX = ratio;
		bitmap.scaleY = ratio;
		bitmap.regX = pieceSizeW/2;
		bitmap.regY = pieceSizeH/2;
		
		bitmap.sourceRect = new createjs.Rectangle(col * pieceSizeW/ratio, row * pieceSizeH/ratio, pieceSizeW/ratio, pieceSizeH/ratio);
		
		bitmap.homePoint = { x:  (initX + pieceSizeW/2*ratio)  +  (col * pieceSizeW) , y : (initY + pieceSizeH/2*ratio) + (row * pieceSizeH) };
		bitmap.x = bitmap.homePoint.x;
		bitmap.y = bitmap.homePoint.y;
		pieces[i] = bitmap;

		var shapes = new createjs.Shape();
		shapes.name = "shapes";
		shapes.graphics.setStrokeStyle(2).beginStroke('#146eb4').drawRect((initX) +  (col * pieceSizeW),initY + (row * pieceSizeH),pieceSizeW,pieceSizeH);
		shape[i] = shapes;

		col++;
		if (col === PUZZLE_COLUMN) {
			
			col = 0;
			row++;

		}
		
		wrapper_bmp.addChild(bitmap);
		wrapper_bmp.addChild(shapes);
		
	}

	stage.addChild(wrapper_bmp);

	displayStartMsg(INIT_GAME_MESSAGE, shufflePieces);
	
}

function displayStartMsg(introText, callback) {

	var container = new createjs.Container();
	container.name = "displayStartMsgContainer";

	var fadingRect = new createjs.Shape();
	fadingRect.graphics.beginFill("black").drawRect(0, 0, canvas.width, canvas.height);
	fadingRect.alpha = 0.9;

	//Text 1
	var startTaskText = new createjs.Text(INIT_GAME_MESSAGE, TITLE_FONTSIZE + " Arial", "white");
	startTaskText.lineWidth = document.body.clientWidth*(9/10);
	///set position text1
	startTaskText.lineHeight = LINE_HEIGHT;
	startTaskText.textAlign = "center";
	startTaskText.x = canvas.width/2;
	startTaskText.y = canvas.height/2 - startTaskText.getMeasuredHeight();
	//Text 2
	var nextText = new createjs.Text(INIT_GAME_SUB_MESSAGE, SECONDARY_FONTSIZE + " Arial", "white");
	nextText.lineWidth = document.body.clientWidth*(9/10);
	nextText.lineHeight = LINE_HEIGHT;
	nextText.textAlign = "center";
	nextText.x = canvas.width/2;
	nextText.y = canvas.height/2 + startTaskText.getMeasuredHeight()/2 + LINE_HEIGHT;
	
	container.addChild(fadingRect,startTaskText,nextText);
	stage.addChild(container);

	fadingRect.addEventListener('click', function(evt) { 
		setTimeout(callback, 2000);
		stage.removeChild(container); 
		
	}, null, false, null, false);
	
}	


function shufflePieces() {

	var i, piece, randomIndex;
	var col = 0;
	var row = 0;
	var p = [];
	p = p.concat(pieces);
	var l = p.length;
	
	for (var i = 0; i < l; i++) {

		randomIndex = Math.floor(Math.random() * p.length );
		piece = p[randomIndex];
		p.splice(randomIndex, 1);
		piece.addEventListener('click', onPieceClick);
		createjs.Tween.get(piece).to({ x:  (initX + pieceSizeW/2*ratio) +  (col * pieceSizeW) , y :  (initY + pieceSizeH/2*ratio) + (row * pieceSizeH) }, 200);
		wrapper_bmp.setChildIndex( shape[i], wrapper_bmp.getNumChildren()-1);
		
		col++;
		if (col === PUZZLE_COLUMN) {
			
			col = 0;
			row++;

		}

	}

}


function onPieceClick(e) {

	var p = e.target;
	var matrix = new createjs.ColorMatrix().adjustColor(15, 10, 100, 180);
	p.filters = [new createjs.ColorMatrixFilter(matrix)];

	p.cache(0, 0, pieceSizeW/ratio, pieceSizeH/ratio);
	selectedPieces.push(p);

	if (selectedPieces.length === 2) {

		swapSelectedPieces();

	}

}

function swapSelectedPieces() {

	var p1 = selectedPieces[0];
	var p2 = selectedPieces[1];

	createjs.Tween.get(p1).wait(300).to({x : p2.x, y : p2.y}, 200);
	createjs.Tween.get(p2).wait(300).to({x : p1.x, y : p1.y}, 200).call(function() { setTimeout(evalPuzzle, 200); });

}

function evalPuzzle() {

	var win = true;
	var i, piece;
	selectedPieces[0].uncache();
	selectedPieces[1].uncache();

	for (var i = 0; i < pieces.length; i++) {

		piece = pieces[i];

		if (piece.x != piece.homePoint.x || piece.y != piece.homePoint.y) {

			win = false;
			break;

		}

	}

	win ? displayStartMsg(END_GAME_MESSAGE, init) : selectedPieces = [];
	
}

function handlePressMove(event){

	wrapper_bmp.setChildIndex( event.target, wrapper_bmp.getNumChildren()-1);
	var coords = wrapper_bmp.globalToLocal(event.stageX, event.stageY);
	event.target.x = coords.x;
	event.target.y = coords.y;

}

function ticker () {

	createjs.Ticker.setFPS(30);
	createjs.Ticker.addEventListener("tick",stage);
	createjs.Ticker.addEventListener("tick", function() {

		stage.update();   
			
	});

}

window.onresize = function() {

	init ();

}