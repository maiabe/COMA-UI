class HTMLFactory {

    #tableGenerator;          // Class that builds HTML Tables with various features.
    #divGenerator;            // Class that builds HTML divs with various features;
    #imgGenerator;            // Class that builds HTML imgs with various features;
    #paragraphGenerator;

    constructor() {
        this.#tableGenerator = new HTMLTableGenerator();
        this.#divGenerator = new DivGenerator();
        this.#imgGenerator = new ImgGenerator();
        this.#paragraphGenerator = new ParagraphGenerator();
    };

    createNewTable(dataTable, rowLimit) {
        const t = this.#tableGenerator.generateTableFromData(dataTable, rowLimit);
        return t;
    }

    createNewDiv(id, name, classlist, customStyles) {
        const d = this.#divGenerator.generateSimpleDiv(id, name, classlist, customStyles);
        return d;
    }

    createNewIMG(id, name, src, classlist, customStyles, alt) {
        const i = this.#imgGenerator.generateNewIMG(id, name, src, classlist, customStyles, alt);
        return i;   
    }

    createNewParagraph(id, name, classlist, customStyles, text) {
        const p = this.#paragraphGenerator.generateNewParagraph(id, name, classlist, customStyles, text);
        return p;
    }

    setCustomStyles(e, styleList) {
        styleList.forEach(s => {
            e.style[s.style] = s.value;
        });
    }
}