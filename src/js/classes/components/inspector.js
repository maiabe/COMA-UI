class Inspector {

    constructor() {
        this.div = document.getElementById('inspector');
        this.currentModule;
        this.createTitle();
        this.contentArea;
        this.createContentArea();
    }

    setCurrentModule(module) {
        this.currentModule = module;
        this.createContent(this.currentModule.inspectorContent);
    }

    createTitle = () => {
        const titleDiv = document.createElement('h1');
        const text = document.createTextNode('Inspector');
        titleDiv.appendChild(text);
        this.div.appendChild(titleDiv);
    }

    createContentArea = () => {
        this.contentArea = document.createElement('div');
        this.contentArea.id = 'inspectorContentArea';
        this.div.appendChild(this.contentArea);
    }

    createContent = con => {
        this.contentArea.innerHTML = '';
        const table = document.createElement('table');
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);

        con.pairs.forEach(p => {
            const tr = document.createElement('tr');
            const title = document.createElement('td');
            const titleText = document.createTextNode(Object.keys(p)[0]);
            title.appendChild(titleText);
            const value = document.createElement('td');
            const valueText = document.createTextNode(Object.values(p)[0]);
            value.appendChild(valueText);
            tr.appendChild(title);
            tr.appendChild(value);
            tbody.appendChild(tr);
        });
        this.contentArea.appendChild(table);
        console.log(con);
        if (con.html) {
            con.html.forEach(e => {
                this.contentArea.appendChild(e);
            });
        }   
    }

    updateContent = key => {
        if (this.currentModule.getKey() === key) {
            this.createContent(this.currentModule.inspectorContent);

        }
    }
}