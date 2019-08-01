import { tileTemplate } from "./elements";
import { DEBUG, TILE_SIZE, TILE_OFFSET, GAME_SIZE, FALLING_SPEED, SWAP_SPEED, EXPLODE_SPEED } from "./constants";
export const makeTile = (row, column, type = 'empty') => {
    if (!tileTemplate)
        throw new Error('No tiletemplate found!');
    const element = tileTemplate.content.cloneNode(true).querySelector('.tile');
    if (!element)
        throw new Error('Cannot find ".tile" in tiletemplate');
    element.dataset.tileType = type;
    element.innerHTML = DEBUG ? `(${column}, ${row})` : '';
    element.style.setProperty('--y', `${row * TILE_SIZE + (TILE_OFFSET + row * TILE_OFFSET * 2)}px`);
    element.style.setProperty('--x', `${column * TILE_SIZE + (TILE_OFFSET + column * TILE_OFFSET * 2)}px`);
    let animate = false;
    let animationDuration = (row + 1 / GAME_SIZE) * FALLING_SPEED;
    return {
        element,
        animationDuration,
        animate,
        type,
        row,
        column,
        special: undefined
    };
};
export const explodeTile = (tile) => {
    tile.element.dataset.tileExplode = 'true';
    setTileAnimate(tile, true);
    setTileAnimationDuration(tile, undefined, EXPLODE_SPEED);
    return new Promise(res => {
        setTimeout(() => {
            setTileAnimate(tile, false);
            setTileSpecial(tile);
            tile.element.dataset.tileExplode = 'false';
            tile.type = 'empty';
            res();
        }, EXPLODE_SPEED * 1000);
    });
};
export const setTileAnimationDuration = (tile, newRow, duration) => {
    const animationDuration = duration || ((Math.abs(tile.row - newRow || 0) + 1) / GAME_SIZE) * FALLING_SPEED;
    return Object.assign(tile, {
        animationDuration
    });
};
export const setTileAnimate = (tile, shouldAnimate) => {
    if (shouldAnimate) {
        tile.element.style.transitionDuration = `${tile.animationDuration}s`;
    }
    else {
        tile.element.style.transitionDuration = '0s';
    }
    return Object.assign(tile, {
        animate: shouldAnimate
    });
};
export const setTileType = (tile, toType) => {
    tile.element.dataset.tileType = toType;
    return Object.assign(tile, {
        type: toType
    });
};
export const setTileSpecial = (tile, special) => {
    tile.element.dataset.tileSpecial = special;
    return Object.assign(tile, {
        special
    });
};
export const setTilePosition = (tile, row, column) => {
    row = row !== null && row !== undefined ? row : tile.row;
    column = column !== null && column !== undefined ? column : tile.column;
    tile.element.style.setProperty('--y', `${row * TILE_SIZE + (TILE_OFFSET + row * TILE_OFFSET * 2)}px`);
    tile.element.style.setProperty('--x', `${column * TILE_SIZE + (TILE_OFFSET + column * TILE_OFFSET * 2)}px`);
    return Object.assign(tile, {
        row,
        column
    });
};
export const dropTile = (tile, fromRow, toRow) => {
    setTileAnimate(tile, false);
    setTilePosition(tile, fromRow, undefined);
    setTileAnimationDuration(tile, toRow, undefined);
    setTimeout(() => {
        setTileAnimate(tile, true);
        setTilePosition(tile, toRow, undefined);
    }, 0);
    return new Promise(animationDoneResolver => setTimeout(() => {
        setTileAnimate(tile, false);
        animationDoneResolver();
    }, tile.animationDuration * 1000));
};
export const swapTile = (oneTile, withTile) => {
    const oneTileCopy = Object.assign({}, oneTile);
    setTileAnimationDuration(withTile, undefined, SWAP_SPEED);
    setTileAnimate(withTile, true);
    setTileAnimationDuration(oneTile, undefined, SWAP_SPEED);
    setTileAnimate(oneTile, true);
    setTilePosition(oneTile, withTile.row, withTile.column);
    setTilePosition(withTile, oneTileCopy.row, oneTileCopy.column);
    return new Promise(res => {
        setTimeout(() => {
            res();
        }, SWAP_SPEED * 1000);
    });
};
//# sourceMappingURL=tile.js.map