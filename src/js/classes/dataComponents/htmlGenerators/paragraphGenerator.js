class ParagraphGenerator {
    constructor() {};
    generateNewParagraph = (id, name, classlist, customStyles, text) => {
        const e = document.createElement('p');
        e.setAttribute('id', id);
        e.setAttribute('name', name);
        classlist.forEach(c => {
            e.classList.add(c);
        });
        const t = document.createTextNode(text);
        e.appendChild(t);
        this.setCustomStyles(e, customStyles)
        return e;
    }

    setCustomStyles(e, styleList) {
        styleList.forEach(s => {
            e.style[s.style] = s.value;
        });
    }
}