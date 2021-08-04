let game = new Phaser.Game(480, 320, Phaser.CANVAS, null, {
    preload: preload, create: create, update: update
});

let ball;
let paddle;
let bricks;
let newBrick;
let brickInfo;
let scoreText;
let score = 0;
let scoreIncrement = 10;
let lives = 3;
let livesText;
let lifeLostText;
let textStyle = {font: '18px Arial', fill: '#0095DD'};
let playing = false;
let startButton;

function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.stage.backgroundColor = '#eee';
    game.load.image('paddle', 'img/paddle.png');
    game.load.image('brick', 'img/brick.png');
    game.load.spritesheet('ball', 'img/wobble.png', 20, 20);
    game.load.spritesheet('button', 'img/button.png', 120, 40);
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.checkCollision.down = false;
    ball = game.add.sprite(game.world.width * 0.5, game.world.height - 25, 'ball');
    ball.animations.add('wobble', [0, 1, 0, 2, 0, 1, 0, 2, 0], 24);
    ball.anchor.set(0.5);
    game.physics.enable(ball, Phaser.Physics.ARCADE);
    ball.body.collideWorldBounds = true;
    ball.body.bounce.set(1);
    ball.checkWorldBounds = true;
    ball.events.onOutOfBounds.add(ballLeaveScreen, this);
    paddle = game.add.sprite(game.world.width * 0.5, game.world.height - 5, 'paddle');
    paddle.anchor.set(0.5, 1);
    game.physics.enable(paddle, Phaser.Physics.ARCADE);
    paddle.body.immovable = true;
    initBricks();
    scoreText = game.add.text(5, 5, 'Points: 0', textStyle);
    livesText = game.add.text(game.world.width - 5, 5, 'Lives: ' + lives, textStyle);
    livesText.anchor.set(1, 0);
    lifeLostText = game.add.text(game.world.width * 0.5, game.world.height * 0.5, 'Life lost, click to continue', {
        font: '18px Arial',
        fill: '#0095DD'
    });
    lifeLostText.anchor.set(0.5);
    lifeLostText.visible = false;
    startButton = game.add.button(game.world.width * 0.5, game.world.height * 0.5, 'button', startGame, this, 10, 0, 2);
    startButton.anchor.set(0.5);
}

function update() {
    game.physics.arcade.collide(ball, paddle, ballHitPaddle);
    game.physics.arcade.collide(ball, bricks, ballHitBrick);
    if (playing) {
        paddle.x = game.input.x || game.world.width * 0.5;
    }
}

function initBricks() {
    brickInfo = {
        width: 50,
        height: 20,
        count: {
            row: 3,
            col: 7
        },
        offset: {
            top: 50,
            left: 60
        },
        padding: 10
    }
    bricks = game.add.group();
    for (let c = 0; c < brickInfo.count.col; c++) {
        for (let r = 0; r < brickInfo.count.row; r++) {
            let brickX = c * (brickInfo.width + brickInfo.padding) + brickInfo.offset.left;
            let brickY = r * (brickInfo.height + brickInfo.padding) + brickInfo.offset.top;
            newBrick = game.add.sprite(brickX, brickY, 'brick');
            game.physics.enable(newBrick, Phaser.Physics.ARCADE);
            newBrick.body.immovable = true;
            newBrick.anchor.set(0.5);
            bricks.add(newBrick);
        }
    }
}

function ballHitBrick(ball, brick) {
    let killTween = game.add.tween(brick.scale);
    killTween.to({x: 0, y: 0}, 200, Phaser.Easing.Linear.None);
    killTween.onComplete.addOnce(function () {
        brick.kill();
    }, this);
    killTween.start();

    score += scoreIncrement;
    scoreText.setText('Points: ' + score);

    if (score == bricks.children.length * scoreIncrement) {
        alert('You won!');
        location.reload();
    }
}

function ballHitPaddle(ball, paddle) {
    ball.animations.play('wobble');
    ball.body.velocity.x = -5 * (paddle.x - ball.x);
}

function ballLeaveScreen() {
    lives--;
    if (lives) {
        livesText.setText('Lives: ' + lives);
        lifeLostText.visible = true;
        playing = false;
        ball.reset(game.world.width * 0.5, game.world.height - 25);
        paddle.reset(game.world.width * 0.5, game.world.height - 5);
        game.input.onDown.addOnce(function () {
            playing = true;
            lifeLostText.visible = false;
            ball.body.velocity.set(150, -150);
        }, this);
    } else {
        alert('You lost, game over!');
        location.reload();
    }
}

function startGame() {
    startButton.destroy();
    ball.body.velocity.set(150, -150);
    playing = true;
}
