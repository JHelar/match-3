import { STATES } from "./types";
export const DEBUG = true;
export const GAME_SIZE = 8;
export const TILE_SIZE = 50;
export const NODE_SIZE = 58;
export const TILE_OFFSET = (NODE_SIZE - TILE_SIZE) / 2;
export const FALLING_SPEED = .75;
export const SWAP_SPEED = 0.5;
export const EXPLODE_SPEED = 0.25;
export const COLORS = [
    'red',
    'green',
    'yellow',
    'blue'
];
export const STATE = (() => {
    let current = STATES.PAUSED;
    return {
        get CURRENT() {
            return current;
        },
        set CURRENT(newState) {
            console.debug('OLD STATE: %s \nNEW STATE: %s', current, newState);
            current = newState;
        }
    };
})();
//# sourceMappingURL=constants.js.map