let game = {
    ctx: null,
    platform: null,
    ball: null,
    sprites: {
        background: null,
        ball: null,
        platform: null,
        block: null,
    },
    init() {
        this.ctx = document.getElementById('myCanvas').getContext('2d');
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
    run() {
        window.requestAnimationFrame(() => {
            this.render();
        })
    },
    render() {
        this.ctx.drawImage(this.sprites.background, 0, 0);
        this.ctx.drawImage(this.sprites.ball, 0, 0, this.ball.width, this.ball.height, this.ball.x, this.ball.y, this.ball.width, this.ball.height);
        this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
        this.ctx.drawImage(this.sprites.block,0,0);
    },
    start() {
        this.init();
        this.preload(() => {
            this.run()
        });
    }
};
game.platform = {
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
