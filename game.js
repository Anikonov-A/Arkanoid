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
    sprites: {
        background: null,
        ball: null,
        platform: null,
        block: null,
    },
    init() {
        this.ctx = document.getElementById('myCanvas').getContext('2d');
        this.setEvents();
    },
    setEvents() {
        window.addEventListener('keydown', (event) => {
            if (event.code === KEYS.SPACE) {
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
        const required = Object.keys(this.sprites).length;
        const onImageLoad = () => {
            ++loaded;
            if (loaded >= required) {
                callback();
            }
        }
        for (let key in this.sprites) {
            this.sprites[key] = new Image();
            this.sprites[key].src = `image/${key}.png`;
            this.sprites[key].addEventListener('load', onImageLoad);
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
        this.ball.collideWorldBounds()
        this.platform.move();
        this.ball.move()

    },
    collideBlocks() {
        for (let block of this.blocks) {
            if (block.active && this.ball.collide(block)) {
                this.ball.bumpBlock(block)
            }
        }
    },
    collidePlatform() {
        if (this.ball.collide(this.platform)) {
            this.ball.bumpPlatform(this.platform)
        }
    },
    run() {
        window.requestAnimationFrame(() => {
            this.update();
            this.render();
            this.run();
        })
    },
    render() {
        this.ctx.clearRect(game.defX, game.defY, game.width, game.height)
        this.ctx.drawImage(this.sprites.background, game.defX, game.defY);
        this.ctx.drawImage(this.sprites.ball, game.defX, game.defY, this.ball.width, this.ball.height, this.ball.x, this.ball.y, this.ball.width, this.ball.height);
        this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
        this.renderBlocks();
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

    start() {
        this.dy = -this.velocity;
        this.dx = game.random(-this.velocity, this.velocity);
    },
    move() {
        if (this.dy) {
            this.y += this.dy
        }
        if (this.dx) {
            this.x += this.dx
        }
    },
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
        } else if (ballRight > worldRight) {
            this.x = worldRight - this.width;
            this.dx = -this.velocity;
        } else if (ballTop < worldTop) {
            this.y =0;
            this.dy = this.velocity
        } else if (ballBottom > worldBottom) {
            console.log('Game Over')
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
}


window.addEventListener('load', () => {
    game.start();
})
