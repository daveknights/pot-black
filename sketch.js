const feedback = document.querySelector('#shot-feedback');
let whiteBall, whiteX, whiteY, whiteTargetX, whiteTargetY, moveWhiteBall,
    blackBall, blackX, blackY, blackTargetX, blackTargetY, moveBlackBall,
    calculatePath, inTopPocket, inBtmPocket, bounceX, bounceTopY, bounceBtmY;
let i = 0, j=0;

function createEllipse(fillColour, shadowVal, rad) {
    return {
        show: function(x, y) {
            drawingContext.shadowOffsetY = shadowVal;
            drawingContext.shadowBlur = shadowVal*2;
            drawingContext.shadowColor = '#020';
            noStroke();
            fill(fillColour);
            ellipse(x, y, rad);
        },
        r: rad
    };
}

function cushion([tl, tr, br, bl], shadow) {
    drawingContext.shadowOffsetX = shadow.x;
    drawingContext.shadowOffsetY = shadow.y;
    drawingContext.shadowBlur = 8;
    fill('#060');
    beginShape();
    vertex(tl.x, tl.y);
    vertex(tr.x, tr.y);
    vertex(br.x, br.y);
    vertex(bl.x, bl.y);
    endShape(CLOSE);
}

function guideLine(msY) {
    const targetStart = createVector(whiteX, whiteY);
    const visibleStart = createVector(whiteX, whiteY);
    const targetEnd = createVector(width, msY);
    const visibleEnd = createVector(width, msY);
    const maxVisibleEnd = visibleEnd.sub(visibleStart).normalize().mult(320).add(visibleStart);

    stroke('aqua');
    drawingContext.setLineDash([5, 15]);
    guide = line(visibleStart.x, visibleStart.y, maxVisibleEnd.x, maxVisibleEnd.y);

    const maxTargetEnd = targetEnd.sub(targetStart).normalize().mult(370).add(targetStart);
    whiteTargetX = maxTargetEnd.x;
    whiteTargetY = maxTargetEnd.y;

    return guide;
}

function showFeedback(text, feedbackClass) {
    feedback.textContent = text;
    feedback.classList.add(feedbackClass);
}

function calculateBlackTarget([x, y]) {    
    const path = createVector(x, y, 0);
    const endPoints = path.lerp(floor(blackX), floor(blackY), 0, 16.5);
    blackTargetX = endPoints.x;
    blackTargetY = endPoints.y

    calculatePath = false;
    moveBlackBall = true;
}

function resetTable(startPos, pockets, path, bounces, balls) {
    (startPos === true)  && (whiteX = 80, whiteY = height/2, blackX = width/2, blackY = height/2);
    (pockets === true) && (inTopPocket = false, inBtmPocket = false);
    (path === true) && (calculatePath = undefined);
    (bounces === true) && (bounceX = false, bounceTopY = false, bounceBtmY = false)
    balls.length && (moveWhiteBall = balls[0], moveBlackBall = balls[1]);
}

function setup() {
    const canvas = createCanvas(760, 560);
    canvas.position((innerWidth/2 - width/2), 190);
    // Reset options: startPos, pockets, path, bounces, balls[moveWhite, moveBlack]
    resetTable(true, true, false, false, [false, false]);

    topPocket = createEllipse('#030', 0, 60);
    btmPocket = createEllipse('#030', 0, 60);
    whiteBall = createEllipse('white', 5, 35);
    blackBall = createEllipse('black', 5, 35);
}

