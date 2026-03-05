const correspond = {}
const headers = Object.keys(buildings[0]);
correspond[headers[0]] = ["magnFrom", "magnTo"];
correspond[headers[1]] = "country";
correspond[headers[2]] = ["distanceFrom", "distanceTo"];
correspond[headers[3]] = ["depthFrom", "depthTo"];
correspond[headers[4]] = ["dateFrom", "dateTo"];

const dataFilter = (dataForm) => {
    
    let dictFilter = {};

    
    for (const item of dataForm.elements) {
        if (!item.id) {
            continue;
        }

        
        let valInput = item.value;

        if (item.tagName === "SELECT") {
            valInput = item.value === "2" ? "" : item.options[item.selectedIndex].text.toLowerCase();
        } else if (item.type === "text") {
            valInput = valInput.toLowerCase();
        } else if (item.type === "date") {
            if (valInput === "" && item.id.includes("From")) {
                valInput = -Infinity;
            } else if (valInput === "" && item.id.includes("To")) {
                valInput = Infinity;
            } else {
                valInput = Date.parse(valInput);
            }
        } else if (valInput === "" && item.id.includes("From")) {
            valInput = -Infinity;
        } else if (valInput === "" && item.id.includes("To")) {
            valInput = Infinity;
        } else if (item.type === "number") {
            valInput = Number(valInput);
        }
         dictFilter[item.id] = valInput;
    }       
    return dictFilter;
}
const filterTable = (data, idTable, dataForm) =>{
    
   const datafilter = dataFilter(dataForm);
    
     let tableFilter = data.filter(item => {

         
        let result = true;
        
       Object.entries(item).map(([key, val]) => {
            if (!(key in correspond)) {
                return;
            }

            if (Array.isArray(correspond[key])) {
                const [fromId, toId] = correspond[key];
                if (typeof val == 'number') {
                    result &&= val >= datafilter[fromId] && val <= datafilter[toId];
                } else if (typeof val == 'string') {
                    const [day, month, year] = val.split('.').map(Number);
                    const dateValue = new Date(year, month - 1, day).getTime();
                    result &&= dateValue >= datafilter[fromId] && dateValue <= datafilter[toId];
                }
            } else if (typeof val == 'string') {
                result &&= val.toLowerCase().includes(datafilter[correspond[key]]);
            }
         });
        
        return result;
    });     

    clearTable(idTable);
   
    createTable(tableFilter, idTable);  
}


const clearFilter = (idTable) => {
    const form = document.getElementById("filter");
    form.reset();
    clearTable(idTable);
    createTable(buildings, idTable);
}

