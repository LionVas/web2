const correspond = {
    "Название": "structure",
    "Тип": "category",
    "Страна": "country",
    "Город": "city",
    "Год": ["magnFrom", "magnTo"],
    "Высота": ["heightFrom", "heightTo"]
}
/* Структура возвращаемого ассоциативного массива:
{
    input_id: input_value,
    ...
}
*/
const dataFilter = (dataForm) => {
    
    let dictFilter = {};

    // перебираем все элементы формы с фильтрами
    for (const item of dataForm.elements) {
        
        // получаем значение элемента
        let valInput = item.value;

        // если поле типа text - приводим его значение к нижнему регистру
        if (item.type === "text") {
            valInput = valInput.toLowerCase();
        }else if (valInput === "" && item.id.includes("From")){
            valInput = -Infinity;
        }else if (valInput === "" && item.id.includes("To")){
            valInput = Infinity;
        }else if (item.type ==="number"){
            valInput = Number(valInput);
        } 
        /* САМОСТОЯТЕЛЬНО обработать значения числовых полей:
        - если в поле занесено значение - преобразовать valInput к числу;
        - если поле пусто и его id включает From  - занести в valInput 
           -бесконечность
        - если поле пусто и его id включает To  - занести в valInput 
           +бесконечность
        */

         // формируем очередной элемент ассоциативного массива
        dictFilter[item.id] = valInput;
    }       
    return dictFilter;
}
// фильтрация таблицы
const filterTable = (data, idTable, dataForm) =>{
    
    // получаем данные из полей формы
    const datafilter = dataFilter(dataForm);
    
    // выбираем данные соответствующие фильтру и формируем таблицу из них
    let tableFilter = data.filter(item => {

        /* в этой переменной будут "накапливаться" результаты сравнения данных
           с параметрами фильтра */
        let result = true;
        
        // строка соответствует фильтру, если сравнение всех значения из input 
        // со значением ячейки очередной строки - истина
         Object.entries(item).map(([key, val]) => {
            //console.log(key +" "+ val);
            // текстовые поля проверяем на вхождение
            if (typeof val == 'string') {
                result &&= val.toLowerCase().includes(datafilter[correspond[key]]); 
               // console.log(val+ " " + datafilter[correspond[key]] + " " + result);
            } else if (typeof val == 'number'){
               //console.log(val+ " "+ key + " " + datafilter[correspond[key][0]] + " " + datafilter[correspond[key][1]]);
                result &&= val > datafilter[correspond[key][0]] && val < datafilter[correspond[key][1]];
            }
         });
        
        return result;
    });     

    // САМОСТОЯТЕЛЬНО вызвать функцию, которая удаляет все строки таблицы с id=idTable
    clearTable(idTable);
    // показать на странице таблицу с отфильтрованными строками
   // console.log;
//    if (tableFilter.length == 0){
//         head = {...correspond};
//         Object.keys(head).forEach(key=>{ head[key] = ""});
//         tableFilter.push(head);
//    }
    createTable(tableFilter, idTable);  
}


const clearFilter = (idTable) => {
    const form = document.getElementById("filter");
    form.reset();
    clearTable(idTable);
    createTable(buildings, idTable);
}