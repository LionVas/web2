document.addEventListener("DOMContentLoaded", function() {
    createTable(buildings, 'list');
    const filtButton = document.getElementById("findBtn")
    filtButton.addEventListener("click", function(){

        filterTable(buildings, 'list', document.getElementById("filter"));
        resSortForm();
    })
    const resetButton = document.getElementById("clearFilterBtn")
    resetButton.addEventListener("click", function(){
        clearFilter('list');
        resSortForm();
    })
    setSortSelects(buildings[0], document.getElementById("sort") )
    
    const firstSelect = document.querySelector('#sort select');
    firstSelect.addEventListener('change', function() {
        const nextSelectId = 'fieldsSecond';  
        changeNextSelect(firstSelect, nextSelectId);
        
    });
    const secondSelect = document.getElementById("fieldsSecond");
    secondSelect.addEventListener('change', function() {
        const nextSelectId = 'fieldsThird';  
        changeNextSelect(secondSelect, nextSelectId);
        
    });
    const sortButton = document.getElementById("sortBtn")
    sortButton.addEventListener("click", function(){
        sortTable('list', document.getElementById("sort") );
    })
    const resetSortButton = document.getElementById("resetSortBtn")
    resetSortButton.addEventListener("click", function(){
        const filtForm = document.getElementById("sort");
        filtForm.reset();
        resetSort('list');
    })
})




const resSortForm = () =>{
    
    const form =  document.getElementById("sort");
    form.reset();
    const allSelect = form.getElementsByTagName('select');

    for (let i = 0; i < allSelect.length; i++) {
        const item = allSelect[i];

       
        if (item.tagName === 'SELECT' && i !== 0) {
            item.disabled = true;  
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



const setSortSelect = (arr, sortSelect) => { 
    
    sortSelect.append(createOption('Нет', 0));

     arr.forEach((item, index) => {
        sortSelect.append(createOption(item, index + 1));
    });
}

const setSortSelects = (data, dataForm) => { 

    const head = Object.keys(data);
    const allSelect = dataForm.getElementsByTagName('select');
    
    for (let i = 0; i < dataForm.elements.length; i++) {
        const item = dataForm.elements[i];

        setSortSelect(head, item);
		
        if (item.tagName === 'SELECT' && i !== 0) {
            item.disabled = true;  
        }
    }
}


const changeNextSelect = (curSelect, nextSelectId) => {
    
    let nextSelect = document.getElementById(nextSelectId);
    
    nextSelect.disabled = false;
    
    
    nextSelect.innerHTML = curSelect.innerHTML;
    
    if (curSelect.value != 0) {
       nextSelect.remove(curSelect.value);
    } else {
        nextSelect.disabled = true;
    }
}


