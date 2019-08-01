import { COLORS, GAME_SIZE } from "./constants";
import { Board, Node, NodeIterationCallback } from "./types";

export const getRandomType = () => COLORS[(Math.random() * 4) | 0];

export const getNodeAt = (index: number, board: Board) => board.reduce<Node | undefined>((node, nodeRow) => node || nodeRow.find(n => n.index === index), undefined);
export const getSelectedNode = (board: Board) => board.reduce<Node | undefined>((node, nodeRow) => node || nodeRow.find(n => n.selected), undefined);
export const iterateNodes = (board: Board, cb: NodeIterationCallback) => board.forEach((nodeRow, rowIndex) => nodeRow.forEach((node, columnIndex) => cb(node, rowIndex, columnIndex)))
export const filterUndefined = <TItem>(item: TItem | undefined) => item ? true : false;

export const getClosestAboveNonEmptyNode = (node: Node, board: Board): Node | undefined => {
    let nextNode = getNodeAt(node.index - GAME_SIZE, board) || undefined;
    if (nextNode && nextNode.tile.type === 'empty') return getClosestAboveNonEmptyNode(nextNode, board);
    else if (nextNode) {
        return nextNode;
    } else {
        return undefined;
    }
}
