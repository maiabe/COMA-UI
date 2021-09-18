class ImgGenerator {
    constructor(){};
    generateNewIMG = (id, name, src, classlist, customStyles, alt) => {
        const e = document.createElement('div');
        e.setAttribute('id', id);
        e.setAttribute('name', name);
        e.setAttribute('src', src);
        e.setAttribute('alt', alt);
        classlist.forEach(c => {
            e.classList.add(c);
        });
        this.setCustomStyles(e, customStyles);
        return e;
    }
    setCustomStyles(e, styleList) {
        styleList.forEach(s => {
            e.style[s.style] = s.value;
        });
    }
}