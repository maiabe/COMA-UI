class Table extends Output {

    #dataArea;    // Popup section that can display data.

    constructor(category, color, shape) {
        super(category, color, shape, 'output', 'Table', 'images/icons/table.png',  [{ name: 'IN', leftSide: true }], []);
        this.popupContent;
        this.plotDiv;
        this.setPopupContent();

    }

    setPopupContent = () => {
        this.popupContent = GM.HF.createNewDiv('', '', [], []);
        this.plotDiv = GM.HF.createNewDiv(`plot_${this.key}`, `plot_${this.key}`, ['plot1'], []);
        this.popupContent.appendChild(this.plotDiv);
    }
}