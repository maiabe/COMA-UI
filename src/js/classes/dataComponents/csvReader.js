class CsvReader {
    constructor() {
        this.data;
        this.dataTable = [];
        this.publisher = new Publisher();
    };

    readCSVFile = (file, cb) => {
            new Response(file).text().then(x => {
                this.data = x;
                this.generateDataTable();
                cb();
                this.publisher.publishMessage({tag: 'CSV Data Table', data: this.dataTable})
            });
    }

    generateDataTable = () => {
        if (this.data) {
            const rows = this.data.split(/\r\n|\n/);
            rows.forEach(r => {
                this.dataTable.push(r.split(','));
            });
        }
    }

    generateHTMLTable = limit => {
        const t = document.createElement('table');
        const tbody = document.createElement('tbody');
        t.appendChild(tbody);

        this.dataTable.forEach((r, index) => {
            if (index < limit) {
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

    isDataSet = () => {
        return !this.data === undefined;
    }
}