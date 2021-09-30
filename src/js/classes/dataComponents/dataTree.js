class DataTree {
    #tree;                          // The actual tree
    #nodes;
    #links;
    constructor() {
        this.#links = [];
        this.#nodes = [];
        this.#tree = [];
    }

    updateTree = (nodes, links) => {
        this.#nodes = nodes;
        this.#links = links;
        this.#buildTree();
    }

    #buildTree = () => {

    }
}

class Node {

    to;
    from;
    id;


    constructor(id) {
        this.to = [];
        this.from = [];
        this.id = id;
    }
}

