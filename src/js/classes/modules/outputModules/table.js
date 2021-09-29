class Table extends Output {

    #dataArea;    // Popup section that can display data.

    constructor(category, color, shape) {
        super(category, color, shape);
        this.inPorts = [{ name: 'IN', leftSide: true }];
        this.outPorts = [];
        this.setName("Table");
        this.image = 'images/icons/table.png';
        this.popupContent;
        this.#dataArea;
        this.setPopupContent();
        this.setupInspectorContent();

    }

    setPopupContent = () => {
        this.popupContent = GM.HF.createNewDiv('', '', [], []);
        this.#dataArea = GM.HF.createNewDiv(`tableDataArea`, '', [], []);
        this.popupContent.appendChild(this.#dataArea);
    }
}