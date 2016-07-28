'use strict'; // better safe than sorry

// ES6 class syntax
// the pad
class Pad {

    constructor(killCounter) {
        this.padInit();
        this.moveInit();
        this.mousePosition = document.body.clientWidth / 2;
        this.init(killCounter);
    }

    init(killCounter) {
        this.killCounter = killCounter;
    }

    padInit() {
        this.padModel = document.createElement('div');
        this.padModel.style.cssText = `
            border-radius: 25px;
            width: 10%;
            height: 2%;
            position: absolute;
            bottom: 20px;
            left: 50%;
            margin-left: -5%;
            background: ${Game.randomColorGen()}; /* fallback for old browsers */
            background: -webkit-linear-gradient(to left, ${Game.randomColorGen()} , ${Game.randomColorGen()});
            background: linear-gradient(to left, ${Game.randomColorGen()} , ${Game.randomColorGen()});
            -webkit-box-shadow: 0px 0px 4px 0px rgba(0,0,0,0.5);
            -moz-box-shadow: 0px 0px 4px 0px rgba(0,0,0,0.5);
            box-shadow: 0px 0px 4px 0px rgba(0,0,0,0.5);
        `;

        document.body.appendChild(this.padModel);
        return this.padModel;
    }

    moveInit() {
        //ES6 arrow function
        document.addEventListener('mousemove', (event) => {
            this.mousePosition = event.pageX;
        });
    }

    // pad logic
    move() {
        let maxRightPosition = 95;
        let newPosition = this.mousePosition / document.body.clientWidth * 100;
        if (newPosition < 5) newPosition = 5;
        if (newPosition > maxRightPosition)
            newPosition = maxRightPosition;
        this.padModel.style.left = newPosition + '%';
    }

    getPadModel() {
        return this.padModel;
    }
}

class Ball {

    constructor(myPad, ballSpeed) {
        this.ballInit();
        this.pad = myPad;
        this.padModel = myPad.getPadModel();
        this.init(ballSpeed);
    }

    init(ballSpeed) {
        this.ballSpeed = ballSpeed || 13;
        this.speedVertical = this.ballSpeed / Math.sqrt(2);
        this.speedHorizontal = this.ballSpeed / Math.sqrt(2);
    }
    
    ballInit() {
        this.ballModel = document.createElement('div');
        this.ballModel.style.cssText = `
            width: 20px;
            height: 20px;
            position: absolute;
            bottom: 50px;
            left: 50%;
            margin-left: -10px;
            background: ${Game.randomColorGen()}; /* fallback for old browsers */
            background: -webkit-linear-gradient(to left, ${Game.randomColorGen()} , ${Game.randomColorGen()});
            background: linear-gradient(to left, ${Game.randomColorGen()} , ${Game.randomColorGen()});
            border-radius: 50%;
            -webkit-box-shadow: 0px 0px 4px 0px rgba(0,0,0,0.5);
            -moz-box-shadow: 0px 0px 4px 0px rgba(0,0,0,0.5);
            box-shadow: 0px 0px 4px 0px rgba(0,0,0,0.5);
        `;

        document.body.appendChild(this.ballModel);
        return this.ballModel;
    }

