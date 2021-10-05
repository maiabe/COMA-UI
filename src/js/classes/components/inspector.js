class Inspector {

    publisher;                  // Message Publisher
    subscriber;                 // Message Subscriber
    #currentModuleKey;          // Key identifying the Highlighted Module

    constructor() {
        // Set Up the communication components.
        this.publisher = new Publisher();
        this.div = document.getElementById('inspector');
        this.#currentModuleKey;
        this.createTitle();
        this.contentArea;
        this.createContentArea();
    }

    messageHandler = msg => {
        console.log(msg.readMessage());
    };

    setCurrentModuleKey(key, content) {
        this.#currentModuleKey = key;
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
        console.log(con);
        this.contentArea.innerHTML = '';
        const table = document.createElement('table');
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);
        const contentIterator = con[Symbol.iterator]();
        for (const p of contentIterator) {
            const tr = document.createElement('tr');
            const title = document.createElement('td');
            const titleText = document.createTextNode(p[0].toUpperCase());
            title.appendChild(titleText);
            const value = document.createElement('td');
            const valueText = document.createTextNode(p[1].text);
            value.appendChild(valueText);
            tr.appendChild(title);
            tr.appendChild(value);
            tbody.appendChild(tr);
        };
        this.contentArea.appendChild(table);
        if (con.html) {
            con.html.forEach(e => {
                this.contentArea.appendChild(e);
            });
        }   
    }

    updateContent = (key, content) => {
        if (this.#currentModuleKey === key) {
            this.createContent(content);
        }
    }
}