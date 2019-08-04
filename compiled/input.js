import { getNodeAt, getSelectedNode, getNodeRowNumber, getNodeColumnNumber } from "./helpers";
import { STATES } from "./types";
import { isSwapValid, isSwapMatching } from "./swapping";
import { swapTiles, toggleNodeSelected } from "./node";
import { swapTile } from "./tile";
import { STATE } from "./constants";
const trySwapTiles = (thisNode, withNode, board) => {
    if (withNode && isSwapValid(thisNode, withNode)) {
        console.debug(`SWAP VALID: ${JSON.stringify(thisNode)} <=> ${JSON.stringify(withNode)}`);
        // Swap the tiles
        swapTiles(withNode, thisNode);
        if (isSwapMatching(thisNode, withNode, board)) {
            return true;
        }
        else {
            // Swap back the tiles
            swapTiles(withNode, thisNode);
            return false;
        }
    }
    else {
        return false;
    }
};
export const makeHandleUserClick = (board) => (e) => {
    if (e.target && e.target.classList.contains('node')) {
        const nodeElement = e.target;
        const nodeIndex = nodeElement.dataset.nodeIndex;
        if (nodeIndex) {
            const node = getNodeAt(parseInt(nodeIndex), board);
            if (node) {
                const selectedNode = getSelectedNode(board);
                const didSwap = trySwapTiles(node, selectedNode, board);
                if (didSwap && selectedNode) {
                    // Is the swap comming from above or from the side?
                    const selectedNodeRow = getNodeRowNumber(selectedNode);
                    const nodeRow = getNodeRowNumber(node);
                    const selectedNodeColumn = getNodeColumnNumber(selectedNode);
                    const nodeColumn = getNodeColumnNumber(node);
                    // Set state to swapping
                    STATE.CURRENT = STATES.SWAPPING;
                    // Wait until animation done. Then set state
                    swapTile(selectedNode.tile, node.tile)
                        .then(() => {
                        STATE.CURRENT = STATES.MATCH;
                    });
                    toggleNodeSelected(selectedNode);
                    return {
                        didSwap: true,
                        horizontalSwap: selectedNodeColumn !== nodeColumn,
                        verticalSwap: selectedNodeRow !== nodeRow,
                        selectedNode: node,
                        prevSelectedNode: selectedNode
                    };
                }
                else {
                    if (selectedNode)
                        toggleNodeSelected(selectedNode);
                    toggleNodeSelected(node);
                }
            }
        }
    }
    return {
        didSwap: false
    };
};
//# sourceMappingURL=input.js.map