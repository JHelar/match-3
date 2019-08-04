import { Tile, TileType, TileSpecial } from "./types";
import { tileTemplate } from "./elements";
import { DEBUG, TILE_SIZE, TILE_OFFSET, GAME_SIZE, FALLING_SPEED, SWAP_SPEED, EXPLODE_SPEED } from "./constants";

export const makeTile = (row: number, column: number, type: TileType = 'empty'): Tile => {
    if(!tileTemplate) throw new Error('No tiletemplate found!');
    const element = (tileTemplate.content.cloneNode(true) as HTMLElement).querySelector<HTMLElement>('.tile');

    if(!element) throw new Error('Cannot find ".tile" in tiletemplate');
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
        special: undefined,
        killed: false
    }
}

export const explodeTile = (tile: Tile): Promise<undefined> => {
    setTileKilled(tile, true);
    setTileAnimate(tile, true);
    setTileAnimationDuration(tile, undefined, EXPLODE_SPEED);
    tile.element.dataset.tileExplode = 'true';
    return new Promise(res => {
        setTimeout(() => {
            setTileAnimate(tile, false);
            setTileSpecial(tile);
            tile.element.dataset.tileExplode = 'false';
            setTileType(tile, 'empty');
            res();
        }, EXPLODE_SPEED * 1000);
    })
}

export const setTileAnimationDuration = (tile: Tile, newRow: number | undefined, duration: number | undefined): Tile => {
    const animationDuration = duration || ((Math.abs(tile.row - (newRow || 0)) + 1) / GAME_SIZE) * FALLING_SPEED;
    return Object.assign(tile, {
        animationDuration
    })
}

export const setTileAnimate = (tile: Tile, shouldAnimate: boolean): Tile => {
    if (shouldAnimate) {
        tile.element.style.transitionDuration = `${tile.animationDuration}s`;
    } else {
        tile.element.style.transitionDuration = '0s';
    }
    return Object.assign(tile, {
        animate: shouldAnimate
    })
}

export const setTileType = (tile: Tile, toType: TileType): Tile => {
    tile.element.dataset.tileType = toType;
    return Object.assign(tile, {
        type: toType
    });
}

export const setTileKilled = (tile: Tile, killed: boolean) => {
    return Object.assign(tile, {
        killed
    })
}

export const setTileSpecial = (tile: Tile, special?: TileSpecial) => {
    tile.element.dataset.tileSpecial = special;
    return Object.assign(tile, {
        special
    })
}

export const setTilePosition = (tile: Tile, row: number | undefined, column: number | undefined): Tile => {
    row = row !== null && row !== undefined ? row : tile.row;
    column = column !== null && column !== undefined ? column : tile.column;

    tile.element.style.setProperty('--y', `${row * TILE_SIZE + (TILE_OFFSET + row * TILE_OFFSET * 2)}px`);
    tile.element.style.setProperty('--x', `${column * TILE_SIZE + (TILE_OFFSET + column * TILE_OFFSET * 2)}px`);

    return Object.assign(tile, {
        row,
        column
    })
}

export const dropTile = (tile: Tile, fromRow: number, toRow: number) => {
    setTileAnimate(tile, false);
    setTilePosition(tile, fromRow, undefined);
    setTileAnimationDuration(tile, toRow, undefined);

    setTimeout(() => {
        setTileAnimate(tile, true);
        setTilePosition(tile, toRow, undefined);
    }, 0);

    return new Promise<undefined>(animationDoneResolver => setTimeout(() => {
        setTileAnimate(tile, false);
        animationDoneResolver();
    }, tile.animationDuration * 1000))
}

export const swapTile = (oneTile: Tile, withTile: Tile): Promise<undefined> => {
    const oneTileCopy = {
        ...oneTile
    }

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
    })
}