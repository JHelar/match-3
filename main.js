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

const getRandomType = () => colors[(Math.random() * 4) | 0]; 

const makeTile = (type, index, row, column) => {
    const element = tileTemplate.content.cloneNode(true).querySelector('.tile');
    element.dataset.tileType = type;
    element.innerHTML = `${index}, (${row}, ${column})`;
    return {
        element,
        set type(newType) {
            type = newType;
            element.dataset.tileType = newType;
        },
        get type() {
            return type;
        }
    }
}

const makeNode = (row, column, index) => {
    const tile = makeTile(getRandomType(), index, row, column);

    return {
        index,
        get row(){
            return row;
        },
        set row(newRow) {
            row = newRow;
            tile.element.style.setProperty('--y', newRow * TILE_SIZE);
        },
        get column(){
            return column;
        },
        set column(newColumn) {
            column = newColumn;
            tile.element.style.setProperty('--x', newColumn * TILE_SIZE);
        },
        tile,
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
    if (node.column + 2 < GAME_SIZE) {
        const matchRow = [
            getNodeAt(node.index + 1, board),
            getNodeAt(node.index + 2, board)
        ]
        if (matchRow.reduce(isMatch(node), true)) {
            const fourthNode = getNodeAt(node.index + 3, board);
            const fifthNode = getNodeAt(node.index + 4, board);

            if (fourthNode && fourthNode.row === node.row && [...matchRow, fourthNode].reduce(isMatch(node), true)) {
                matchRow.push(fourthNode);
                if (fifthNode && fifthNode.row === node.row && [...matchRow, fourthNode, fifthNode].reduce(isMatch(node), true)) {
                    matchRow.push(fifthNode);
                }
            }

            matches.push([node, ...matchRow]);
        }
    }
    // Vertical
    // Check exit condition for column
    if(node.row + 2 < GAME_SIZE) {
        const matchColumn = [
            getNodeAt(node.index + 1 * GAME_SIZE, board),
            getNodeAt(node.index + 2 * GAME_SIZE, board)
        ]
        if(matchColumn.reduce(isMatch(node), true)) {
            const fourthNode = getNodeAt(node.index + 3 * GAME_SIZE, board);
            const fifthNode = getNodeAt(node.index + 4 * GAME_SIZE, board);
            
            if (fourthNode && fourthNode.column === node.column && [...matchColumn, fourthNode].reduce(isMatch(node), true)) {
                matchColumn.push(fourthNode);
                if (fifthNode && fifthNode.column === node.column && [...matchColumn, fourthNode, fifthNode].reduce(isMatch(node), true)) {
                    matchColumn.push(fifthNode);
                }
            }

            matches.push([node, ...matchColumn]);
        }
    }

    return matches;
}

const getClosestAboveNonEmptyNode = (node, board) => {
    let nextNode = node.index && getNodeAt(node.index - GAME_SIZE, board) || undefined;
    if(nextNode && nextNode.tile.type === 'empty') return getClosestAboveNonEmptyNode(nextNode, board);
    else if(nextNode) {
        return nextNode;
    } else {
        return undefined;
    }
}

const iterateNodes = (board, cb) => board.forEach((nodeRow, rowIndex) => nodeRow.forEach((node, columnIndex) => cb(node, rowIndex, columnIndex)))

const matchBoard = board => {
    iterateNodes(board, node => {
        const matches = getMatches(node, board);
        matches.forEach(match => match.forEach(matchNode => matchNode.tile.type = 'empty'))    
    })
}

const dropNewTiles = board => {
    // Reverse the board. Start from bottom row
    iterateNodes([...board].reverse(), node => {
        if(node.tile.type === 'empty') {
            const newNode = getClosestAboveNonEmptyNode(node, board);
            if(newNode) {
                // Switch tile type and row
                const newType = newNode.tile.type;
                const newRow = newNode.row;
                const newIndex = newNode.index;
                const newColumn = newNode.column;

                newNode.tile.type = node.tile.type;
                newNode.row = node.row;

                node.tile.type = newType;
                node.row = newRow;
                
            } else {
                // Create a new type for tile
                node.tile.type = getRandomType();
            }
        }
    })
}

const board = Array(GAME_SIZE).fill(0).map((n, column) => Array(GAME_SIZE).fill(0).map((m, row) => makeNode(row, column, column * GAME_SIZE + row)))

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