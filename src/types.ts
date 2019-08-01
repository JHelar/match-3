export type TileType = 'red' | 'green' | 'yellow' | 'blue' | 'empty';
export type TileSpecial = 'striped' | 'wrapped' | 'super';
export type Board = Node[][];
export type MatchResult = MatchSet[];
export type NodeIterationCallback = (node: Node, rowIndex: number, columnIndex: number) => void;

export enum STATES {
    INPUT = 1,
    MATCH,
    DROP,
    DROPPING,
    SHUFFLE,
    SWAPPING,
    PAUSED,
    MATCHING
}

export interface Game {
    start(): void;
    pause(): void;
}

export interface MatchSet {
    nodes: Node[];
    special?: TileSpecial;
}

export interface Tile {
    element: HTMLElement;
    animationDuration: number;
    animate: boolean;
    type: TileType;
    special: TileSpecial | undefined;
    row: number;
    column: number;
}

export interface Node {
    index: number;
    tile: Tile;
    element: HTMLElement;
    selected: boolean;
}
