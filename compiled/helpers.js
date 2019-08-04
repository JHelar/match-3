import { COLORS, GAME_SIZE } from "./constants";
export const getRandomType = () => COLORS[(Math.random() * 4) | 0];
export const getNodeAt = (index, board) => board.reduce((node, nodeRow) => node || nodeRow.find(n => n.index === index), undefined);
export const getSelectedNode = (board) => board.reduce((node, nodeRow) => node || nodeRow.find(n => n.selected), undefined);
export const getNodeRowFrom = (index, board) => {
    const row = [];
    const node = getNodeAt(index, board);
    if (!node)
        return row;
    const rowStartIndex = node.index === 0 ? 0 : getNodeRowNumber(node) * GAME_SIZE;
    const rowEndIndex = rowStartIndex + GAME_SIZE - 1;
    console.debug({
        node: node.index,
        rowStartIndex,
        rowEndIndex
    });
    for (let i = rowStartIndex; i <= rowEndIndex; i++) {
        const nextNode = getNodeAt(i, board);
        if (nextNode) {
            row.push(nextNode);
        }
    }
    return row;
};
export const getNodeColumnFrom = (index, board) => {
    const column = [];
    const node = getNodeAt(index, board);
    if (!node)
        return column;
    const columnStartIndex = getNodeColumnNumber(node);
    const columnEndIndex = columnStartIndex + ((GAME_SIZE * GAME_SIZE) - GAME_SIZE);
    console.debug({
        node: index,
        columnStartIndex,
        columnEndIndex
    });
    for (let i = columnStartIndex; i <= columnEndIndex; i += GAME_SIZE) {
        const nextNode = getNodeAt(i, board);
        if (nextNode) {
            column.push(nextNode);
        }
    }
    return column;
};
export const getNodeRowNumber = (node) => (node.index / GAME_SIZE) | 0;
export const getNodeColumnNumber = (node) => node.index % GAME_SIZE;
export const iterateNodes = (board, cb) => board.forEach((nodeRow, rowIndex) => nodeRow.forEach((node, columnIndex) => cb(node, rowIndex, columnIndex)));
export const filterUndefined = (item) => item ? true : false;
export const getClosestAboveNonEmptyNode = (node, board) => {
    let nextNode = getNodeAt(node.index - GAME_SIZE, board) || undefined;
    if (nextNode && nextNode.tile.killed)
        return getClosestAboveNonEmptyNode(nextNode, board);
    else if (nextNode) {
        return nextNode;
    }
    else {
        return undefined;
    }
};
//# sourceMappingURL=helpers.js.map