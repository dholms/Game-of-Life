var canvas;
var context;
var grid;
var run = false;
var settings = {
    width: 50,
    height: 50,
    cellSize: 8,
    radius: 1,
    loneliness: 2,
    overpop: 3,
    genmin: 3,
    genmax: 3,
    sides: "toroidal"
};

$(document).ready(function(){
    canvas = document.getElementById("c");
    //click listener
    canvas.addEventListener('click', function(e){
        gridOnClick(e);
    }, false);

    createGame();
});

function initGrid(){
    grid = [];
    for(var i = 0; i < settings.width; i++){
        grid.push([]);
        for(var j = 0; j < settings.height; j++){
            grid[i].push(0);
        }
    }
}

function createGame(){
    initGrid();
    canvas.width = settings.width * settings.cellSize + 1;
    canvas.height = settings.height * settings.cellSize + 1;

    //draws grid
    context = canvas.getContext("2d");
    for (var x = 0.5; x < canvas.width; x += settings.cellSize) {
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
    }
    for (var y = 0.5; y < canvas.height; y += settings.cellSize) {
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
    }
    context.strokeStyle = "#000";
    context.stroke();
}

function stepClick(){
    if(!run){
        step();
    }
}

//runs one step of GoL. If start has been pressed, recursively calls until stop is pressed.
function step(){
	var toKill = [];
	var toBirth = [];
	//searches through grid to find all cells to kill and birth
	//adds to array because they all must be killed/birthed in an instant not one at a time
	for(var i = 0; i < settings.width; i++){
		for(var j = 0; j < settings.height; j++){
			neighbors = getLiveNeighborCount(i, j);
			if(grid[i][j] == 1){
				if(neighbors < settings.loneliness || neighbors > settings.overpop){
					toKill.push([i, j]);
				}
			}
			else{
				if(neighbors >= settings.genmin && neighbors <= settings.genmax){
					toBirth.push([i,j]);
				}
			}
		}
	}
	//kills cells in toKill
	for(var i = 0; i < toKill.length; i++){
		cell = toKill[i];
		kill(cell[0], cell[1]);
	}
	toKill.length = 0;
	//births cells in toBirth
	for(var i = 0; i < toBirth.length; i++){
		cell = toBirth[i];
		birth(cell[0], cell[1]);
	}
	toBirth.length = 0;
	//loops
	if(run){
		//calculate loop speed from 00 ms to 1000ms
		x = document.getElementById("speed").value;
		x = ((20-x)*50);
		setTimeout(function(){step()}, x);
	}
}

//gets total count of how many live neighbors are in the surrounding 8 squares
function getLiveNeighborCount(i, j){
	var neighbors = 0;
	for(var k = i-settings.radius; k <= i+settings.radius; k++){
		for(var l = j-settings.radius; l <= j+settings.radius; l++){
			if(k >= 0 && k < settings.width && l >= 0 && l < settings.height){
				if(grid[k][l] == 1 && (i!=k || j!=l)){
					neighbors++;
				}
			} else{
                if(settings.sides == "alive")
                    neighbors++;
                else if(settings.sides == "toroidal"){
                    var x = (k+settings.width)%settings.width;
                    var y = (l+settings.height)%settings.height;
                    if(grid[x][y] == 1)
                        neighbors++;
                }
            }
		}
	}
	return neighbors
}

function paint(x, y, color){
    x = x*settings.cellSize + 1;
    y = y*settings.cellSize + 1;
    context.fillStyle = color;
    context.fillRect(x, y, settings.cellSize-1, settings.cellSize-1);
}

//births cell. updating grid and painting on canvas
function birth(i, j){
	grid[i][j] = 1;
	paint(i, j, "#000");
}

//kills cell. updating grid and painting on canvas
function kill(i, j){
	grid[i][j] = 0;
	paint(i, j, "#aaa");
}

//processes grid clicks. dividing by cellSize and rounding down.
//if alive, kill. if dead, birth
function gridOnClick(e){
    var x = Math.floor((e.pageX-canvas.offsetLeft)/settings.cellSize);
    var y = Math.floor((e.pageY-canvas.offsetTop)/settings.cellSize);
    if(e.shiftKey){
        birth(x, y);
    } else if(e.ctrlKey){
        if(grid[x][y] ==1)
            kill(x, y);
    } else if(grid[x][y] == 0){
        birth(x, y);
    } else{
        kill(x, y);
    }
}

String.prototype.toInt = function(){
    return parseInt(this, 10);
}

//process button clicks
function start(){
	run = true;
	step();
}
function stop(){
	run = false;
}

function wipeBoard(_callback){
	stop();

	for(var i = 0; i < settings.width; i++){
		for(var j = 0; j < settings.height; j++){
			grid[i][j] = 0;
            paint(i, j, "#fff");
		}
	}
}

function random(){
    wipeBoard();
    for(var i = 0; i < settings.width; i++){
        for(var j = 0; j < settings.height; j++){
            var x = Math.random();
            if(x > 0.6){
                birth(i, j);
            }
        }
    }
}

function refresh(){
    stop();
    var alertText = "";

    var checkValues = function(name, min, max){
        var temp = $('#'+name).val().toInt();
        if(temp > max || temp < min){
            var toAdd = "Please enter a " + name + " between " + min + " and " + max + ".\n";
            alertText += toAdd;
        } else{
            settings[name] = temp;
        }
    }

    checkValues("width", 20, 200);
    checkValues("height", 20, 200);
    checkValues("cellSize", 5, 20);
    checkValues("radius", 1, 10);
    var threshold = 4 * settings.radius * (settings.radius + 1);
    checkValues("loneliness", 1, threshold);
    checkValues("overpop", settings.loneliness, threshold);
    checkValues("genmin", 1, threshold);
    checkValues("genmax", settings.genmin, threshold);
    settings.sides = $('#sides').val();

    if(alertText.length > 0)
        alert(alertText);

    createGame();
}
