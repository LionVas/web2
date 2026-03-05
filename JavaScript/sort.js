/*формируем массив для сортировки по двум уровням вида 
  [
    {column: номер столбца, по которому осуществляется сортировка, 
     direction: порядок сортировки (true по убыванию, false по возрастанию)
    }, 
    ...
   ]
*/
const createSortArr = (data) => {
    let sortArr = [];
    
    const sortSelects = data.getElementsByTagName('select');
    
    for (const item of sortSelects) {   
        // получаем номер выбранной опции
        const keySort = item.value;
        
        // если выбрана опция "Нет", заканчиваем формирование массива
        if (keySort == 0) {
            break;
        }

        // получаем порядок сортировки очередного уровня
        const desc = document.getElementById(item.id + 'Desc').checked;
        
        // добавляем столбец и направление сортировки
        sortArr.push({ column: keySort - 1, direction: desc });
    }
    return sortArr;
};

let originalRows = null;
const sortTable = (idTable, formData) => {
    // формируем управляющий массив для сортировки
    const sortArr = createSortArr(formData);
    
    // находим нужную таблицу
    let table = document.getElementById(idTable);

    // преобразуем строки таблицы в массив
    let rowData = Array.from(table.rows);


    if (sortArr.length === 0) {
        if (originalRows) {
           
            rowData = originalRows.slice();
        }
    } else {
        
        if (!originalRows) {
            originalRows = rowData.slice();
        }

        // удаляем элемент с заголовками таблицы
        const headerRow = rowData.shift();

        // сортируем данные по всем уровням сортировки
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

                // учитываем направление сортировки
                if (comparison !== 0) {
                    return (direction ? -comparison : comparison);
                }
            }
            return 0;
        });

        // добавляем обратно заголовок таблицы
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