// Konfigurace a data
const employees = {
    "Kolářová Hana": { maxNights: 0, maxRO: 4, canNights: false, minFreeWeekends: 2 },
    "Králová Martina": { maxNights: 2, maxRO: 1, canNights: true, minFreeWeekends: 2 },
    "Vaněčková Dana": { maxNights: 0, maxRO: 0, canNights: false, minFreeWeekends: 2, specialRules: true },
    "Vaňková Vlaďka": { maxNights: 5, maxRO: 4, canNights: true, minFreeWeekends: 2 },
    "Vrkoslavová Irena": { maxNights: 5, maxRO: 4, canNights: true, minFreeWeekends: 1 },
    "Dianová Kristýna": { maxNights: 5, maxRO: 1, canNights: true, minFreeWeekends: 2 },
    "Dráb David": { maxNights: 5, maxRO: 1, canNights: true, minFreeWeekends: 2 },
    "Šáchová Kateřina": { maxNights: 5, maxRO: 4, canNights: true, minFreeWeekends: 2 },
    "Krejčová Zuzana": { maxNights: 2, maxRO: 1, canNights: true, minFreeWeekends: 2 },
    "Dráb Filip": { maxNights: 0, maxRO: 4, canNights: false, minFreeWeekends: 2 },
    "Růžek přízemí": { maxNights: 0, maxRO: 0, canNights: true, minFreeWeekends: 0, isBuilding: true }
};

const shiftTypes = {
    'R': { name: 'Ranní', color: 'rgb(173,216,230)', hours: 7.5 },
    'O': { name: 'Odpolední', color: 'rgb(144,238,144)', hours: 7.5 },
    'L': { name: 'Lékař', color: 'rgb(255,182,193)', hours: 7.5 },
    'IP': { name: 'Individuální péče', color: 'rgb(255,218,185)', hours: 7.5 },
    'RO': { name: 'Ranní+Odpolední', color: 'rgb(221,160,221)', hours: 11.5 },
    'NSK': { name: 'Noční služba staniční', color: 'rgb(255,255,153)', hours: 12 },
    'CH': { name: 'Chráněné bydlení', color: 'rgb(255,160,122)', hours: 7.5 },
    'V': { name: 'Volno', color: 'rgb(211,211,211)', hours: 0 },
    'N': { name: 'Noční', color: 'rgb(176,196,222)', hours: 9 },
    'S': { name: 'Služba', color: 'rgb(152,251,152)', hours: 7.5 },
    'D': { name: 'Dovolená', color: 'rgb(240,230,140)', hours: 7.5 },
    'IV': { name: 'Individuální výchova', color: 'rgb(230,230,250)', hours: 7.5 },
    'ŠK': { name: 'Školení', color: 'rgb(255,228,196)', hours: 7.5 }
};

// Výchozí nastavení pravidel pro kontroly
const defaultRules = {
    maxConsecutiveShifts: 5,
    mustRestAfterNight: true,
    requiredMorning: 2,
    requiredAfternoon: 2,
    requiredRO: 1
};

let shifts = {};
let currentMonth = new Date().getMonth() + 1;
let currentYear = new Date().getFullYear();
let currentRules = { ...defaultRules };

// Inicializace aplikace
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    initializeMonthYearSelects();
    createShiftTable();
    createLegend();
    createSettingsPanel();
    createRulesSettingsPanel();
    updateTable();
});

// Načtení uložených nastavení
function loadSettings() {
    const savedEmployees = localStorage.getItem('employeeRules');
    const savedRules = localStorage.getItem('controlRules');
    
    if (savedEmployees) {
        const savedEmployeeData = JSON.parse(savedEmployees);
        Object.entries(savedEmployeeData).forEach(([name, rules]) => {
            if (employees[name]) {
                employees[name] = {
                    ...rules,
                    specialRules: employees[name].specialRules,
                    isBuilding: employees[name].isBuilding
                };
            }
        });
    }

    if (savedRules) {
        currentRules = { ...defaultRules, ...JSON.parse(savedRules) };
    }
}

