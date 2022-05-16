let whiteBall, whiteX, whiteY, moveWhiteBall,
    blackBall, blackX, blackY, moveBlackBall,
    calculatePath;
let whiteTargetX, whiteTargetY, blackTargetX, blackTargetY;
let i = 0, j=0;

function createEllipse(fillColour, shadowVal, rad=50) {    
    return {
        show: function(x, y) {
            drawingContext.shadowOffsetX = shadowVal;
            drawingContext.shadowOffsetY = shadowVal;
            drawingContext.shadowBlur = shadowVal*2;
            drawingContext.shadowColor = '#020';    
            fill(fillColour);
            ellipse(x, y, rad);
        },
        r: rad
    };
}

function startPositions() {
    whiteX = 80;
    whiteY = height/2;
    blackX = width/2;
    blackY = height/2;
} 

function setup() {
    const canvas = createCanvas(600, 400);
    canvas.position((window.innerWidth / 2) - 300, 50);
    moveWhiteBall = false;
    moveBlackBall = false;

    noStroke();
    startPositions();
    
    pocket1 = createEllipse('#030', 0, 80);
    pocket2 = createEllipse('#030', 0, 80);
    whiteBall = createEllipse('white', 5);
    blackBall = createEllipse('black', 5);
}

function calculateBlackTarget([x, y]) {    
    const path = createVector(x, y, 0);
    const endPoints = path.lerp(floor(blackX), floor(blackY), 0, 9);
    blackTargetX = endPoints.x;
    blackTargetY = endPoints.y

    calculatePath = false;
    moveBlackBall = true;
}

function draw() {    
    background('#060');

    pocket1.show(600, 0);
    pocket2.show(600, 400);
    whiteBall.show(whiteX, whiteY);
    blackBall.show(blackX, blackY);


    if (moveWhiteBall === true & floor(whiteX) !== floor(whiteTargetX)) {
        whiteX = lerp(whiteX, whiteTargetX, 0.1);
        whiteY = lerp(whiteY, whiteTargetY, 0.1);
    }

    if (moveBlackBall === true & floor(blackX) !== floor(blackTargetX)) {
        blackX = lerp(blackX, blackTargetX, 0.1);
        blackY = lerp(blackY, blackTargetY, 0.1);
    } else if (floor(blackX) === floor(blackTargetX)) {
        startPositions();
        moveWhiteBall = false;
        moveBlackBall = false;
        calculatePath = undefined;
    }

    const distance = dist(whiteX, whiteY, blackX, blackY);
    if  ((distance < (whiteBall.r/2) + (blackBall.r/2)) && calculatePath !== false) {
        moveBlackBall = true;

        calculateBlackTarget([whiteX, whiteY]);
    }
}

function mousePressed() {
    whiteTargetX = floor(mouseX);
    whiteTargetY = floor(mouseY);

    moveWhiteBall = true;
}
