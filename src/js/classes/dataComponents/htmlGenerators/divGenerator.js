class DivGenerator {
    constructor () {
    };

    generateSimpleDiv = (id, name, classlist, customStyles) => {
        const e = document.createElement('div');
        e.setAttribute('id', id);
        e.setAttribute('name', name);
        classlist.forEach(c => {
            e.classList.add(c);
        });
        this.setCustomStyles(e, customStyles);
        return e;
    };
    setCustomStyles(e, styleList) {
        styleList.forEach(s => {
            e.style[s.style] = s.value;
        });
    }
}