// Inicializace výběru měsíce a roku
function initializeMonthYearSelects() {
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');

    // Měsíce
    for (let i = 1; i <= 12; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = new Date(2024, i-1).toLocaleString('cs', { month: 'long' });
        monthSelect.appendChild(option);
    }
    monthSelect.value = currentMonth;

    // Roky
    const currentYearInt = new Date().getFullYear();
    for (let i = currentYearInt - 2; i <= currentYearInt + 2; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }
    yearSelect.value = currentYear;

    // Event listeners
    monthSelect.addEventListener('change', (e) => {
        currentMonth = parseInt(e.target.value);
        updateTable();
    });

    yearSelect.addEventListener('change', (e) => {
        currentYear = parseInt(e.target.value);
        updateTable();
    });
}
// Panel nastavení zaměstnanců
function createSettingsPanel() {
    const settingsGrid = document.getElementById('employeeSettingsGrid');
    settingsGrid.innerHTML = '';

    Object.entries(employees).forEach(([name, rules]) => {
        if (rules.isBuilding) return; // Přeskočit Růžek přízemí

        const employeeCard = document.createElement('div');
        employeeCard.className = 'settings-card';
        employeeCard.innerHTML = `
            <h4 class="font-bold mb-2">${name}</h4>
            <div class="grid gap-2">
                <div class="input-group">
                    <label>Max noční:</label>
                    <input type="number" min="0" value="${rules.maxNights}"
                           class="settings-input" 
                           data-employee="${name}" data-rule="maxNights">
                </div>
                <div class="input-group">
                    <label>Max RO:</label>
                    <input type="number" min="0" value="${rules.maxRO}"
                           class="settings-input" 
                           data-employee="${name}" data-rule="maxRO">
                </div>
                <div class="input-group">
                    <label>Min. volné víkendy:</label>
                    <input type="number" min="0" value="${rules.minFreeWeekends}"
                           class="settings-input" 
                           data-employee="${name}" data-rule="minFreeWeekends">
                </div>
                <div class="input-group">
                    <label>
                        <input type="checkbox" ${rules.canNights ? 'checked' : ''}
                               data-employee="${name}" data-rule="canNights">
                        Může noční
                    </label>
                </div>
            </div>
        `;
        settingsGrid.appendChild(employeeCard);
    });

    // Tlačítko pro uložení
    const saveButton = document.createElement('button');
    saveButton.className = 'mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600';
    saveButton.textContent = 'Uložit nastavení zaměstnanců';
    saveButton.onclick = saveEmployeeSettings;
    settingsGrid.appendChild(saveButton);
}

// Panel nastavení pravidel pro kontroly
function createRulesSettingsPanel() {
    const rulesGrid = document.getElementById('rulesSettingsGrid');
    rulesGrid.innerHTML = `
        <div class="settings-card">
            <h4 class="font-bold mb-2">Základní kontroly</h4>
            <div class="grid gap-2">
                <div class="input-group">
                    <label>Max. služeb v řadě:</label>
                    <input type="number" id="maxConsecutiveShifts" 
                           value="${currentRules.maxConsecutiveShifts}" min="1">
                </div>
                <div class="input-group">
                    <label>
                        <input type="checkbox" id="mustRestAfterNight"
                               ${currentRules.mustRestAfterNight ? 'checked' : ''}>
                        Povinné volno po noční
                    </label>
                </div>
            </div>
        </div>
        <div class="settings-card">
            <h4 class="font-bold mb-2">Požadované obsazení služeb</h4>
            <div class="grid gap-2">
                <div class="input-group">
                    <label>Počet ranních (bez RO):</label>
                    <input type="number" id="requiredMorning" 
                           value="${currentRules.requiredMorning}" min="0">
                </div>
                <div class="input-group">
                    <label>Počet odpoledních (bez RO):</label>
                    <input type="number" id="requiredAfternoon" 
                           value="${currentRules.requiredAfternoon}" min="0">
                </div>
                <div class="input-group">
                    <label>Počet RO alternativně:</label>
                    <input type="number" id="requiredRO" 
                           value="${currentRules.requiredRO}" min="0">
                </div>
            </div>
        </div>
    `;

    // Tlačítko pro uložení
    const saveButton = document.createElement('button');
    saveButton.className = 'mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600';
    saveButton.textContent = 'Uložit nastavení kontrol';
    saveButton.onclick = saveRulesSettings;
    rulesGrid.appendChild(saveButton);
}

