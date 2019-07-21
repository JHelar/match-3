const gameElement = document.getElementById('game');
const tileTemplate = document.getElementById('tile');

const GAME_SIZE = 8;
const TILE_SIZE = 50;

const colors = [
    'red',
    'green',
    'yellow',
    'blue'
]

const STATES = {
    INPUT: 'INPUT',
    MATCH: 'MATCH',
    DROP: 'DROP'
}

let STATE = STATES.MATCH;
const DEBUG = false;

const getRandomType = () => colors[(Math.random() * 4) | 0]; 

const makeTile = (type, index, row, column) => {
    const element = tileTemplate.content.cloneNode(true).querySelector('.tile');
    element.dataset.tileType = type;
    element.innerHTML = DEBUG ? `${index}, (${column}, ${row})` : '';

    element.style.setProperty('--y', `${row * TILE_SIZE}px`);
    element.style.setProperty('--x', `${column * TILE_SIZE}px`)

    let animate = false;
    let animationDuration = (row + 1 / GAME_SIZE) * 1;

    return {
        element,
        get animate(){
            return animate;
        },
        set animate(shouldAnimate) {
            if(shouldAnimate) {
                element.style.transitionDuration = '.25s';
            } else {
                element.style.transitionDuration = '0s';
            }
            animate = shouldAnimate;
        },
        set type(newType) {
            type = newType;
            element.dataset.tileType = newType;
        },
        get type() {
            return type;
        },
        get row(){
            return row;
        },
        set row(newRow) {
            row = newRow;
            element.style.setProperty('--y', `${newRow * TILE_SIZE}px`);
        },
        get column(){
            return column;
        },
        set column(newColumn) {
            column = newColumn;
            element.style.setProperty('--x', `${newColumn * TILE_SIZE}px`);
        },
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
    if(node.tile.row + 2 < GAME_SIZE) {
        const matchColumn = [
            node,
            getNodeAt(node.index + 1 * GAME_SIZE, board),
            getNodeAt(node.index + 2 * GAME_SIZE, board)
        ]
        if(matchColumn.reduce(isMatch(node), true)) {
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
    if(nextNode && nextNode.tile.type === 'empty') return getClosestAboveNonEmptyNode(nextNode, board);
    else if(nextNode) {
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
    })
    matches.forEach(match => match.forEach(matchNode => matchNode.tile.type = 'empty'))    
}

const dropNewTiles = board => {
    // Reverse the board. Start from bottom row
    const boardCopy = [...board.map(column => [...column])];
    while(true) {
        let emptyCount = 0;
        iterateNodes(boardCopy.reverse(), node => {
            if(node.tile.type === 'empty') {
                const newNode = getClosestAboveNonEmptyNode(node, board);
                const originRow = node.tile.row;
                node.tile.animate = false;

                if(newNode) {
                    const newType = newNode.tile.type;

                    newNode.tile.type = node.tile.type;
                    node.tile.type = newType;
                    node.tile.row = newNode.tile.row;
                } else {
                    node.tile.type = getRandomType();
                    node.tile.row = (TILE_SIZE * -1) - TILE_SIZE * node.tile.row;
                }

                setTimeout(() => {
                    node.tile.animate = true;
                    node.tile.row = originRow;
                }, 0);

                emptyCount++;
            }
        })
        if(emptyCount === 0) break; 
    }
}

const board = Array(GAME_SIZE).fill(0).map((n, row) => Array(GAME_SIZE).fill(0).map((m, column) => makeNode(row, column, row * GAME_SIZE + column)))

printBoard(board);

document.addEventListener('keyup', e => {
    if(e.which === 32) {
        switch (STATE) {
            case STATES.DROP:
                dropNewTiles(board);
                STATE = STATES.MATCH;
                break;
            case STATES.MATCH:
                matchBoard(board);
                STATE = STATES.DROP;
                break;
            default:
                break;
        }
    }
})