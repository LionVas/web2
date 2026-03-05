const createTable = (data, idTable) => {
    const table = document.getElementById(idTable);
    if (data.length == 0){
        
       const header = Object.keys(correspond);
       const headerRow = createHeaderRow(header);
       table.append(headerRow);
       return;
    }
    const header = Object.keys(data[0]);
     
    /* создание шапки таблицы */
    const headerRow = createHeaderRow(header);
    table.append(headerRow);
	
    /* создание тела таблицы */
    const bodyRows = createBodyRows(data);
    table.append(bodyRows); 
};

const createHeaderRow = (headers) => {
    const tr = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.innerHTML = header;
        tr.append(th);
    });
    return tr;
};
const createBodyRows = (data) => {
    const tbody = document.createElement('tbody');
    for (let i = 0; i < data.length; i++){
        const trow = document.createElement('tr');
        for (let key in data[i]){
            const tdata = document.createElement('td');
            tdata.innerHTML = data[i][key];
            trow.append(tdata);
        }
        tbody.append(trow);
    }
    return tbody;
}
const clearTable = (idTable) => {
    const table = document.getElementById(idTable);
    while(table.firstChild){
        table.removeChild(table.firstChild);
    }
}