// Uložení nastavení zaměstnanců
function saveEmployeeSettings() {
    const inputs = document.querySelectorAll('#employeeSettingsGrid input');
    inputs.forEach(input => {
        const employeeName = input.dataset.employee;
        const rule = input.dataset.rule;
        
        if (input.type === 'checkbox') {
            employees[employeeName][rule] = input.checked;
        } else {
            employees[employeeName][rule] = parseInt(input.value) || 0;
        }
    });

    localStorage.setItem('employeeRules', JSON.stringify(employees));
    alert('Nastavení zaměstnanců bylo uloženo');
}

// Uložení nastavení kontrol
function saveRulesSettings() {
    currentRules = {
        maxConsecutiveShifts: parseInt(document.getElementById('maxConsecutiveShifts').value) || 5,
        mustRestAfterNight: document.getElementById('mustRestAfterNight').checked,
        requiredMorning: parseInt(document.getElementById('requiredMorning').value) || 2,
        requiredAfternoon: parseInt(document.getElementById('requiredAfternoon').value) || 2,
        requiredRO: parseInt(document.getElementById('requiredRO').value) || 1
    };

    localStorage.setItem('controlRules', JSON.stringify(currentRules));
    alert('Nastavení kontrol bylo uloženo');
}

// Vytvoření tabulky služeb
function createShiftTable() {
    const table = document.getElementById('shiftTable');
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';

    Object.keys(employees).forEach(employee => {
        const tr = document.createElement('tr');
        const tdName = document.createElement('td');
        tdName.textContent = employee;
        tdName.className = 'employee-name fixed-column';
        tr.appendChild(tdName);
        tbody.appendChild(tr);
    });

    updateTable();
}
// Aktualizace tabulky
function updateTable() {
    const table = document.getElementById('shiftTable');
    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');

    // Aktualizace hlavičky
    while (thead.children.length > 1) {
        thead.removeChild(thead.lastChild);
    }

    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
        const th = document.createElement('th');
        th.textContent = i;
        th.className = isWeekend(i) ? 'border p-2 bg-gray-50 weekend' : 'border p-2 bg-gray-50';
        thead.appendChild(th);
    }

    // Aktualizace buněk pro služby
    tbody.querySelectorAll('tr').forEach(tr => {
        while (tr.children.length > 1) {
            tr.removeChild(tr.lastChild);
        }

        const employee = tr.firstChild.textContent;
        for (let i = 1; i <= daysInMonth; i++) {
            const td = document.createElement('td');
            td.className = `shift-cell ${isWeekend(i) ? 'weekend' : ''}`;

            const select = document.createElement('select');
            select.className = 'shift-select';
            select.dataset.employee = employee;
            select.dataset.day = i;

            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = '';
            select.appendChild(emptyOption);

            Object.keys(shiftTypes).forEach(shiftType => {
                const option = document.createElement('option');
                option.value = shiftType;
                option.textContent = shiftType;
                select.appendChild(option);
            });

            const currentShift = shifts[`${employee}-${i}`];
            if (currentShift) {
                select.value = currentShift;
                select.style.backgroundColor = shiftTypes[currentShift].color;
            }

            select.addEventListener('change', (e) => {
                const shift = e.target.value;
                if (shift) {
                    shifts[`${employee}-${i}`] = shift;
                    e.target.style.backgroundColor = shiftTypes[shift].color;
                } else {
                    delete shifts[`${employee}-${i}`];
                    e.target.style.backgroundColor = '';
                }
            });

            td.appendChild(select);
            tr.appendChild(td);
        }
    });
}

