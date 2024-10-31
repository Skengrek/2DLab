<script setup>
    import { Application, Graphics, Sprite} from 'pixi.js';
</script>

<template>
    <div id="pixi-container"></div>
    <div>{{ time }}ms</div>
    <button @click="randomizeGrid">Regenerate</button>
    <!-- <button @click="processTick">One Tick</button> -->
    <button @click="start">Start Ticker</button>
    <button @click="stop">Stop Ticker</button>
    <button @click="reset">Reset</button>
</template>

<script>

export default {
    data() {
        return {
            app: new Application(),
            // Container
            width: 512,
            height: 512,
            gridWidth: 256,
            gridHeight: 256,
            // Data
            data: new Uint32Array(),
            sprites: [],
            isSpriteCreated: false,
            time: 0,
            // Graphics
            liveColor: 0x00ff00,
            deadColor: 0x000000,
            runnning: false,
        }
    },
    async mounted(){
        await this.app.init({
            width: this.width,
            height: this.height
        })
        this.init()
        document.getElementById('pixi-container').appendChild(this.app.canvas)
        this.data = new Uint32Array((this.gridWidth * this.gridHeight) / 32)
        this.randomizeGrid()
    },
    methods: {
        init(){
            for (let y = 0; y < this.gridHeight; y++) {
                for (let x = 0; x < this.gridWidth; x++) {
                    const sprite = new Sprite(this.deadTexture);
                    sprite.x = x * this.cellSize;
                    sprite.y = y * this.cellSize;
                    this.app.stage.addChild(sprite);
                    this.sprites.push(sprite);
                }
            }
        },
        cellSize(){
            return this.width / this.gridWidth
        },
        gridSize(){
            return this.gridWidth * this.gridHeight
        },
        createCellTexture (color) {
            const cellGraphics = new Graphics();
            cellGraphics.rect(0, 0, this.cellSize, this.cellSize);
            cellGraphics.fill(color);
            return this.app.renderer.generateTexture(cellGraphics);
        },
        getCell(x, y){
            if (x < 0 || y < 0 || x >= this.gridWidth || y >= this.gridHeight) return 0;
            const index = y * this.gridWidth + x;
            const dataIndex = Math.floor(index / 32);
            const bitPosition = index % 32;
            return (this.data[dataIndex] & (1 << bitPosition)) !== 0 ? 1 : 0;
        },
        setCell(x, y, state) {
            const index = y * this.gridWidth + x;
            const dataIndex = Math.floor(index / 32);
            const bitPosition = index % 32;
            if (state) {
                this.data[dataIndex] |= 1 << bitPosition;
            } else {
                this.data[dataIndex] &= ~(1 << bitPosition);
            }
        },
        randomizeGrid() {
            for (let y = 0; y < this.gridHeight; y++) {
                for (let x = 0; x < this.gridWidth; x++) {
                    const state = Math.random() > 0.5 ? 1 : 0;
                    this.setCell(x, y, state);
                    this.sprites[y * this.gridWidth + x].texture = state ? this.liveTexture : this.deadTexture;
                }
            }
        },
        updateGrid () {
            const newGrid = new Uint32Array(this.data.length);
            for (let y = 0; y < this.gridHeight; y++) {
                for (let x = 0; x < this.gridWidth; x++) {
                    const index = y * this.gridWidth + x;
                    const currentState = this.getCell(x, y);

                    let liveNeighbors = 0;
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            if (i === 0 && j === 0) continue;
                            liveNeighbors += this.getCell(x + i, y + j);
                        }
                    }

                    const nextState = (currentState === 1 && (liveNeighbors === 2 || liveNeighbors === 3)) || (currentState === 0 && liveNeighbors === 3) ? 1 : 0;

                    const dataIndex = Math.floor(index / 32);
                    const bitPosition = index % 32;
                    if (nextState) {
                        newGrid[dataIndex] |= 1 << bitPosition;
                    } else {
                        newGrid[dataIndex] &= ~(1 << bitPosition);
                    }

                    if (nextState !== currentState) {
                        this.sprites[index].texture = nextState ? this.liveTexture : this.deadTexture;
                    }
                }
            }
            this.data.set(newGrid);
        },
        start() {
            this.running = true;
            this.app.ticker.add(this.updateGrid);
        },

        stop() {
            this.running = false;
            this.app.ticker.remove(this.updateGrid);
        },

        reset() {
            this.stop()
            for (let i = 0; i < this.data.length; i++) this.data[i] = 0
            this.sprites.forEach(sprite => (sprite.texture = this.deadTexture))
        },
    }
}
</script>
