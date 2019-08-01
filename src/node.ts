import { makeTile } from "./tile";
import { getRandomType } from "./helpers";
import { nodeTemplate } from "./elements";
import { Node } from './types';
import { DEBUG } from "./constants";

export const makeNode = (row: number, column: number, index: number): Node => {
    const tile = makeTile(row, column, getRandomType());
    
    if(!nodeTemplate) throw new Error('No nodetemplate found');
    const element = (nodeTemplate.content.cloneNode(true) as HTMLElement).querySelector<HTMLElement>('.node');
    if(!element) throw new Error('Cannot find ".node" in nodetemplate');

    element.dataset.nodeIndex = index.toString();
    element.innerHTML = DEBUG ? index.toString() : '';

    return {
        element,
        index,
        tile,
        selected: false
    }
}

export const swapTiles = (oneNode: Node, anotherNode: Node) => {
    const oneTile = {
        ...oneNode.tile
    };
    Object.assign(oneNode.tile, anotherNode.tile);
    Object.assign(anotherNode.tile, oneTile);
}

export const toggleNodeSelected = (node: Node | undefined) => {
    if (node) {
        Object.assign(node, {
            selected: !node.selected
        })

        node.element.dataset.nodeSelected = node.selected ? 'true' : 'false';
        if (node.selected) console.debug(`NODE SELECTED: ${JSON.stringify(node)}`)

        return node;
    }

    return undefined;
}