// Kontrola pravidel
function checkRules() {
    const alerts = [];
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    Object.entries(employees).forEach(([name, rules]) => {
        if (rules.isBuilding) return; // Přeskočit kontrolu pro Růžek přízemí

        let nightCount = 0;
        let roCount = 0;
        let consecutiveShifts = 0;
        let freeWeekends = 0;
        let lastWasNight = false;

        for (let day = 1; day <= daysInMonth; day++) {
            const shift = shifts[`${name}-${day}`];
            
            if (shift === 'N') nightCount++;
            if (shift === 'RO') roCount++;
            
            if (shift && shift !== 'V' && shift !== 'D') {
                consecutiveShifts++;
                if (consecutiveShifts > currentRules.maxConsecutiveShifts) {
                    alerts.push(`${name}: Více než ${currentRules.maxConsecutiveShifts} služeb v řadě`);
                    consecutiveShifts = 0;
                }
            } else {
                consecutiveShifts = 0;
            }
            
            if (currentRules.mustRestAfterNight && lastWasNight && 
                shift && shift !== 'V' && shift !== 'N') {
                alerts.push(`${name}: Služba hned po noční (den ${day})`);
            }
            lastWasNight = (shift === 'N');
            
            if (isWeekend(day) && day < daysInMonth) {
                if (shifts[`${name}-${day}`] === 'V' && 
                    shifts[`${name}-${day+1}`] === 'V') {
                    freeWeekends++;
                }
            }
        }

        if (nightCount > rules.maxNights) {
            alerts.push(`${name}: Překročen limit nočních (${nightCount}/${rules.maxNights})`);
        }
        if (roCount > rules.maxRO) {
            alerts.push(`${name}: Překročen limit RO (${roCount}/${rules.maxRO})`);
        }
        if (!rules.canNights && nightCount > 0) {
            alerts.push(`${name}: Nemůže mít noční služby`);
        }
        if (freeWeekends < rules.minFreeWeekends) {
            alerts.push(`${name}: Nedostatek volných víkendů (${freeWeekends}/${rules.minFreeWeekends})`);
        }

        // Speciální pravidla pro Vaněčkovou
        if (rules.specialRules) {
            checkVaneckovaRules(name, alerts);
        }
    });

    showAlerts(alerts);
}

// Speciální pravidla pro Vaněčkovou
function checkVaneckovaRules(name, alerts) {
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    
    // NSK kontrola - povolené dny
    const allowedNskDays = [2, 3, 8, 13];
    for (let day = 1; day <= daysInMonth; day++) {
        if (shifts[`${name}-${day}`] === 'NSK' && !allowedNskDays.includes(day)) {
            alerts.push(`Vaněčková: NSK služba je ve špatný den (${day})`);
        }
    }

    // CH kontrola - pátky
    for (let day = 1; day <= daysInMonth; day++) {
        if (new Date(currentYear, currentMonth - 1, day).getDay() === 5) {
            if (shifts[`${name}-${day}`] !== 'CH') {
                alerts.push(`Vaněčková: Chybí CH služba v pátek (${day})`);
            }
        }
    }

    // Kontrola, že nikdo jiný nemá NSK nebo CH
    Object.keys(employees).forEach(otherName => {
        if (otherName !== name) {
            for (let day = 1; day <= daysInMonth; day++) {
                const shift = shifts[`${otherName}-${day}`];
                if (shift === 'NSK' || shift === 'CH') {
                    alerts.push(`${otherName}: Nesmí mít ${shift} službu (pouze pro Vaněčkovou)`);
                }
            }
        }
    });
}
// Kontrola obsazení služeb
function checkOccupancy() {
    const alerts = [];
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        let ranniCount = 0;
        let odpoledniCount = 0;
        let roCount = 0;
        let nightCount = 0;
        let buildingNightCount = 0;

        Object.entries(employees).forEach(([name, rules]) => {
            const shift = shifts[`${name}-${day}`];
            if (!rules.isBuilding) {
                if (shift === 'R') ranniCount++;
                if (shift === 'O') odpoledniCount++;
                if (shift === 'RO') roCount++;
                if (shift === 'N') nightCount++;
            } else {
                if (shift === 'N') buildingNightCount++;
            }
        });

        // Kontrola podle nastavených pravidel
        const correctStaffing = (ranniCount === currentRules.requiredMorning && 
                              odpoledniCount === currentRules.requiredAfternoon && 
                              roCount === 0) ||
                              (ranniCount === currentRules.requiredMorning - 1 && 
                              odpoledniCount === currentRules.requiredAfternoon - 1 && 
                              roCount === currentRules.requiredRO);

        if (!correctStaffing) {
            alerts.push(`Den ${day}: Nesprávné obsazení služeb (R:${ranniCount}, O:${odpoledniCount}, RO:${roCount})`);
        }

        if (buildingNightCount > 0 && nightCount > 0) {
            alerts.push(`Den ${day}: Noční služba je obsazena jak na baráku, tak u zaměstnanců`);
        }
        if (buildingNightCount === 0 && nightCount === 0) {
            alerts.push(`Den ${day}: Chybí noční služba`);
        }
    }

    showAlerts(alerts);
}

