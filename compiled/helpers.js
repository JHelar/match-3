import { COLORS, GAME_SIZE } from "./constants";
export const getRandomType = () => COLORS[(Math.random() * 4) | 0];
export const getNodeAt = (index, board) => board.reduce((node, nodeRow) => node || nodeRow.find(n => n.index === index), undefined);
export const getSelectedNode = (board) => board.reduce((node, nodeRow) => node || nodeRow.find(n => n.selected), undefined);
export const iterateNodes = (board, cb) => board.forEach((nodeRow, rowIndex) => nodeRow.forEach((node, columnIndex) => cb(node, rowIndex, columnIndex)));
export const filterUndefined = (item) => item ? true : false;
export const getClosestAboveNonEmptyNode = (node, board) => {
    let nextNode = getNodeAt(node.index - GAME_SIZE, board) || undefined;
    if (nextNode && nextNode.tile.type === 'empty')
        return getClosestAboveNonEmptyNode(nextNode, board);
    else if (nextNode) {
        return nextNode;
    }
    else {
        return undefined;
    }
};
//# sourceMappingURL=helpers.js.map