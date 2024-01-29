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
                    x: 64 * col + 65,
                    y: 24 * row + 35,
                })
            }
        }
    },
    update() {
        this.platform.move();
        this.ball.move()

    },
    run() {
        window.requestAnimationFrame(() => {
            this.update();
            this.render();
            this.run();
        })
    },
    render() {
        this.ctx.drawImage(this.sprites.background, 0, 0);
        this.ctx.drawImage(this.sprites.ball, 0, 0, this.ball.width, this.ball.height, this.ball.x, this.ball.y, this.ball.width, this.ball.height);
        this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
        this.renderBlocks();
    },
    renderBlocks() {
        for (let block of this.blocks) {
            this.ctx.drawImage(this.sprites.block, block.x, block.y);
        }
    },
    start() {
        this.init();
        this.preload(() => {
            this.create()
            this.run()
        });
    }
};
game.ball = {
    x: 320,
    y: 280,
    width: 20,
    height: 20,
    velocity: 3,
    dy: 0,
    start() {
        this.dy = -this.velocity
    },
    move() {
        if (this.dy) {
            this.y += this.dy
        }
    }
}

game.platform = {
    velocity: 6,
    dx: 0,
    x: 280,
    y: 300,
    ball: game.ball,
    fire() {
        this.ball.start();
        this.ball = null;
    },
    start(direction) {
        if (direction === KEYS.ARROW_LEFT || direction === KEYS.KEY_A) {
            this.dx = -this.velocity
            console.log(this.dx)
        } else if (direction === KEYS.ARROW_RIGHT || direction === KEYS.KEY_D) {
            this.dx = this.velocity
            console.log(this.dx)
        }
    },
    stop() {
        this.dx = 0;
    },
    move() {
        if (this.dx) {
            this.x += this.dx;
            if (this.ball){
                this.ball.x += this.dx;
            }
        }
    }
}


window.addEventListener('load', () => {
    game.start();
})
