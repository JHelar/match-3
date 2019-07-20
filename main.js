const gameElement = document.getElementById('game');
const tileTemplate = document.getElementById('tile');

const GAME_SIZE = 8;

const colors = [
    'red',
    'green',
    'yellow',
    'blue'
]

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

const makeNode = (row, column, index) => ({
    index,
    row,
    column,
    tile: makeTile(getRandomType(), index, row, column),
})


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
            const forthNode = getNodeAt(node.index + 3, board);
            const fifthNode = getNodeAt(node.index + 4, board);

            if (forthNode && forthNode.row === node.row && [...matchRow, forthNode].reduce(isMatch(node), true)) {
                matchRow.push(forthNode);
                if (fifthNode && fifthNode.row === node.row && [...matchRow, forthNode, fifthNode].reduce(isMatch(node), true)) {
                    matchRow.push(fifthNode);
                }
            }

            matches.push([node, ...matchRow]);
        }
    }
    if(node.row + 2 < GAME_SIZE) {
        const matchColumn = [
            getNodeAt(node.index + 1 * GAME_SIZE, board),
            getNodeAt(node.index + 2 * GAME_SIZE, board)
        ]
        if(matchColumn.reduce(isMatch(node), true)) {
            const forthNode = getNodeAt(node.index + 3 * GAME_SIZE, board);
            const fifthNode = getNodeAt(node.index + 4 * GAME_SIZE, board);
            
            if (forthNode && forthNode.column === node.column && [...matchColumn, forthNode].reduce(isMatch(node), true)) {
                matchColumn.push(forthNode);
                if (fifthNode && fifthNode.column === node.column && [...matchColumn, forthNode, fifthNode].reduce(isMatch(node), true)) {
                    matchColumn.push(fifthNode);
                }
            }

            matches.push([node, ...matchColumn]);
        }
    }

    return matches;
}

const getClosestAboveNonEmptyNode = (node, board) => {
    let nextNode = node.index && getNodeAt(node.index / GAME_SIZE, board) || undefined;
    if(nextNode && nextNode.tile.type === 'empty') return getClosestAboveNonEmptyNode(nextNode);
    else if(nextNode) {
        return nextNode;
    } else {
        return undefined;
    }
}

const matchBoard = board => {
    board.forEach((nodeRow, rowIndex) => {
        nodeRow.forEach((node, columnIndex) => {
            const matches = getMatches(node, board);
            matches.forEach(match => match.forEach(matchNode => matchNode.tile.type = 'empty'))
        })
    })
}

const dropNewTiles = board => {
    
}

const board = Array(GAME_SIZE).fill(0).map((n, row) => Array(GAME_SIZE).fill(0).map((m, column) => makeNode(row, column, row * GAME_SIZE + column)))

printBoard(board);