    // ball logic
    move() {
        if(!gameIsStarted) {
            this.leftPosition = parseFloat(this.padModel.style.left) * 0.01 * document.body.clientWidth;
            this.bottomPosition = 50;
        }
        else if (gameIsStarted) {
            this.leftPosition = parseFloat(this.ballModel.style.left);
            this.bottomPosition = parseFloat(this.ballModel.style.bottom);

            this.leftPosition += this.speedHorizontal;
            this.bottomPosition += this.speedVertical;

            if (this.leftPosition > document.body.clientWidth - 10) {
                this.leftPosition = document.body.clientWidth - 10;
                this.speedHorizontal = -this.speedHorizontal;
                return;
            }
            if (this.leftPosition < 10) {
                this.leftPosition = 10;
                this.speedHorizontal = -this.speedHorizontal;
                return;
            }
            if (this.bottomPosition > document.body.clientHeight - 20) {
                this.bottomPosition = document.body.clientHeight - 20;
                this.speedVertical = -this.speedVertical;
                return;
            }
            if (this.bottomPosition < 5) {
                Game.gameOver();
                this.init();
                return;
            }

            // pad hit logic
            let playerClientRect = this.padModel.getBoundingClientRect();

            if (this.bottomPosition <= document.body.clientHeight - playerClientRect.top
                && this.leftPosition + 10 >= playerClientRect.left
                && this.leftPosition -10 <= playerClientRect.right) {
                let percentsOfPad = ((this.leftPosition - (this.padModel.offsetLeft + this.padModel.offsetWidth / 2)) / this.padModel.offsetWidth) * 1.5;
                this.speedHorizontal = percentsOfPad * this.ballSpeed;
                this.speedVertical = Math.sqrt(Math.pow(this.ballSpeed, 2) - Math.pow(this.speedHorizontal, 2));
                this.bottomPosition = document.body.clientHeight - playerClientRect.top + 5;

                this.padModel.style.cssText = `
                border-radius: 25px;
                width: 10%;
                height: 2%;
                position: absolute;
                bottom: 20px;
                left: -100%;
                margin-left: -5%;
                background: ${Game.randomColorGen()}; /* fallback for old browsers */
                background: -webkit-linear-gradient(to left, ${Game.randomColorGen()} , ${Game.randomColorGen()});
                background: linear-gradient(to left, ${Game.randomColorGen()} , ${Game.randomColorGen()});
                -webkit-box-shadow: 0px 0px 4px 0px rgba(0,0,0,0.5);
                -moz-box-shadow: 0px 0px 4px 0px rgba(0,0,0,0.5);
                box-shadow: 0px 0px 4px 0px rgba(0,0,0,0.5);
                `;

                return;
            }


            let menuText = document.getElementsByClassName('menu-text')[0];
            menuText.style.cssText = `
                color: ${Game.randomColorGen()};
            `;

            // brick hit logic       
            let ballModel = this.ballModel;

            for (let i = 0; i < bricksArray.length; i++) {
                let brickModel = bricksArray[i].brickModel;
                let brickModelLeft = brickModel.offsetLeft;
                let brickModelRight = brickModel.offsetLeft + brickModel.offsetWidth;
                let brickModelTop = brickModel.offsetTop;
                let brickModelBottom = brickModel.offsetTop + brickModel.offsetWidth;
                let ballCenterLeft = ballModel.offsetLeft + ballModel.offsetWidth / 2;
                let ballCenterTop = ballModel.offsetTop + ballModel.offsetHeight / 2;
                let ballCenterOffset = ballModel.offsetWidth * Math.sqrt(2) / 4;
                if(Game.collisionDetection(ballModel, brickModel)) {
                    if (ballCenterLeft + ballCenterOffset >= brickModelLeft + this.speedHorizontal * 2
                        && ballCenterLeft - ballCenterOffset <= brickModelRight + this.speedHorizontal * 2) {
                        this.speedVertical = -this.speedVertical;
                        this.bottomPosition += this.speedVertical * 2;
                        console.log('collided vertical');
                    } else if (ballCenterTop + ballCenterOffset >= brickModelTop + this.speedVertical * 2
                                && ballCenterTop - ballCenterOffset <= brickModelBottom - this.speedVertical * 2) {
                        this.speedHorizontal = -this.speedHorizontal;
                        this.leftPosition += this.speedHorizontal * 2;
                        console.log('collided horizontal');
                    } else {
                        this.speedHorizontal = -this.speedHorizontal;
                        this.speedVertical = -this.speedVertical;
                        this.leftPosition += this.speedHorizontal * 2;
                        this.bottomPosition += this.speedVertical * 2;
                        console.log('collided horizontal and vertical');
                    }

                    ballModel.style.cssText = `
                    width: 20px;
                    height: 20px;
                    position: absolute;
                    bottom: 50px;
                    left: 50%;
                    margin-left: -10px;
                    background: ${Game.randomColorGen()}; /* fallback for old browsers */
                    background: -webkit-linear-gradient(to left, ${Game.randomColorGen()} , ${Game.randomColorGen()});
                    background: linear-gradient(to left, ${Game.randomColorGen()} , ${Game.randomColorGen()});
                    border-radius: 50%;
                    -webkit-box-shadow: 0px 0px 4px 0px rgba(0,0,0,0.5);
                    -moz-box-shadow: 0px 0px 4px 0px rgba(0,0,0,0.5);
                    box-shadow: 0px 0px 4px 0px rgba(0,0,0,0.5);
                    `;

                    brickModel.style.display = 'none';
                    killedBricks++;
                    this.pad.killCounter++;

                    if (this.pad.killCounter === 4) {
                        this.pad.killCounter = 0;
                        this.ballSpeed += 2;
                    }

                    if (killedBricks >= bricksArray.length) {
                        Game.win();
                    }

                    break;
                }
            }
        }

        this.ballModel.style.left = this.leftPosition + 'px';
        this.ballModel.style.bottom = this.bottomPosition + 'px';
    }

