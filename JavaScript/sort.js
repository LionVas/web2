
const createSortArr = (data) => {
    let sortArr = [];
    
    const sortSelects = data.getElementsByTagName('select');
    
    for (const item of sortSelects) {   
        
        const keySort = item.value;
        
       if (keySort == 0) {
            break;
        }

        const desc = document.getElementById(item.id + 'Desc').checked;
        
        sortArr.push({ column: keySort - 1, direction: desc });
    }
    return sortArr;
};

let originalRows = null;
const sortTable = (idTable, formData) => {
    
    const sortArr = createSortArr(formData);
    
   
    let table = document.getElementById(idTable);

  
    let rowData = Array.from(table.rows);


    if (sortArr.length === 0) {
        if (originalRows) {
           
            rowData = originalRows.slice();
        }
    } else {
        
        if (!originalRows) {
            originalRows = rowData.slice();
        }

        
        const headerRow = rowData.shift();

        rowData.sort((first, second) => {
            for (let { column, direction } of sortArr) {
                const firstCell = first.cells[column].innerHTML;
                const secondCell = second.cells[column].innerHTML;
                
                let comparison;

                
                if (isNaN(firstCell) || isNaN(secondCell)) {
                    comparison = firstCell.localeCompare(secondCell);
                } else {
                    
                    comparison = parseFloat(firstCell) - parseFloat(secondCell);
                }

                if (comparison !== 0) {
                    return (direction ? -comparison : comparison);
                }
            }
            return 0;
        });

        rowData.unshift(headerRow);
    }

    
    let tbody = document.createElement('tbody');
    rowData.forEach(item => {
        tbody.append(item);
    });
    table.append(tbody);
};
const resetSort = (idTable) => {
    
    let table = document.getElementById(idTable);
    let rowData = originalRows.slice();  
    
    
    let tbody = document.createElement('tbody');
    rowData.forEach(item => {
        tbody.append(item);  
    });

    table.append(tbody); 
    
    resSortForm();

}