// Export do Wordu
function exportToWord() {
    const header = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word' 
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset='utf-8'>
            <style>
                @page {
                    mso-page-orientation: landscape;
                    margin: 1cm;
                }
                body { 
                    font-family: Arial; 
                    margin: 0;
                    padding: 0;
                }
                h1 {
                    text-align: center;
                    font-size: 16pt;
                    margin: 0 0 10px 0;
                    padding: 0;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    table-layout: fixed;
                }
                th {
                    background-color: #f0f0f0;
                    font-weight: bold;
                    font-size: 9pt;
                    border: 1px solid black;
                    padding: 3px 2px;
                    text-align: center;
                }
                td {
                    border: 1px solid black;
                    padding: 3px 2px;
                    text-align: center;
                    font-size: 9pt;
                    height: 20px;
                }
                td:first-child {
                    text-align: left;
                    padding-left: 5px;
                    width: 130px;
                }
                .weekend { 
                    background-color: #ffffd0; 
                }
            </style>
        </head>
        <body>
            <h1>Rozpis služeb - ${new Date(currentYear, currentMonth - 1).toLocaleString('cs', { month: 'long' })} ${currentYear}</h1>
            <table>
    `;

    let content = '<tr><th>Jméno</th>';
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
        content += `<th class="${isWeekend(i) ? 'weekend' : ''}">${i}</th>`;
    }
    content += '</tr>';

    Object.keys(employees).forEach(employee => {
        content += `<tr><td>${employee}</td>`;
        for (let day = 1; day <= daysInMonth; day++) {
            const shift = shifts[`${employee}-${day}`] || '';
            const style = shift ? `background-color: ${shiftTypes[shift].color}` : 
                                isWeekend(day) ? 'background-color: #ffffd0' : '';
            content += `<td style="${style}">${shift}</td>`;
        }
        content += '</tr>';
    });

    const footer = `
            </table>
        </body>
        </html>
    `;

    const blob = new Blob([header + content + footer], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rozpis_${currentYear}_${currentMonth}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Pomocné funkce
function isWeekend(day) {
    const date = new Date(currentYear, currentMonth - 1, day);
    return date.getDay() === 0 || date.getDay() === 6;
}

function showAlerts(alerts) {
    const alertsDiv = document.getElementById('alerts');
    const alertsList = document.getElementById('alertsList');
    alertsList.innerHTML = '';

    if (alerts.length > 0) {
        alerts.forEach(alert => {
            const li = document.createElement('li');
            li.textContent = alert;
            alertsList.appendChild(li);
        });
        alertsDiv.classList.remove('hidden');
    } else {
        alertsDiv.classList.add('hidden');
        alert('Všechna pravidla jsou splněna.');
    }
}

function createLegend() {
    const legend = document.getElementById('legend');
    Object.entries(shiftTypes).forEach(([code, {name, color}]) => {
        const div = document.createElement('div');
        div.className = 'flex items-center';
        div.innerHTML = `
            <div class="w-6 h-6 rounded mr-2" style="background-color: ${color}"></div>
            <span>${code} - ${name}</span>
        `;
        legend.appendChild(div);
    });
}
