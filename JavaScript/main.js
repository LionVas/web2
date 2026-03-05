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
    // Р”РѕР±Р°РІР»СЏРµРј РѕР±СЂР°Р±РѕС‚С‡РёРє РґР»СЏ РїРµСЂРІРѕРіРѕ select
    const firstSelect = document.querySelector('#sort select');
    firstSelect.addEventListener('change', function() {
        const nextSelectId = 'fieldsSecond';  
        changeNextSelect(firstSelect, nextSelectId);
    });
    const sortButton = document.getElementById("sortBtn")
    sortButton.addEventListener("click", function(){
        sortTable('list', document.getElementById("sort") );
    })
    const resetSortButton = document.getElementById("resetSortBtn")
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
    // РџРµСЂРµР±РёСЂР°РµРј РІСЃРµ СЌР»РµРјРµРЅС‚С‹ С„РѕСЂРјС‹
    for (let i = 0; i < allSelect.length; i++) {
        const item = allSelect[i];

        // Р•СЃР»Рё СЌС‚Рѕ РЅРµ РїРµСЂРІС‹Р№ select, РґРµР»Р°РµРј РµРіРѕ РЅРµРёР·РјРµРЅСЏРµРјС‹Рј
        if (item.tagName === 'SELECT' && i !== 0) {
            item.disabled = true;  // РћС‚РєР»СЋС‡Р°РµРј РІСЃРµ SELECT, РєСЂРѕРјРµ РїРµСЂРІРѕРіРѕ
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

// С„РѕСЂРјРёСЂРѕРІР°РЅРёРµ РїРѕР»СЏ СЃРѕ СЃРїРёСЃРєРѕРј 
// РїР°СЂР°РјРµС‚СЂС‹ вЂ“ РјР°СЃСЃРёРІ СЃРѕ Р·РЅР°С‡РµРЅРёСЏРјРё СЌР»РµРјРµРЅС‚РѕРІ СЃРїРёСЃРєР° Рё СЌР»РµРјРµРЅС‚ select

const setSortSelect = (arr, sortSelect) => { 
    // СЃРѕР·РґР°РµРј OPTION РќРµС‚ Рё РґРѕР±Р°РІР»СЏРµРј РµРµ РІ SELECT
    sortSelect.append(createOption('Нет', 0));
    // РїРµСЂРµР±РёСЂР°РµРј РјР°СЃСЃРёРІ СЃРѕ Р·РЅР°С‡РµРЅРёСЏРјРё РѕРїС†РёР№
     arr.forEach((item, index) => {
       // СЃРѕР·РґР°РµРј OPTION РёР· РѕС‡РµСЂРµРґРЅРѕРіРѕ РєР»СЋС‡Р° Рё РґРѕР±Р°РІР»СЏРµРј РІ SELECT
       // Р·РЅР°С‡РµРЅРёРµ Р°С‚СЂРёР±СѓС‚Р° VALUE СѓРІРµР»РёС‡РёРІР°РµРј РЅР° 1, С‚Р°Рє РєР°Рє Р·РЅР°С‡РµРЅРёРµ 0 РёРјРµРµС‚ РѕРїС†РёСЏ РќРµС‚
        sortSelect.append(createOption(item, index + 1));
    });
}

const setSortSelects = (data, dataForm) => { 

    // РІС‹РґРµР»СЏРµРј РєР»СЋС‡Рё СЃР»РѕРІР°СЂСЏ РІ РјР°СЃСЃРёРІ
    const head = Object.keys(data);

    // РЅР°С…РѕРґРёРј РІСЃРµ SELECT РІ С„РѕСЂРјРµ
    const allSelect = dataForm.getElementsByTagName('select');
    
    // РџРµСЂРµР±РёСЂР°РµРј РІСЃРµ СЌР»РµРјРµРЅС‚С‹ С„РѕСЂРјС‹
    for (let i = 0; i < dataForm.elements.length; i++) {
        const item = dataForm.elements[i];

        // С„РѕСЂРјРёСЂСѓРµРј РѕС‡РµСЂРµРґРЅРѕР№ SELECT
        setSortSelect(head, item);
		
        // Р•СЃР»Рё СЌС‚Рѕ РЅРµ РїРµСЂРІС‹Р№ select, РґРµР»Р°РµРј РµРіРѕ РЅРµРёР·РјРµРЅСЏРµРјС‹Рј
        if (item.tagName === 'SELECT' && i !== 0) {
            item.disabled = true;  // РћС‚РєР»СЋС‡Р°РµРј РІСЃРµ SELECT, РєСЂРѕРјРµ РїРµСЂРІРѕРіРѕ
        }
    }
}

// РЅР°СЃС‚СЂР°РёРІР°РµРј РїРѕР»Рµ РґР»СЏ СЃР»РµРґСѓСЋС‰РµРіРѕ СѓСЂРѕРІРЅСЏ СЃРѕСЂС‚РёСЂРѕРІРєРё
const changeNextSelect = (curSelect, nextSelectId) => {
    
    let nextSelect = document.getElementById(nextSelectId);
    
    nextSelect.disabled = false;
    
    // РІ СЃР»РµРґСѓСЋС‰РµРј SELECT РІС‹РІРѕРґРёРј С‚Рµ Р¶Рµ option, С‡С‚Рѕ Рё РІ С‚РµРєСѓС‰РµРј
    nextSelect.innerHTML = curSelect.innerHTML;
    
    // СѓРґР°Р»СЏРµРј РІ СЃР»РµРґСѓСЋС‰РµРј SELECT СѓР¶Рµ РІС‹Р±СЂР°РЅРЅСѓСЋ РІ С‚РµРєСѓС‰РµРј РѕРїС†РёСЋ
    // РµСЃР»Рё СЌС‚Рѕ РЅРµ РїРµСЂРІР°СЏ РѕРїС†РёСЏ - РѕС‚СЃСѓС‚СЃС‚РІРёРµ СЃРѕСЂС‚РёСЂРѕРІРєРё
    if (curSelect.value != 0) {
       nextSelect.remove(curSelect.value);
    } else {
        nextSelect.disabled = true;
    }
}


