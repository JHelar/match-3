export var STATES;
(function (STATES) {
    STATES[STATES["INPUT"] = 1] = "INPUT";
    STATES[STATES["MATCH"] = 2] = "MATCH";
    STATES[STATES["DROP"] = 3] = "DROP";
    STATES[STATES["DROPPING"] = 4] = "DROPPING";
    STATES[STATES["SHUFFLE"] = 5] = "SHUFFLE";
    STATES[STATES["SWAPPING"] = 6] = "SWAPPING";
    STATES[STATES["PAUSED"] = 7] = "PAUSED";
    STATES[STATES["MATCHING"] = 8] = "MATCHING";
})(STATES || (STATES = {}));
//# sourceMappingURL=types.js.map