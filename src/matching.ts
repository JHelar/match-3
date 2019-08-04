import { Node, Board, MatchResult, TileSpecial, UserClickResult } from './types';
import { GAME_SIZE } from './constants';
import { getNodeAt, filterUndefined } from './helpers';

const isMatch = (node: Node) => (matched: boolean, matchNode: Node | undefined) => !matched || !matchNode ? false : matchNode.tile.type === node.tile.type;

export const getMatches = (node: Node, board: Board): MatchResult => {
    const matches: MatchResult = [];
    // Horizontal
    // Check exit condition for row
    if (node.tile.column + 2 < GAME_SIZE) {
        const matchRow = [
            node,
            getNodeAt(node.index + 1, board),
            getNodeAt(node.index + 2, board)
        ].filter(filterUndefined) as Node[]

        let special: TileSpecial | undefined = undefined;

        if (matchRow.length === 3 && matchRow.reduce(isMatch(node), true)) {
            const fourthNode = getNodeAt(node.index + 3, board);
            const fifthNode = getNodeAt(node.index + 4, board);

            if (fourthNode && fourthNode.tile.row === node.tile.row && [...matchRow, fourthNode].reduce(isMatch(node), true)) {
                matchRow.push(fourthNode);
                special = 'striped';

                if (fifthNode && fifthNode.tile.row === node.tile.row && [...matchRow, fifthNode].reduce(isMatch(node), true)) {
                    matchRow.push(fifthNode);
                    special = 'super';
                }
            }

            matches.push({
                nodes: matchRow,
                special        
            });
        }
    }
    // Vertical
    // Check exit condition for column
    if (node.tile.row + 2 < GAME_SIZE) {
        const matchColumn = [
            node,
            getNodeAt(node.index + 1 * GAME_SIZE, board),
            getNodeAt(node.index + 2 * GAME_SIZE, board)
        ].filter(filterUndefined) as Node[];

        let special: TileSpecial | undefined = undefined;

        if (matchColumn.length === 3 && matchColumn.reduce(isMatch(node), true)) {
            const fourthNode = getNodeAt(node.index + 3 * GAME_SIZE, board);
            const fifthNode = getNodeAt(node.index + 4 * GAME_SIZE, board);

            if (fourthNode && fourthNode.tile.column === node.tile.column && [...matchColumn, fourthNode].reduce(isMatch(node), true)) {
                matchColumn.push(fourthNode);
                special = 'striped';

                if (fifthNode && fifthNode.tile.column === node.tile.column && [...matchColumn, fifthNode].reduce(isMatch(node), true)) {
                    matchColumn.push(fifthNode);
                    special = 'super';
                }
            }

            matches.push({
                nodes: matchColumn,
                special
            });
        }
    }

    return matches;
}