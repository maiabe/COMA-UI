class CsvReader {
    constructor() {};
    readFile = (file, cb, processId) => {
        new Response(file).text().then(content => {
            const dataTable = [];
            if (content) {
                const rows = content.split(/\r\n|\n/);
                rows.forEach(r => {
                    dataTable.push(r.split(','));
                });
            }
            cb(dataTable, processId);
        });
    }
}