class HTMLTableGenerator {
    constructor () {
    }

    generateTableFromData = (dataTable, rowLimit) => {
        const t = document.createElement('table');
        const tbody = document.createElement('tbody');
        t.appendChild(tbody);

        dataTable.forEach((r, index) => {
            if (index < rowLimit) {
                const tr = document.createElement('tr');
                tbody.appendChild(tr);
                r.forEach(e => {
                    const td = document.createElement('td');
                    const text = document.createTextNode(e);
                    td.appendChild(text);
                    tr.appendChild(td);
                });
            }
        });
        return t;
    }
}