function draw() {
    background('white');
    // table
    drawingContext.shadowOffsetY = 0;
    drawingContext.shadowBlur = 0;
    fill('#60340e');
    rect(0, 0, width, height, 0, 35, 35 ,0);
      // Top corner
    fill('#d8af6a');
    drawingContext.shadowOffsetX = 0;
    rect(width - 80, 0, 80, 80, 0, 30, 0, 30);
    // Bottom corner
    rect(width - 80, height - 80, 80, 80, 30, 0, 30, 0);
    // Baize
    fill('#060');
    rect(0, 40, 720, 480);
    // Pockets
    fill('#060');
    drawingContext.shadowOffsetX = 0;
    topPocket.show(width - 54, 54);
    btmPocket.show(width - 54, height - 54);
    // Balls & guide
    if ((!inTopPocket && !inBtmPocket) || blackX < width - 50) {
        blackBall.show(blackX, blackY);
    }
    !moveWhiteBall && guideLine(mouseY);
    whiteBall.show(whiteX, whiteY);
    // Top cushion
    cushion(
        [
            {x: 0, y: 40}, {x: width - 80, y: 40},
            {x: width - 100, y: 60}, {x: 0, y: 60}],
        {x: 0, y: 4, blur: 8}
    );
    // Btm cushion
    cushion(
        [
            {x: 0, y: height - 60}, {x: width - 100, y: height- 60},
            {x: width - 80, y: height - 40}, {x: 0, y: height - 40}
        ],
        {x: 0, y: -4}
    );
    // End cushion
    cushion(
        [
            {x: width - 60, y: 100}, {x: width - 40, y: 80},
            {x: width - 40, y: height - 80}, {x: width - 60, y: height - 100}
        ],
        {x: -4, y: 0}
    );
    // Ball movement logic
    if (moveWhiteBall && floor(whiteX) !== floor(whiteTargetX)) {
        whiteX = lerp(whiteX, whiteTargetX, 0.1);
        whiteY = lerp(whiteY, whiteTargetY, 0.1);

        if (floor(whiteX) === floor(whiteTargetX) && !moveBlackBall) {
            showFeedback('Foul', 'foul');
            // Reset options: startPos, pockets, path, bounces, balls[moveWhite, moveBlack]
            resetTable(true, false, false, false, [false, null]);
        }
    }
    if (moveBlackBall && floor(blackX) !== floor(blackTargetX) && (!bounceX && !bounceTopY && !bounceBtmY)) {
        blackX = lerp(blackX, blackTargetX, 0.05);
        blackY = lerp(blackY, blackTargetY, 0.05);
    } else if (floor(blackX) === floor(blackTargetX)) {
        // Reset options: startPos, pockets, path, bounces, balls[moveWhite, moveBlack]
        resetTable(true, true, true, false, [false, false]);
    }
    // Ball collision logic
    const ballDistance = dist(whiteX, whiteY, blackX, blackY);
    if  ((ballDistance < (whiteBall.r/2) + (blackBall.r/2)) && calculatePath !== false) {
        calculateBlackTarget([whiteX, whiteY]);
    }
    // cushion bounce logic
    if ((blackX > width - 74 && (!inTopPocket && !inBtmPocket)) || bounceX) {
        // const extraDist = blackTargetX - (width - 60);
        const newBlackTargetX = (width - 60) - (blackTargetX - (width - 60));

        bounceX = true;

        if (floor(blackX) !== floor(newBlackTargetX)) {
            blackX = lerp(blackX, newBlackTargetX, 0.1);
        } else {
            // Reset options: startPos, pockets, path, bounces, balls[moveWhite, moveBlack]
            resetTable(true, false, true, true, [false, false]);
        }
    }
    if ((blackY < 75 && (!inTopPocket && !inBtmPocket)) || bounceTopY) {
        const newBlackTargetY = blackTargetY < -90 ? blackTargetY * -1 : 90;

        bounceTopY = true;

        if (floor(blackY) !== floor(newBlackTargetY) -1) {
            blackY = lerp(blackY, newBlackTargetY, 0.1);
        } else {
            // Reset options: startPos, pockets, path, bounces, balls[moveWhite, moveBlack]
            resetTable(true, false, true, true, [false, false]);
        }
    }
    if ((blackY > height - 75 && (!inTopPocket && !inBtmPocket)) || bounceBtmY) {
        const newBlackTargetY = blackTargetY - blackX > 90 ? height - 180 : height - 90;

        bounceBtmY = true;

        if (floor(blackY) !== floor(newBlackTargetY)) {
            blackY = lerp(blackY, newBlackTargetY, 0.1);
        } else {
            // Reset options: startPos, pockets, path, bounces, balls[moveWhite, moveBlack]
            resetTable(true, false, true, true, [false, false]);
        }
    }
    // Ball in pocket logic
    const topPocketDistance = dist(blackX, blackY, width - 48, 48);
    const btmPocketDistance = dist(blackX, blackY, width - 48, height - 48);

    if  (topPocketDistance < (topPocket.r/2) + (blackBall.r/2)) {
        inTopPocket = true;
        showFeedback('Nice pot', 'pot');
    }
    if  (btmPocketDistance < (btmPocket.r/2) + (blackBall.r/2)) {
        inBtmPocket = true;
        showFeedback('Nice pot', 'pot');
    }
}

function mousePressed() {
    feedback.textContent = '';
    feedback.classList.remove('pot', 'foul');
    moveWhiteBall = true;
}
