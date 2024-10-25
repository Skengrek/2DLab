<script setup>
    import { Graphics, Application, Ticker } from 'pixi.js';
</script>

<template>
    <div id="pixi-container"></div>
    <button @click="regeneratGrid">Regenerate</button>
    <button @click="appTicker.start">Start Ticker</button>
    <button @click="appTicker.stop">Stop Ticker</button>
</template>

<script>

export default {
    data() {
        return {
            app: new Application(),
            graph: new Graphics(),
            appTicker: Ticker.shared,
            tick: 0,
            grid: []
        }
    },
    async mounted(){
        await this.app.init({ width: 800, height: 600, forceCanvas: true })
        document.getElementById('pixi-container').appendChild(this.app.canvas);
        this.regeneratGrid()
    },
    methods: {
        initGrid(){
            this.grid = []
            for (let x=0; x<80;x++){
                this.grid[x] = []
                for (let y=0; y<80; y++){
                    this.grid[x][y] = {
                        value: Math.random() > 0.7
                    }
                }
            }

        },
        initTicker(){
            this.appTicker.autoStart = false
            this.appTicker.add(this.processTick)
        },

        regeneratGrid(){
            this.initGrid()
            this.renderRect()
            this.initTicker()
        },
        renderRect() {
            this.graph.clear()
            for (let x in this.grid){
                for (let y in this.grid[x]){
                    if (this.grid[x][y].value){
                        this.graph.rect(x*10, y*10, 10, 10);
                    }
                }
            }
            this.graph.fill(0x00a3af);
            this.graph.x = 0;
            this.graph.y = 0;
            this.app.stage.addChild(this.graph);
        },
        processTick(){
            this.graph.clear()
            var newGrid = []
            for (let x in this.grid){
                newGrid[x] = []
                for (let y in this.grid[x]){
                    var sumAlive = this.countAliveNeighboor(x, y)
                    var newValue = false
                    if (this.grid[x][y].value){
                        if (sumAlive===2){newValue = true}
                        if (sumAlive===3){newValue = true}
                    }
                    else {
                        if (sumAlive===3){newValue = true}
                    }
                    newGrid[x][y] = {value: newValue}
                    if (newGrid[x][y].value){
                        this.graph.rect(x*10, y*10, 10, 10);
                    }
                }
            }
            this.grid = newGrid
            this.graph.fill(0x00a3af);
        },
        countAliveNeighboor(x, y){
            let sumAlive = 0
            let previousX = x - 1
            if (previousX<0){previousX=this.grid.length-1}
            let previousY = y - 1
            if (previousY<0){previousY=this.grid[x].length-1}

            let nextX = parseInt(x)+1
            if (nextX>this.grid.length-1){nextX=0}
            let nextY = parseInt(y)+1
            if (nextY>this.grid[x].length-1){nextY=0}
            if (this.grid[previousX][previousY].value){
                sumAlive++
            }
            if (this.grid[previousX][y].value){
                sumAlive++
            }
            if (this.grid[previousX][nextY].value){
                sumAlive++
            }
            if (this.grid[x][previousY].value){
                sumAlive++
            }
            if (this.grid[x][nextY].value){
                sumAlive++
            }
            if (this.grid[nextX][previousY].value){
                sumAlive++
            }
            if (this.grid[nextX][y].value){
                sumAlive++
            }
            if (this.grid[nextX][nextY].value){
                sumAlive++
            }
            return sumAlive
        }
    }

}
</script>
