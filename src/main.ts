import makeGame from './game';
import { DEBUG } from './constants';

console.debug = (() => {
    let messageCounter = 0;
    return function () {
        if (DEBUG) {
            console.log(`-----------${messageCounter}----------`);
            console.log(...arguments);
            console.log(`-----------${messageCounter}----------`);
            messageCounter++;
        }
    }
})()

const game = makeGame();
game.start();