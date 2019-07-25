const gameElement = document.getElementById('game');
const tileTemplate = document.getElementById('tile');
const nodeTemplate = document.getElementById('node');

const GAME_SIZE = 8;
const TILE_SIZE = 50;
const NODE_SIZE = 58;
const TILE_OFFSET = (NODE_SIZE - TILE_SIZE) / 2;

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

const DEBUG = false;

console.debug = (() => {
    let messageCounter = 0;
    return function () {
        if (DEBUG) {
            console.log(`-----------${messageCounter}----------`);
            console.log(...arguments);
            console.log(`-----------${messageCounter}----------`);
            messageCounter++;
        }
    }
})()

let state = (() => {
    let current = STATES.MATCH;
    return {
        get current() {
            return current;
        },
        set current(newState) {
            console.debug('OLD STATE: %s \nNEW STATE: %s', current, newState);
            current = newState;
        }
    }
})()

const getRandomType = () => colors[(Math.random() * 4) | 0];

const makeTile = (type, index, row, column) => {
    const element = tileTemplate.content.cloneNode(true).querySelector('.tile');
    element.dataset.tileType = type;
    element.innerHTML = DEBUG ? `${index}, (${column}, ${row})` : '';

    element.style.setProperty('--y', `${row * TILE_SIZE + (TILE_OFFSET + row * TILE_OFFSET * 2)}px`);
    element.style.setProperty('--x', `${column * TILE_SIZE + (TILE_OFFSET + column * TILE_OFFSET * 2)}px`);

    let animate = false;
    let animationDuration = (row + 1 / GAME_SIZE) * FALLING_SPEED;

    return {
        element,
        animationDuration,
        animate,
        type,
        row,
        column
    }
}

const makeNode = (row, column, index) => {
    const tile = makeTile(getRandomType(), index, row, column);
    const element = nodeTemplate.content.cloneNode(true).querySelector('.node');
    element.dataset.nodeIndex = index;

    return {
        index,
        tile,
        element,
        selected: false
    }
}


const setupGame = board => {
    iterateNodes(board, node => {
        gameElement.appendChild(node.element);
        gameElement.appendChild(node.tile.element);
    })
    gameElement.addEventListener('click', e => {
        if(state.current === STATES.INPUT) {
            if (e.target.classList.contains('node')) {
                const nodeIndex = e.target.dataset.nodeIndex;
                if (nodeIndex !== undefined) selectNode(nodeIndex | 0, board);
            }
        }
    })

    // Start gameLoop
    window.requestAnimationFrame(gameLoop);
}

const getNodeAt = (index, board) => board.reduce((node, nodeRow) => node || nodeRow.find(n => n.index === index), undefined)
const getSelectedNode = board => board.reduce((node, nodeRow) => node || nodeRow.find(n => n.selected), undefined);

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

const getPotentialNodes = (node, board) => {
    const right1 = getNodeAt(node.index + 1, board);
    const right2 = getNodeAt(node.index + 2, board);
    const left1 = getNodeAt(node.index - 1, board);
    const left2 = getNodeAt(node.index - 2, board);
    const up1 = getNodeAt(node.index - GAME_SIZE, board);
    const up2 = getNodeAt(node.index - GAME_SIZE * 2, board);
    const down1 = getNodeAt(node.index + GAME_SIZE, board);
    const down2 = getNodeAt(node.index + GAME_SIZE * 2, board);

    return [
        node,
        right1,
        right2,
        left1,
        left2,
        up1,
        up2,
        down1,
        down2
    ]
    .filter(pNode => pNode ? true : false)
}

