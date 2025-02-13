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

let shifts = {};
let currentMonth = new Date().getMonth() + 1;
let currentYear = new Date().getFullYear();

// Inicializace aplikace
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    if (document.getElementById('shiftTable')) {
        initializeMonthYearSelects();
        createShiftTable();
        createLegend();
        updateTable();
    }
    if (document.getElementById('employeeSettingsGrid')) {
        renderEmployeeSettings();
    }
});

// Načtení uložených nastavení
function loadSettings() {
    const savedEmployees = localStorage.getItem('employeeRules');
    if (savedEmployees) {
        const savedEmployeeData = JSON.parse(savedEmployees);
        Object.entries(savedEmployeeData).forEach(([name, rules]) => {
            if (employees[name]) {
                employees[name] = { ...employees[name], ...rules };
            }
        });
    }
}

// Uložení nastavení
function saveSettings() {
    const updatedEmployees = {};
    Object.keys(employees).forEach(name => {
        updatedEmployees[name] = {
            maxNights: parseInt(document.getElementById(`${name}-maxNights`).value),
            maxRO: parseInt(document.getElementById(`${name}-maxRO`).value),
            canNights: document.getElementById(`${name}-canNights`).checked,
            minFreeWeekends: parseInt(document.getElementById(`${name}-minFreeWeekends`).value),
            specialRules: document.getElementById(`${name}-specialRules`).checked
        };
    });
    localStorage.setItem('employeeRules', JSON.stringify(updatedEmployees));
    alert('Nastavení uloženo!');
}

// Vykreslení formuláře pro nastavení zaměstnanců
function renderEmployeeSettings() {
    const grid = document.getElementById('employeeSettingsGrid');
    grid.innerHTML = '';
    Object.entries(employees).forEach(([name, rules]) => {
        const card = document.createElement('div');
        card.className = 'settings-card';
        card.innerHTML = `
            <h4 class="font-bold mb-2">${name}</h4>
            <div class="input-group">
                <label>Max nočních:</label>
                <input type="number" id="${name}-maxNights" value="${rules.maxNights}">
            </div>
            <div class="input-group">
                <label>Max RO:</label>
                <input type="number" id="${name}-maxRO" value="${rules.maxRO}">
            </div>
            <div class="input-group">
                <label>Může noční:</label>
                <input type="checkbox" id="${name}-canNights" ${rules.canNights ? 'checked' : ''}>
            </div>
            <div class="input-group">
                <label>Min volných víkendů:</label>
                <input type="number" id="${name}-minFreeWeekends" value="${rules.minFreeWeekends}">
            </div>
            ${rules.specialRules !== undefined ? `
                <div class="input-group">
                    <label>Speciální pravidla:</label>
                    <input type="checkbox" id="${name}-specialRules" ${rules.specialRules ? 'checked' : ''}>
                </div>
            ` : ''}
        `;
        grid.appendChild(card);
    });
}

// Zbytek funkcí (initializeMonthYearSelects, createShiftTable, updateTable, calculateStats, checkRules, exportToWord, ...)
// Zůstává beze změn, jak byly v původním kódu.
