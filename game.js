const KEYS = {
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    KEY_A: 'KeyA',
    KEY_D: 'KeyD',
    SPACE: 'Space',
}

let game = {
    ctx: null,
    platform: null,
    ball: null,
    blocks: [],
    rows: 4,
    cols: 8,
    width: 640,
    height: 360,
    defX: 0,
    defY: 0,
    running: true,
    score: 0,
    scoreX:10,
    scoreY:20,
    sprites: {
        background: null,
        ball: null,
        platform: null,
        block: null,
    },
    sounds: {
        bump: null,
    },
    init() {
        this.ctx = document.getElementById('myCanvas').getContext('2d');
        this.setEvents();
        this.setTextFont();
    },
    setTextFont(){
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '18px Arial'
    },
    setEvents() {
        let spacePressed = false;
        window.addEventListener('keydown', (event) => {
            if (event.code === KEYS.SPACE && !spacePressed) {
                spacePressed = true;
                this.platform.fire();
            } else if (event.code === KEYS.ARROW_LEFT || event.code === KEYS.KEY_A || event.code === KEYS.ARROW_RIGHT || event.code === KEYS.KEY_D) {
                this.platform.start(event.code)
            }
        });
        window.addEventListener('keyup', () => {
            this.platform.stop()
        })
    },
    preload(callback) {
        let loaded = 0;
        let required = Object.keys(this.sprites).length;
        required += Object.keys(this.sounds).length;

        const onResourceLoad = () => {
            ++loaded;
            if (loaded >= required) {
                callback();
            }
        }
        this.preloadSprites(onResourceLoad);
        this.preloadSounds(onResourceLoad);

    },
    preloadSprites(onResourceLoad) {
        for (let key in this.sprites) {
            this.sprites[key] = new Image();
            this.sprites[key].src = `image/${key}.png`;
            this.sprites[key].addEventListener('load', onResourceLoad);
        }
    },
    preloadSounds(onResourceLoad) {
        for (let key in this.sounds) {
            this.sounds[key] = new Audio(`sounds/${key}.mp3`);
            this.sounds[key].addEventListener('canplaythrough', onResourceLoad, {once: true});
        }
    },

    create() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.blocks.push({
                    active: true,
                    width: 60,
                    height: 20,
                    x: 64 * col + 65,
                    y: 24 * row + 35,
                })
            }
        }
    },
    update() {
        this.collideBlocks();
        this.collidePlatform();
        this.ball.collideWorldBounds();
        this.platform.collideWorldPlatform();
        this.platform.move();
        this.ball.move();

    },
    addScore() {
        ++this.score;
        if (this.score >= this.blocks.length) {
            this.end("You're won")
        }
    },
    collideBlocks() {
        for (let block of this.blocks) {
            if (block.active && this.ball.collide(block)) {
                this.ball.bumpBlock(block)
                this.addScore();
                this.sounds.bump.play();
            }
        }
    },
    collidePlatform() {
        if (this.ball.collide(this.platform)) {
            this.ball.bumpPlatform(this.platform)
            this.sounds.bump.play();
        }
    },
    run() {
        if (this.running) {
            window.requestAnimationFrame(() => {
                this.update();
                this.render();
                this.run();
            })
        }
    },

    render() {
        this.ctx.clearRect(game.defX, game.defY, game.width, game.height)
        this.ctx.drawImage(this.sprites.background, game.defX, game.defY);
        this.ctx.drawImage(this.sprites.ball, this.ball.frame * this.ball.width , game.defY, this.ball.width, this.ball.height, this.ball.x, this.ball.y, this.ball.width, this.ball.height);
        this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
        this.renderBlocks();

        this.ctx.fillText(`Score: ${this.score}`,this.scoreX,this.scoreY);
    },
    renderBlocks() {
        for (let block of this.blocks) {
            if (block.active) {
                this.ctx.drawImage(this.sprites.block, block.x, block.y);
            }
        }
    },
    start() {
        this.init();
        this.preload(() => {
            this.create()
            this.run()
        });
    },
    end(message) {
        this.running = false;
        alert(message);
        window.location.reload();
    },
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    },

};
game.ball = {
    x: 320,
    y: 280,
    width: 20,
    height: 20,
    velocity: 3,
    dy: 0,
    dx: 0,
    frame: 0,
    start() {
        this.dy = -this.velocity;
        this.dx = game.random(-this.velocity, this.velocity);
        this.animate();
    },
    move() {
        if (this.dy) {
            this.y += this.dy
        }
        if (this.dx) {
            this.x += this.dx
        }
    },
    animate(){
        setInterval(()=>{
        ++this.frame;
        if (this.frame > 3){
            this.frame = 0;
        }
    },100)},
    collide(element) {
        const x = this.x + this.dx;
        const y = this.y + this.dy;

        return x + this.width > element.x &&
            x < element.x + element.width &&
            y + this.height > element.y &&
            y < element.y + element.height;
    },
    bumpBlock(block) {
        this.dy *= -1;
        block.active = false;

    },
    bumpPlatform(platform) {
        if (platform.dx) {
            this.x += platform.dx;
        }
        if (this.dy > 0) {
            let touchX = this.x + this.width / 2;
            this.dy = -this.velocity;
            this.dx = this.velocity * platform.getTouchOffset(touchX)
        }
    },

    collideWorldBounds() {
        let x = this.x + this.dx;
        let y = this.y + this.dy;

        const ballLeft = x;
        const ballRight = ballLeft + this.width;
        const ballTop = y;
        const ballBottom = ballTop + this.height

        const worldLeft = 0;
        const worldRight = game.width
        const worldTop = 0;
        const worldBottom = game.height;

        if (ballLeft < worldLeft) {
            this.x = 0;
            this.dx = this.velocity
            game.sounds.bump.play();
        } else if (ballRight > worldRight) {
            this.x = worldRight - this.width;
            this.dx = -this.velocity;
            game.sounds.bump.play();
        } else if (ballTop < worldTop) {
            this.y = 0;
            this.dy = this.velocity
            game.sounds.bump.play();
        } else if (ballBottom > worldBottom) {
            game.end("Game Over")
        }
    }
}

game.platform = {
    velocity: 6,
    dx: 0,
    x: 280,
    y: 300,
    width: 100,
    height: 14,
    ball: game.ball,
    fire() {
        this.ball.start();
        this.ball = null;
    },
    start(direction) {
        if (direction === KEYS.ARROW_LEFT || direction === KEYS.KEY_A) {
            this.dx = -this.velocity
        } else if (direction === KEYS.ARROW_RIGHT || direction === KEYS.KEY_D) {
            this.dx = this.velocity
        }
    },
    stop() {
        this.dx = 0;
    },
    move() {
        if (this.dx) {
            this.x += this.dx;
            if (this.ball) {
                this.ball.x += this.dx;
            }
        }
    },
    getTouchOffset(x) {
        const diff = (this.x + this.width) - x;
        const offset = this.width - diff;
        return (2 * offset / this.width) - 1

    },
    collideWorldPlatform() {
        const platformLeft = this.x + this.dx;
        const platformRight = platformLeft + this.width;

        const worldLeft = 0;
        const worldRight = game.width;

        if (platformLeft < worldLeft || platformRight > worldRight) {
            this.dx = 0;
        }

    }
}


window.addEventListener('load', () => {
    game.start();
})
