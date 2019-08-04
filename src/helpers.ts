import { COLORS, GAME_SIZE } from "./constants";
import { Board, Node, NodeIterationCallback } from "./types";

export const getRandomType = () => COLORS[(Math.random() * 4) | 0];

export const getNodeAt = (index: number, board: Board) => board.reduce<Node | undefined>((node, nodeRow) => node || nodeRow.find(n => n.index === index), undefined);
export const getSelectedNode = (board: Board) => board.reduce<Node | undefined>((node, nodeRow) => node || nodeRow.find(n => n.selected), undefined);
export const getNodeRowFrom = (index: number, board: Board): Node[] => {
    const row: Node[] = [];
    const node = getNodeAt(index, board);
    if(!node) return row;

    const rowStartIndex = node.index === 0 ? 0 : getNodeRowNumber(node) * GAME_SIZE;
    const rowEndIndex = rowStartIndex + GAME_SIZE - 1;

    console.debug({
        node: node.index,
        rowStartIndex,
        rowEndIndex
    })


    for(let i = rowStartIndex; i <= rowEndIndex; i++) {
        const nextNode = getNodeAt(i, board);
        if(nextNode){
            row.push(nextNode);
        }
    }
    return row;
}
export const getNodeColumnFrom  = (index: number, board: Board): Node[] => {
    const column: Node[] = [];
    const node = getNodeAt(index, board);
    if(!node) return column;

    const columnStartIndex = getNodeColumnNumber(node);
    const columnEndIndex = columnStartIndex + ((GAME_SIZE * GAME_SIZE) - GAME_SIZE);

    console.debug({
        node: index,
        columnStartIndex,
        columnEndIndex
    })


    for(let i = columnStartIndex; i <= columnEndIndex; i+= GAME_SIZE) {
        const nextNode = getNodeAt(i, board);
        if(nextNode) {
            column.push(nextNode)
        }
    }

    return column;
}
export const getNodeRowNumber = (node: Node) => (node.index / GAME_SIZE) | 0;
export const getNodeColumnNumber = (node: Node) => node.index % GAME_SIZE;

export const iterateNodes = (board: Board, cb: NodeIterationCallback) => board.forEach((nodeRow, rowIndex) => nodeRow.forEach((node, columnIndex) => cb(node, rowIndex, columnIndex)))
export const filterUndefined = <TItem>(item: TItem | undefined) => item ? true : false;

export const getClosestAboveNonEmptyNode = (node: Node, board: Board): Node | undefined => {
    let nextNode = getNodeAt(node.index - GAME_SIZE, board) || undefined;
    if (nextNode && nextNode.tile.killed) return getClosestAboveNonEmptyNode(nextNode, board);
    else if (nextNode) {
        return nextNode;
    } else {
        return undefined;
    }
}
