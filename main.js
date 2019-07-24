const gameElement = document.getElementById('game');
const tileTemplate = document.getElementById('tile');

const GAME_SIZE = 8;
const TILE_SIZE = 50;
const FALLING_SPEED = 1;
const SWAP_SPEED = 0.5;


const colors = [
    'red',
    'green',
    'yellow',
    'blue'
]

const STATES = {
    INPUT: 'INPUT',
    MATCH: 'MATCH',
    DROP: 'DROP',
    DROPPING: 'DROPPING',
    SHUFFLE: 'SHUFFLE',
    SWAPPING: 'SWAPPING'
}

let state = (() => {
    let current = STATES.MATCH;
    return {
        get current() {
            return current;
        },
        set current(newState) {
            if (DEBUG) {
                console.log(`------------------------`);
                console.log('OLD STATE: %s', current);
                console.log('NEW STATE: %s', newState);
                console.log(`------------------------`);
            }
            current = newState;
        }
    }
})()
const DEBUG = true;

const getRandomType = () => colors[(Math.random() * 4) | 0];

const makeTile = (type, index, row, column) => {
    const element = tileTemplate.content.cloneNode(true).querySelector('.tile');
    element.dataset.tileType = type;
    element.innerHTML = DEBUG ? `${index}, (${column}, ${row})` : '';

    element.style.setProperty('--y', `${row * TILE_SIZE}px`);
    element.style.setProperty('--x', `${column * TILE_SIZE}px`)

    let animate = false;
    let animationDuration = (row + 1 / GAME_SIZE) * FALLING_SPEED;
    let selected = false;

    element.addEventListener('click', tileClickHandler(index))

    return {
        element,
        animationDuration,
        selected,
        animate,
        type,
        row,
        column
    }
}

const makeNode = (row, column, index) => {
    const tile = makeTile(getRandomType(), index, row, column);

    return {
        index,
        tile
    }
}


const printBoard = board => {
    board.forEach(nodeRow => nodeRow.forEach(node => gameElement.appendChild(node.tile.element)));
}

const getNodeAt = (index, board) => board.reduce((node, nodeRow) => node || nodeRow.find(n => n.index === index), undefined)
const getSelectedNode = board => board.reduce((node, nodeRow) => node || nodeRow.find(n => n.tile.selected), undefined);

const isMatch = node => (matched, matchNode) => !matched || !matchNode ? false : matchNode.tile.type === node.tile.type;

const getMatches = (node, board) => {
    const matches = []
    // Horizontal
    // Check exit condition for row
    if (node.tile.column + 2 < GAME_SIZE) {
        const matchRow = [
            node,
            getNodeAt(node.index + 1, board),
            getNodeAt(node.index + 2, board)
        ]
        if (matchRow.reduce(isMatch(node), true)) {
            const fourthNode = getNodeAt(node.index + 3, board);
            const fifthNode = getNodeAt(node.index + 4, board);

            if (fourthNode && fourthNode.tile.row === node.tile.row && [...matchRow, fourthNode].reduce(isMatch(node), true)) {
                matchRow.push(fourthNode);
                if (fifthNode && fifthNode.tile.row === node.tile.row && [...matchRow, fifthNode].reduce(isMatch(node), true)) {
                    matchRow.push(fifthNode);
                }
            }

            matches.push(matchRow);
        }
    }
    // Vertical
    // Check exit condition for column
    if (node.tile.row + 2 < GAME_SIZE) {
        const matchColumn = [
            node,
            getNodeAt(node.index + 1 * GAME_SIZE, board),
            getNodeAt(node.index + 2 * GAME_SIZE, board)
        ]
        if (matchColumn.reduce(isMatch(node), true)) {
            const fourthNode = getNodeAt(node.index + 3 * GAME_SIZE, board);
            const fifthNode = getNodeAt(node.index + 4 * GAME_SIZE, board);

            if (fourthNode && fourthNode.tile.column === node.tile.column && [...matchColumn, fourthNode].reduce(isMatch(node), true)) {
                matchColumn.push(fourthNode);
                if (fifthNode && fifthNode.tile.column === node.tile.column && [...matchColumn, fifthNode].reduce(isMatch(node), true)) {
                    matchColumn.push(fifthNode);
                }
            }

            matches.push(matchColumn);
        }
    }

    return matches;
}

