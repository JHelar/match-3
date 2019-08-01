import { makeTile } from "./tile";
import { getRandomType } from "./helpers";
import { nodeTemplate } from "./elements";
import { DEBUG } from "./constants";
export const makeNode = (row, column, index) => {
    const tile = makeTile(row, column, getRandomType());
    if (!nodeTemplate)
        throw new Error('No nodetemplate found');
    const element = nodeTemplate.content.cloneNode(true).querySelector('.node');
    if (!element)
        throw new Error('Cannot find ".node" in nodetemplate');
    element.dataset.nodeIndex = index.toString();
    element.innerHTML = DEBUG ? index.toString() : '';
    return {
        element,
        index,
        tile,
        selected: false
    };
};
export const swapTiles = (oneNode, anotherNode) => {
    const oneTile = Object.assign({}, oneNode.tile);
    Object.assign(oneNode.tile, anotherNode.tile);
    Object.assign(anotherNode.tile, oneTile);
};
export const toggleNodeSelected = (node) => {
    if (node) {
        Object.assign(node, {
            selected: !node.selected
        });
        node.element.dataset.nodeSelected = node.selected ? 'true' : 'false';
        if (node.selected)
            console.debug(`NODE SELECTED: ${JSON.stringify(node)}`);
        return node;
    }
    return undefined;
};
//# sourceMappingURL=node.js.map