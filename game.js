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
            if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
                this.platform.dx = -this.platform.velocity;
            } else if (event.code === 'ArrowRight' || event.code === 'KeyD') {
                this.platform.dx = this.platform.velocity;
            }
        });
        window.addEventListener('keyup', (event) => {
            this.platform.dx = 0;
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
        if (this.platform.dx) {
            this.platform.x += this.platform.dx;
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
game.platform = {
    velocity: 6,
    dx: 0,
    x: 280,
    y: 300,
}
game.ball = {
    x: 320,
    y: 280,
    width: 20,
    height: 20
}


window.addEventListener('load', () => {
    game.start();
})