const getClosestAboveNonEmptyNode = (node, board) => {
    let nextNode = getNodeAt(node.index - GAME_SIZE, board) || undefined;
    if (nextNode && nextNode.tile.type === 'empty') return getClosestAboveNonEmptyNode(nextNode, board);
    else if (nextNode) {
        return nextNode;
    } else {
        return undefined;
    }
}

const iterateNodes = (board, cb) => board.forEach((nodeRow, rowIndex) => nodeRow.forEach((node, columnIndex) => cb(node, rowIndex, columnIndex)))

const matchBoard = board => {
    const matches = new Set();
    iterateNodes(board, node => {
        getMatches(node, board).forEach(match => matches.add(match));
    });

    const hasMatches = matches.size > 0;

    matches.forEach(match => match.forEach(matchNode => matchNode.tile.type = 'empty'));

    return hasMatches;
}

const tileClickHandler = nodeIndex => evt => {
    if(state.current === STATES.INPUT) {
        const selectedNode = getSelectedNode(board);
        const thisNode = getNodeAt(nodeIndex, board);
    
        if(selectedNode && isSwapValid(thisNode, selectedNode, board)) {
            toggleTileSelected(selectedNode.index, board);

            const selectedTileOrigin = {...selectedNode.tile};
            const thisTileOrigin = {...thisNode.tile};

            swapTiles(selectedNode, thisNode); // Swap tiles.
            setTimeout(() => {
                setTileAnimate(selectedNode.tile, true);
                setTileAnimationDuration(selectedNode.tile, null, SWAP_SPEED);

                setTileAnimate(thisNode.tile, true);
                setTileAnimationDuration(thisNode.tile, null, SWAP_SPEED);

                setTilePosition(selectedNode.tile, thisTileOrigin.row, thisTileOrigin.column);
                setTilePosition(thisNode.tile, selectedTileOrigin.row, selectedTileOrigin.column);

                state.current = STATES.SWAPPING;
            }, 0);
            setTimeout(() => {
                state.current = STATES.MATCH; // Change state to match the swapped tiles.
            }, SWAP_SPEED * 1000);
        } else {
            if(selectedNode) toggleTileSelected(selectedNode.index, board);
            toggleTileSelected(nodeIndex, board)
        }
    }
}

const dropTile = (tile, fromRow, toRow) => {
    setTileAnimate(tile, false);
    setTilePosition(tile, fromRow);
    setTileAnimationDuration(tile, toRow);

    setTimeout(() => {
        setTileAnimate(tile, true);
        setTilePosition(tile, toRow);
        if (DEBUG) console.log(`TILE: ${JSON.stringify(tile)}`)
    }, 0);

    return new Promise(animationDoneResolver => setTimeout(() => {
        setTileAnimate(tile, false);
        animationDoneResolver();
    }, tile.animationDuration * 1000))
}

const toggleTileSelected = (nodeIndex, board) => {
    const node = getNodeAt(nodeIndex, board);

    if(node) {
        Object.assign(node.tile, {
            selected: !node.tile.selected
        })

        node.tile.element.dataset.tileSelected = node.tile.selected ? 'true' : 'false';

        if(DEBUG) console.log(`NODE SELECTED: ${JSON.stringify(node)}`)

        return node.tile;
    }
    
    return undefined;
}

const setTileAnimationDuration = (tile, newRow, duration) => {
    const animationDuration = duration || ((Math.abs(tile.row - newRow || 0) + 1) / GAME_SIZE) * FALLING_SPEED;
    return Object.assign(tile, {
        animationDuration
    })
}

const setTileAnimate = (tile, shouldAnimate) => {
    if (shouldAnimate) {
        tile.element.style.transitionDuration = `${tile.animationDuration}s`;
    } else {
        tile.element.style.transitionDuration = '0s';
    }
    return Object.assign(tile, {
        animate: shouldAnimate
    })
}

const setTileType = (tile, toType) => {
    tile.element.dataset.tileType = toType;
    return Object.assign(tile, {
        type: toType
    });
}

