import { Board, Node, MatchSet } from "./types";
import { getNodeAt, filterUndefined } from "./helpers";
import { GAME_SIZE } from "./constants";
import { getMatches } from "./matching";

const getPotentialNodes = (node: Node, board: Board): Node[] => {
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
    .filter(filterUndefined) as Node[];
}

const checkEdgeCase = (thisNode: Node, withNode: Node) => {
    return thisNode.tile.column === 0 && withNode.tile.column !== GAME_SIZE - 1 ||
    thisNode.tile.column === GAME_SIZE - 1 && withNode.tile.column !== 0;
}

export const isSwapValid = (thisNode: Node, withNode: Node) => {
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

export const isSwapMatching = (thisNode: Node, withNode: Node, board: Board) => {
    // Potential matches for both nodes
    const selectedPotentialNodes = getPotentialNodes(withNode, board);
    const thisPotentialNodes = getPotentialNodes(thisNode, board);
    
    const matches = [
        ...selectedPotentialNodes,
        ...thisPotentialNodes
    ]
    .reduce<MatchSet[]>((acc: MatchSet[], pNode) => [...acc, ...getMatches(pNode, board)], [])
    
    return matches.length > 0;
}