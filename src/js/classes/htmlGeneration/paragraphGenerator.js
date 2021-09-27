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
        HTMLFactory.setCustomStyles(e, customStyles)
        return e;
    }
}