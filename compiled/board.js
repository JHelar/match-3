import { GAME_SIZE } from "./constants";
import { makeNode } from "./node";
import { iterateNodes, getNodeAt, getClosestAboveNonEmptyNode, getRandomType } from "./helpers";
import { isSwapValid } from "./swapping";
import { dropTile, setTileType, explodeTile, setTileSpecial } from "./tile";
import { getMatches } from "./matching";
export const makeBoard = () => Array(GAME_SIZE).fill(0).map((n, row) => Array(GAME_SIZE).fill(0).map((m, column) => makeNode(row, column, row * GAME_SIZE + column)));
export const isDeadlocked = (board) => {
    let isDeadlocked = true;
    iterateNodes(board, node => {
        if (isDeadlocked) {
            isDeadlocked = ![
                getNodeAt(node.index + 1, board),
                getNodeAt(node.index + 8, board) // Vertical node
            ]
                .map(swapNode => swapNode && isSwapValid(node, swapNode))
                .some(canSwap => canSwap ? true : false);
        }
    });
    return isDeadlocked;
};
export const dropNewTiles = (board) => {
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
                    const newSpecial = newNode.tile.special;
                    setTileType(newNode.tile, node.tile.type);
                    setTileSpecial(newNode.tile, node.tile.special);
                    setTileType(node.tile, newType);
                    setTileSpecial(node.tile, newSpecial);
                    droppingTiles.push(dropTile(node.tile, newNode.tile.row, originRow));
                }
                else {
                    setTileType(node.tile, getRandomType());
                    // node.tile.row = node.tile.row - GAME_SIZE;
                    droppingTiles.push(dropTile(node.tile, node.tile.row - (GAME_SIZE - 1), originRow));
                }
                emptyCount++;
            }
        });
        if (emptyCount === 0)
            break;
    }
    return Promise.all(droppingTiles);
};
export const matchBoard = (board) => {
    const matches = new Set();
    const explodingTiles = [];
    iterateNodes(board, node => {
        getMatches(node, board).forEach(match => matches.add(match));
    });
    const hasMatches = matches.size > 0;
    matches.forEach(match => match.nodes.forEach((matchNode, indx) => {
        if (match.special && indx === 0) {
            setTileSpecial(matchNode.tile, match.special);
        }
        else {
            explodingTiles.push(explodeTile(matchNode.tile));
            if (matchNode.tile.special) {
                switch (matchNode.tile.special) {
                    case 'striped':
                        explodingTiles.push(explodeRowFrom(matchNode, board));
                        explodingTiles.push(explodeColumnFrom(matchNode, board));
                        break;
                    default:
                        break;
                }
            }
        }
    }));
    return Promise.all(explodingTiles).then(() => hasMatches);
};
export const explodeRowFrom = (node, board) => {
    const explodingTiles = [];
    const rowStartIndex = node.index === 0 ? 0 : ((node.index / GAME_SIZE) * GAME_SIZE) | 0;
    const rowEndIndex = rowStartIndex + GAME_SIZE - 1;
    console.debug({
        rowStartIndex,
        rowEndIndex
    });
    for (let i = rowStartIndex; i <= rowEndIndex; i++) {
        const explodeNode = getNodeAt(i, board);
        if (explodeNode && explodeNode.tile.type !== 'empty') {
            explodingTiles.push(explodeTile(explodeNode.tile));
        }
    }
    return Promise.all(explodingTiles).then(() => undefined);
};
export const explodeColumnFrom = (node, board) => {
    const explodingTiles = [];
    const columnStartIndex = node.index % GAME_SIZE;
    const columnEndIndex = columnStartIndex + (GAME_SIZE * GAME_SIZE - GAME_SIZE);
    console.debug({
        columnStartIndex,
        columnEndIndex
    });
    for (let i = columnStartIndex; i <= columnEndIndex; i += GAME_SIZE) {
        const explodeNode = getNodeAt(i, board);
        if (explodeNode && explodeNode.tile.type !== 'empty') {
            explodingTiles.push(explodeTile(explodeNode.tile));
        }
    }
    return Promise.all(explodingTiles).then(() => undefined);
};
//# sourceMappingURL=board.js.map