    getPadModel() {
        return this.ballModel;
    }
}

// the brick
class Brick {

    constructor(x, y) {
        this.brickInit(x, y);
    }

    brickInit(x, y) {
        this.brickModel = document.createElement('div');
        this.brickModel.style.cssText = `\
            width: 3.9%;\
            height: 2.9%;\
            position: absolute;\
            margin-left: -10px;\
            background: ${Game.randomColorGen()}; /* fallback for old browsers */
            background: -webkit-linear-gradient(to top, ${Game.randomColorGen()} , ${Game.randomColorGen()});
            background: linear-gradient(to top, ${Game.randomColorGen()} , ${Game.randomColorGen()});
            -webkit-box-shadow: 0px 0px 4px 0px rgba(0,0,0,0.5);\
            -moz-box-shadow: 0px 0px 4px 0px rgba(0,0,0,0.5);\
            box-shadow: 0px 0px 4px 0px rgba(0,0,0,0.5);\
        `;
        this.brickModel.style.left =  x;
        this.brickModel.style.top =  y;

        let brickLayout = document.getElementById('brick');
        brickLayout.appendChild(this.brickModel);

        return this.brickModel;
    }
}

// extensible levels for future addons
class Level {

    static createLevel() {
        killedBricks = 0;
        if ( document.getElementById('brick') !== null) {
            document.getElementById('brick').textContent = '';
        }
        
        this.brickLayout = document.createElement('div');
        this.brickLayout.id = 'brick' 
        document.body.appendChild(this.brickLayout);
        this.bricksArray = [];
        let x = 0, y = '5%';
        let i = 0;
        let maxY = 35;
        while (parseFloat(y) <= maxY) {
            x = parseFloat(x) + 4 + '%';
            if (parseFloat(x) > 95) {
                x = '4%';
                y = parseFloat(y) + 3 + '%';
            }
            if (parseFloat(y) >= maxY) break;
            this.bricksArray[i] = new Brick(x, y);
            i++;
        }
        return this.bricksArray;
    }
}

// useful Game function composition class
class Game {
    
    // return random color
    static randomColorGen() {
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // return true if hit
    static collisionDetection(obj1, obj2) {
        return (obj1.offsetLeft <= obj2.offsetLeft + obj2.offsetWidth
            && obj1.offsetLeft + obj1.offsetWidth  >=  obj2.offsetLeft
            && obj1.offsetTop + obj1.offsetHeight >=  obj2.offsetTop
            && obj1.offsetTop <= obj2.offsetTop +  obj2.offsetHeight);
    }
    
    // set game start configurations
    static setupGameStart() {
        document.body.style.cursor = 'none';
        document.querySelector('.menu').style.display = 'none';
    }
    
    // gg
    static gameOver() {
        let menu = document.querySelector('.menu');
        gameIsStarted = false;
        isLost = true;
        document.body.style.cursor = '';
        menu.querySelector('.menu-text').innerHTML = `<span>Game Over</span><br>Mouse click to Restart<br>`;
        menu.style.display = '';
        bricksArray = Level.createLevel();
    }
    
    // yolo
    static win() {
        let menu = document.querySelector('.menu');
        gameIsStarted = false;
        document.body.style.cursor = '';
        if (!isLost) menu.querySelector('.menu-text').innerHTML = `<span>Game Over. You Win</span><br>Mouse click to Restart<br>`;
        menu.style.display = '';
        bricksArray = Level.createLevel();
    }
}

// init variables
let gameIsStarted;
let bricksArray;
let killedBricks = 0;
let killCounter = 0;
let isLost = false;

function startGame() {

    let player1 = new Pad(killCounter);
    let ball = new Ball(player1);
    let requestAnimationFrame;

    gameIsStarted = false;
    bricksArray = Level.createLevel();

    document.addEventListener('click', function() {
        gameIsStarted = true;
        Game.setupGameStart();
    });

    requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;

    function render() {
        player1.move();
        ball.move();
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

// start game
window.onload = startGame;