const selectNode = (nodeIndex, board) => {
    const selectedNode = getSelectedNode(board);
    const thisNode = getNodeAt(nodeIndex, board);

    if (selectedNode && isSwapValid(thisNode, selectedNode, board)) {
        toggleNodeSelected(selectedNode);

        console.debug(`SWAP VALID: ${JSON.stringify(thisNode)} <=> ${JSON.stringify(selectedNode)}`);

        // Swap the tiles
        swapTiles(selectedNode, thisNode);

        // Potential matches for both nodes
        const selectedPotentialNodes = getPotentialNodes(selectedNode, board);
        const thisPotentialNodes = getPotentialNodes(thisNode, board);
        
        const matches = [
            ...selectedPotentialNodes,
            ...thisPotentialNodes
        ]
        .reduce((acc, pNode) => acc.concat(getMatches(pNode, board)), [])

        // Check matches
        console.debug(`MATCHES FOR SWAP: ${[...matches].length}`);
        if (matches.length) {
            // Make a postion swap
            const thisTileCopy = {
                ...thisNode.tile
            }

            setTileAnimationDuration(selectedNode.tile, null, SWAP_SPEED);
            setTileAnimate(selectedNode.tile, true);

            setTileAnimationDuration(thisNode.tile, null, SWAP_SPEED);
            setTileAnimate(thisNode.tile, true);

            setTilePosition(thisNode.tile, selectedNode.tile.row, selectedNode.tile.column);
            setTilePosition(selectedNode.tile, thisTileCopy.row, thisTileCopy.column);

            // Set state to swapping
            state.current = STATES.SWAPPING

            // Wait until animation done. Then set state
            setTimeout(() => {
                state.current = STATES.MATCH
            }, SWAP_SPEED * 1000);

        } else {
            // No matches for the swap, select the new node.
            toggleNodeSelected(thisNode);

            // Swap back the tiles
            swapTiles(selectedNode, thisNode);
        }
    } else {
        if (selectedNode) toggleNodeSelected(selectedNode);
        toggleNodeSelected(thisNode)
    }
}

const dropTile = (tile, fromRow, toRow) => {
    setTileAnimate(tile, false);
    setTilePosition(tile, fromRow);
    setTileAnimationDuration(tile, toRow);

    setTimeout(() => {
        setTileAnimate(tile, true);
        setTilePosition(tile, toRow);
        console.debug(`TILE: ${JSON.stringify(tile)}`)
    }, 0);

    return new Promise(animationDoneResolver => setTimeout(() => {
        setTileAnimate(tile, false);
        animationDoneResolver();
    }, tile.animationDuration * 1000))
}

const toggleNodeSelected = node => {
    if (node) {
        Object.assign(node, {
            selected: !node.selected
        })

        node.element.dataset.nodeSelected = node.selected ? 'true' : 'false';
        if (node.selected) console.debug(`NODE SELECTED: ${JSON.stringify(node)}`)

        return node;
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

    tile.element.style.setProperty('--y', `${row * TILE_SIZE + (TILE_OFFSET + row * TILE_OFFSET * 2)}px`);
    tile.element.style.setProperty('--x', `${column * TILE_SIZE + (TILE_OFFSET + column * TILE_OFFSET * 2)}px`);

    return Object.assign(tile, {
        row,
        column
    })
}

const swapTiles = (oneNode, anotherNode) => {
    const oneTile = {
        ...oneNode.tile
    };
    Object.assign(oneNode.tile, anotherNode.tile);
    Object.assign(anotherNode.tile, oneTile);
}

const checkEdgeCase = (thisNode, withNode) => {
    return thisNode.tile.column === 0 && withNode.tile.column !== GAME_SIZE - 1 ||
    thisNode.tile.column === GAME_SIZE - 1 && withNode.tile.column !== 0;
}

const isSwapValid = (thisNode, withNode) => {
    if (!thisNode || !withNode) return false;

    const indexDiff = Math.abs(thisNode.index - withNode.index);
    const isThisNodeEdge = thisNode.tile.column === 0 || thisNode.tile.column === GAME_SIZE - 1;
    const isWithNodeEdge = withNode.tile.column === 0 || withNode.tile.column === GAME_SIZE - 1;

    const thisNodeEdgeCase = checkEdgeCase(thisNode, withNode);
    const withNodeEdgeCase = checkEdgeCase(withNode, thisNode);

    if (
        (indexDiff === 1 || indexDiff === GAME_SIZE) &&
        (
            (!isThisNodeEdge && !isWithNodeEdge) || // None of them are edges
            (thisNodeEdgeCase || withNodeEdgeCase) // Both edge cases need to be true
        )
    ) {
        return true;
    }
    return false;
}

const isDeadlocked = board => {
    let isDeadlocked = true;

    iterateNodes(board, node => {
        if (isDeadlocked) {
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
            else if (isDeadlocked(board)) state.current = STATES.SHUFFLE;
            else state.current = STATES.INPUT
            break;
        case STATES.INPUT:
        default:
            break;
    }
    window.requestAnimationFrame(gameLoop)
}

const board = Array(GAME_SIZE).fill(0).map((n, row) => Array(GAME_SIZE).fill(0).map((m, column) => makeNode(row, column, row * GAME_SIZE + column)))

setupGame(board);