const setTilePosition = (tile, row, column) => {
    row = row !== null && row !== undefined ? row : tile.row;
    column = column !== null && column !== undefined ? column : tile.column;

    tile.element.style.setProperty('--y', `${row * TILE_SIZE}px`);
    tile.element.style.setProperty('--x', `${column * TILE_SIZE}px`);

    return Object.assign(tile, {
        row,
        column
    })
}

const swapTiles = (oneNode, anotherNode) => {
    const oneTile = oneNode.tile;
    oneNode.tile = anotherNode.tile;
    anotherNode.tile = oneTile;
}

const isSwapValid = (thisNode, withNode, board) => {
    if(!thisNode || !withNode) return false;

    const indexDiff = Math.abs(thisNode.index - withNode.index);
    const isThisNodeEdge = thisNode.tile.column === 0 || thisNode.tile.column === GAME_SIZE - 1;
    const isWithNodeEdge = withNode.tile.column === 0 || withNode.tile.column === GAME_SIZE - 1;
    if (
        (indexDiff === 1 || indexDiff === GAME_SIZE) &&
        (
            (!isThisNodeEdge && !isWithNodeEdge) || // None of them are edges
            (isThisNodeEdge && !isWithNodeEdge) || // If thisNode is on edge withNode cannot
            (!isThisNodeEdge && isWithNodeEdge) // If withNode is on edge thisNode cannot
        )
    ) {
        // Swap the tiles.
        swapTiles(thisNode, withNode);
        const matches = [...getMatches(thisNode, board), ...getMatches(withNode, board)];
        // Swap the tiles back.
        swapTiles(thisNode, withNode);
        return matches.length > 0;
    }
    return false;
}

const isDeadlocked = board => {
    let isDeadlocked = true;

    iterateNodes(board, node => {
        if(isDeadlocked) {
            isDeadlocked = ![
                getNodeAt(node.index + 1, board), // Horizontal node
                getNodeAt(node.index + 8, board) // Vertical node
            ]
            .map(swapNode => isSwapValid(node, swapNode, board))
            .some(canSwap => canSwap);
        }
    })
    return isDeadlocked;
}

const dropNewTiles = board => {
    // Reverse the board. Start from bottom row
    const boardCopy = [...board.map(column => [...column])];
    const droppingTiles = [];

    while (true) {
        let emptyCount = 0;
        iterateNodes(boardCopy.reverse(), node => {
            if (node.tile.type === 'empty') {
                const newNode = getClosestAboveNonEmptyNode(node, board);
                const originRow = node.tile.row;
                if (newNode) {
                    const newType = newNode.tile.type;
                    setTileType(newNode.tile, node.tile.type);
                    setTileType(node.tile, newType);
                    droppingTiles.push(dropTile(node.tile, newNode.tile.row, originRow))
                } else {
                    setTileType(node.tile, getRandomType());
                    // node.tile.row = node.tile.row - GAME_SIZE;
                    droppingTiles.push(dropTile(node.tile, node.tile.row - (GAME_SIZE - 1), originRow))
                }
                emptyCount++;
            }
        })
        if (emptyCount === 0) break;
    }

    return Promise.all(droppingTiles);
}

const gameLoop = () => {
    switch (state.current) {
        case STATES.DROP:
            state.current = STATES.DROPPING;
            dropNewTiles(board)
                .then(() => state.current = STATES.MATCH);
            break;
        case STATES.MATCH:
            const hasMatches = matchBoard(board);
            if (hasMatches) state.current = STATES.DROP;
            else if(isDeadlocked(board)) state.current = STATES.SHUFFLE;
            else state.current = STATES.INPUT
            break;
        case STATES.INPUT:
        default:
            break;
    }
    window.requestAnimationFrame(gameLoop)
}

const board = Array(GAME_SIZE).fill(0).map((n, row) => Array(GAME_SIZE).fill(0).map((m, column) => makeNode(row, column, row * GAME_SIZE + column)))

printBoard(board);

document.addEventListener('keyup', e => {
    if (e.which === 32) window.requestAnimationFrame(gameLoop);
})