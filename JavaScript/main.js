document.addEventListener("DOMContentLoaded", function() {
    createTable(buildings, 'list');
    const filtButton = document.querySelector('input[type="button"][value="Найти"]')
    filtButton.addEventListener("click", function(){

        filterTable(buildings, 'list', document.getElementById("filter"));
        resSortForm();
    })
    const resetButton = document.querySelector('input[type="button"][value="Очистить фильтры"]')
    resetButton.addEventListener("click", function(){
        clearFilter('list');
        resSortForm();
    })
    setSortSelects(buildings[0], document.getElementById("sort") )
    // Добавляем обработчик для первого select
    const firstSelect = document.querySelector('#sort select');
    firstSelect.addEventListener('change', function() {
        const nextSelectId = 'fieldsSecond';  
        changeNextSelect(firstSelect, nextSelectId);
    });
    const sortButton = document.querySelector('input[type="button"][value="Сортировать"]')
    sortButton.addEventListener("click", function(){
        sortTable('list', document.getElementById("sort") );
    })
    const resetSortButton = document.querySelector('input[type="button"][value="Сбросить сортировку"]')
    resetSortButton.addEventListener("click", function(){
        const filtForm = document.getElementById("filter");
        filtForm.reset();
        resetSort('list');
    })
})




const resSortForm = () =>{
    
    const form =  document.getElementById("sort");
    form.reset();
    const allSelect = form.getElementsByTagName('select');
    // Перебираем все элементы формы
    for (let i = 0; i < allSelect.length; i++) {
        const item = allSelect[i];

        // Если это не первый select, делаем его неизменяемым
        if (item.tagName === 'SELECT' && i !== 0) {
            item.disabled = true;  // Отключаем все SELECT, кроме первого
        } else {
            item.disabled = false;
        }
    }
}
const createOption = (str, val) => {
    let item = document.createElement('option');
    item.text = str;
    item.value = val;
    return item;
}

// формирование поля со списком 
// параметры – массив со значениями элементов списка и элемент select

const setSortSelect = (arr, sortSelect) => { 
    // создаем OPTION Нет и добавляем ее в SELECT
    sortSelect.append(createOption('Нет', 0));
    // перебираем массив со значениями опций
     arr.forEach((item, index) => {
       // создаем OPTION из очередного ключа и добавляем в SELECT
       // значение атрибута VALUE увеличиваем на 1, так как значение 0 имеет опция Нет
        sortSelect.append(createOption(item, index + 1));
    });
}

const setSortSelects = (data, dataForm) => { 

    // выделяем ключи словаря в массив
    const head = Object.keys(data);

    // находим все SELECT в форме
    const allSelect = dataForm.getElementsByTagName('select');
    
    // Перебираем все элементы формы
    for (let i = 0; i < dataForm.elements.length; i++) {
        const item = dataForm.elements[i];

        // формируем очередной SELECT
        setSortSelect(head, item);
		
        // Если это не первый select, делаем его неизменяемым
        if (item.tagName === 'SELECT' && i !== 0) {
            item.disabled = true;  // Отключаем все SELECT, кроме первого
        }
    }
}

// настраиваем поле для следующего уровня сортировки
const changeNextSelect = (curSelect, nextSelectId) => {
    
    let nextSelect = document.getElementById(nextSelectId);
    
    nextSelect.disabled = false;
    
    // в следующем SELECT выводим те же option, что и в текущем
    nextSelect.innerHTML = curSelect.innerHTML;
    
    // удаляем в следующем SELECT уже выбранную в текущем опцию
    // если это не первая опция - отсутствие сортировки
    if (curSelect.value != 0) {
       nextSelect.remove(curSelect.value);
    } else {
        nextSelect.disabled = true;
    }
}
