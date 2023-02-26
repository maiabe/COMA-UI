export class HTMLTableGenerator {
    constructor () {
    }

    generateTableFromData = (data, rowLimit) => {
        const t = document.createElement('table');
        const tbody = document.createElement('tbody');
        t.appendChild(tbody);

        //console.log(data);
        const obj = JSON.parse(data);
        const tableObj = Object.entries(obj);
        /*for (var value in tableObj[0]) {
            
            console.log(value);
        }*/

        const tableBodyElements = JSON.parse(tableObj[0][1]);
        console.log(tableBodyElements);
        for (var i = 0; i < tableBodyElements.data.length; i++) {
            if (i < rowLimit) {
                const tr = document.createElement('tr');
                tbody.appendChild(tr);
                const tableBodyElement = Object.values(tableBodyElements.data[i]);

                for (var j = 0; j < tableBodyElement.length; j++) {
                    console.log(tableBodyElement[j])
                    const td = document.createElement('td');
                    const text = document.createTextNode(tableBodyElement[j]);
                    td.appendChild(text);
                    tr.appendChild(td);
                }
            }
        }

        /*data.forEach((r, index) => {
            console.log(r);
        });*/

        /*tableBodyElements.forEach((r, index) => {
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
        });*/
        return t;
    }
}