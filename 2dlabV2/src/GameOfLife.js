import * as PIXI from 'pixi.js';
const width = 512;
const height = 512;
const gridWidth = 256;
const gridHeight = 256;
const cellSize = width / gridWidth;
const gridSize = gridWidth * gridHeight;

(async() => {
    const app = new PIXI.Application();
    await app.init({
        // resizeTo: window,
        width: width,
        height: height,
        backgroundAlpha: 0.5,
    });
    // app.canvas.style.position = 'absolute';
    document.body.appendChild(app.canvas);

    // Prepare textures
    const liveColor = 0x00ff00;
    const deadColor = 0x000000;

    const createCellTexture = (color) => {
        const cellGraphics = new PIXI.Graphics();
        cellGraphics.rect(0, 0, cellSize, cellSize);
        cellGraphics.fill(color);
        return app.renderer.generateTexture(cellGraphics);
    };

    const liveTexture = createCellTexture(liveColor);
    const deadTexture = createCellTexture(deadColor);

    const data = new Uint32Array((gridWidth * gridHeight) / 32);

    const sprites = [];
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const sprite = new PIXI.Sprite(deadTexture);
            sprite.x = x * cellSize;
            sprite.y = y * cellSize;
            app.stage.addChild(sprite);
            sprites.push(sprite);
        }
    }

    const getCell = (x, y) => {
        if (x < 0 || y < 0 || x >= gridWidth || y >= gridHeight) return 0;
        const index = y * gridWidth + x;
        const dataIndex = Math.floor(index / 32);
        const bitPosition = index % 32;
        return (data[dataIndex] & (1 << bitPosition)) !== 0 ? 1 : 0;
    };

    const setCell = (x, y, state) => {
        const index = y * gridWidth + x;
        const dataIndex = Math.floor(index / 32);
        const bitPosition = index % 32;
        if (state) {
            data[dataIndex] |= 1 << bitPosition;
        } else {
            data[dataIndex] &= ~(1 << bitPosition);
        }
    };

    const randomizeGrid = () => {
        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                const state = Math.random() > 0.5 ? 1 : 0;
                setCell(x, y, state);
                sprites[y * gridWidth + x].texture = state ? liveTexture : deadTexture;
            }
        }
    };

    const updateGrid = () => {
        const newGrid = new Uint32Array(data.length);
        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                const index = y * gridWidth + x;
                const currentState = getCell(x, y);

                let liveNeighbors = 0;
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue;
                        liveNeighbors += getCell(x + i, y + j);
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
                    sprites[index].texture = nextState ? liveTexture : deadTexture;
                }
            }
        }
        data.set(newGrid);
    };

    let running = false;

    const start = () => {
        running = true;
        app.ticker.add(updateGrid);
    };

    const stop = () => {
        running = false;
        app.ticker.remove(updateGrid);
    };

    const resetGrid = () => {
        stop();
        for (let i = 0; i < data.length; i++) data[i] = 0;
        sprites.forEach(sprite => (sprite.texture = deadTexture));
    };

    const randomizeButton = document.createElement('button');
    randomizeButton.innerText = 'Randomize';
    randomizeButton.onclick = () => randomizeGrid();
    document.body.appendChild(randomizeButton);

    const startButton = document.createElement('button');
    startButton.innerText = 'Start';
    startButton.onclick = () => start();
    document.body.appendChild(startButton);

    const stopButton = document.createElement('button');
    stopButton.innerText = 'Stop';
    stopButton.onclick = () => stop();
    document.body.appendChild(stopButton);

    const resetButton = document.createElement('button');
    resetButton.innerText = 'Reset';
    resetButton.onclick = () => resetGrid();
    document.body.appendChild(resetButton);
    randomizeGrid();
})();