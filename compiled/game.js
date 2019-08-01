import { STATES } from "./types";
import { STATE } from "./constants";
import { dropNewTiles, isDeadlocked, makeBoard, matchBoard } from "./board";
import { iterateNodes } from "./helpers";
import { gameElement } from "./elements";
import { makeHandleUserClick } from "./input";
export default () => {
    const board = makeBoard();
    const gameLoop = () => {
        switch (STATE.CURRENT) {
            case STATES.DROP:
                STATE.CURRENT = STATES.DROPPING;
                dropNewTiles(board)
                    .then(() => STATE.CURRENT = STATES.MATCH);
                break;
            case STATES.MATCH:
                STATE.CURRENT = STATES.MATCHING;
                matchBoard(board)
                    .then(hasMatches => {
                    if (hasMatches)
                        STATE.CURRENT = STATES.DROP;
                    else if (isDeadlocked(board))
                        STATE.CURRENT = STATES.SHUFFLE;
                    else
                        STATE.CURRENT = STATES.INPUT;
                });
                break;
            case STATES.INPUT:
            default:
                break;
        }
        if (STATE.CURRENT !== STATES.PAUSED)
            window.requestAnimationFrame(gameLoop);
    };
    if (!gameElement)
        throw new Error('No gameElement found!');
    // Append the board to the gameElement
    iterateNodes(board, node => {
        gameElement.appendChild(node.element);
        gameElement.appendChild(node.tile.element);
    });
    const handleUserClick = makeHandleUserClick(board);
    gameElement.addEventListener('click', e => {
        if (STATE.CURRENT === STATES.INPUT) {
            handleUserClick(e);
        }
    });
    return {
        start: () => {
            STATE.CURRENT = STATES.MATCH;
            window.requestAnimationFrame(gameLoop);
        },
        pause: () => {
            STATE.CURRENT = STATES.PAUSED;
        }
    };
};
//# sourceMappingURL=game.js.map