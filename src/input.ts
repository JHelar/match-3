import { getNodeAt, getSelectedNode } from "./helpers";
import { Board, Node, STATES } from "./types";
import { isSwapValid, isSwapMatching } from "./swapping";
import { swapTiles, toggleNodeSelected } from "./node";
import { swapTile } from "./tile";
import { STATE } from "./constants";

const trySwapTiles = (thisNode: Node, withNode: Node | undefined, board: Board) => {
    if(withNode && isSwapValid(thisNode, withNode)) {
        console.debug(`SWAP VALID: ${JSON.stringify(thisNode)} <=> ${JSON.stringify(withNode)}`);

        // Swap the tiles
        swapTiles(withNode, thisNode);

        if(isSwapMatching(thisNode, withNode, board)) {
            return true;
        } else {
            // Swap back the tiles
            swapTiles(withNode, thisNode);

            return false;
        }
    } else {
        return false;
    }
}

export const makeHandleUserClick = (board: Board) => (e: Event) => {
    if(e.target && (e.target as HTMLElement).classList.contains('node')) {
        const nodeElement = e.target as HTMLElement;
        const nodeIndex = nodeElement.dataset.nodeIndex;
        if(nodeIndex) {
            const node = getNodeAt(parseInt(nodeIndex), board);
            if(node) {
                const selectedNode = getSelectedNode(board);
                const didSwap = trySwapTiles(node, selectedNode, board);
                if(didSwap && selectedNode) {
                    // Set state to swapping
                    STATE.CURRENT = STATES.SWAPPING;

                    // Wait until animation done. Then set state
                    swapTile(selectedNode.tile, node.tile)
                        .then(() => {
                            STATE.CURRENT = STATES.MATCH;
                        })

                    toggleNodeSelected(selectedNode);
                } else {
                    if (selectedNode) toggleNodeSelected(selectedNode);
                    toggleNodeSelected(node);
                }
            }
        }
    }
}