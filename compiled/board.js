import { GAME_SIZE } from "./constants";
import { makeNode } from "./node";
import { iterateNodes, getNodeAt, getClosestAboveNonEmptyNode, getRandomType, getNodeRowFrom, getNodeColumnFrom } from "./helpers";
import { isSwapValid } from "./swapping";
import { dropTile, setTileType, explodeTile, setTileSpecial, setTileKilled } from "./tile";
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
    boardCopy.reverse();
    const droppingTiles = [];
    const droppingNewTiles = [];
    const tilesToGenerate = [];
    while (true) {
        let emptyCount = 0;
        iterateNodes(boardCopy, node => {
            if (node.tile.killed) {
                const newNode = getClosestAboveNonEmptyNode(node, board);
                setTileKilled(node.tile, false);
                if (newNode) {
                    const originRow = node.tile.row;
                    const newType = newNode.tile.type;
                    const newSpecial = newNode.tile.special;
                    setTileKilled(newNode.tile, true);
                    setTileType(newNode.tile, node.tile.type);
                    setTileSpecial(newNode.tile, node.tile.special);
                    setTileType(node.tile, newType);
                    setTileSpecial(node.tile, newSpecial);
                    droppingTiles.push(dropTile(node.tile, newNode.tile.row, originRow));
                }
                else {
                    tilesToGenerate.push(node);
                }
                emptyCount++;
            }
        });
        if (emptyCount === 0)
            break;
    }
    // Generate new tiles for the empty nodes.
    tilesToGenerate.forEach(node => {
        setTileType(node.tile, getRandomType());
        droppingNewTiles.push(dropTile(node.tile, node.tile.row - (GAME_SIZE - 1), node.tile.row));
    });
    return Promise.all(droppingTiles)
        .then(() => Promise.all(droppingNewTiles));
};
export const matchBoard = (board, userClickResult) => {
    const matchNodes = new Set();
    const explodingTiles = [];
    const userNodeIndices = [
        userClickResult.prevSelectedNode && userClickResult.prevSelectedNode.index || -1,
        userClickResult.selectedNode && userClickResult.selectedNode.index || -1
    ];
    iterateNodes(board, node => {
        const isUserIteractedNode = userNodeIndices.some(userIndex => node.index === userIndex);
        getMatches(node, board).forEach(match => {
            console.debug({
                isUserIteractedNode,
                match
            });
            let matchSpecialAssigned = false;
            match.nodes.forEach((matchNode, matchIndex) => {
                if (!matchNode.tile.killed) {
                    matchNodes.add(matchNode);
                    if (match.special && !matchSpecialAssigned) {
                        if (isUserIteractedNode) {
                            if (matchNode.index === node.index) {
                                if (match.special === 'striped') {
                                    setTileSpecial(matchNode.tile, userClickResult.horizontalSwap ? 'striped-horizontal' : 'striped-vertical');
                                }
                                else {
                                    setTileSpecial(matchNode.tile, match.special);
                                }
                                matchSpecialAssigned = true;
                            }
                        }
                        else if (matchIndex === 0) {
                            if (match.special === 'striped') {
                                setTileSpecial(matchNode.tile, Math.random() > 0.5 ? 'striped-horizontal' : 'striped-vertical');
                            }
                            else {
                                setTileSpecial(matchNode.tile, match.special);
                            }
                            matchSpecialAssigned = true;
                        }
                    }
                    else {
                        explodingTiles.push(explodeTile(matchNode.tile));
                        if (matchNode.tile.special) {
                            switch (matchNode.tile.special) {
                                case 'striped-horizontal':
                                    explodeRowFrom(matchNode, board)
                                        .forEach(explodingTile => explodingTiles.push(explodingTile));
                                    break;
                                case 'striped-vertical':
                                    explodeColumnFrom(matchNode, board)
                                        .forEach(explodingTile => explodingTiles.push(explodingTile));
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }
            });
        });
    });
    const hasMatches = matchNodes.size > 0;
    return Promise.all(explodingTiles).then(() => hasMatches);
};
export const explodeRowFrom = (node, board) => {
    const explodingTiles = [];
    const explodingRow = getNodeRowFrom(node.index, board);
    console.debug({
        explodingRow
    });
    explodingRow.forEach(extraNode => {
        if (!extraNode.tile.killed) {
            explodingTiles.push(explodeTile(extraNode.tile));
        }
    });
    return explodingTiles;
};
export const explodeColumnFrom = (node, board) => {
    const explodingTiles = [];
    const explodingColumn = getNodeColumnFrom(node.index, board);
    console.debug({
        explodingColumn
    });
    explodingColumn.forEach(extraNode => {
        if (!extraNode.tile.killed) {
            explodingTiles.push(explodeTile(extraNode.tile));
        }
    });
    return explodingTiles;
};
//# sourceMappingURL=board.js.map