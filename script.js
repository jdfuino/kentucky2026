// URL del Google Apps Script Web App
// REEMPLAZAR con la URL que obtienes al desplegar el script en Google Apps Script
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxNY9qyYd-g4xNN3SZpAcXjw5SCTU8sEozPFSrnrZBqGSzK40Zh0Nv0OcqHQ_OEuhC3/exec";
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/pouqr3uhljbc4uwolam7tahxbd0dmwdn";

const HORSES = {
    "1": "Renegade",
    "2": "Albus",
    "3": "Intrepido",
    "4": "Litmus Test",
    "5": "Right to Party",
    "6": "Commandment",
    "7": "Danon Bourbon",
    "8": "So Happy",
    "9": "The Puma",
    "10": "Wonder Dean",
    "11": "Incredibolt",
    "12": "Chief Wallabee",
    "13": "Silent Tactic",
    "14": "Potente",
    "15": "Emerging Market",
    "16": "Pavlovian",
    "17": "Six Speed",
    "18": "Further Ado",
    "19": "Golden Tempo",
    "20": "Fulleffort"
};

let selectedPrimerLugar = null;
let selectedSegundoLugar = null;

function initializeApp() {
    setupHorseSelection();
    setupFormSubmission();
    setupInputEffects();
}

function setupHorseSelection() {
    const primerLugarSelect = document.getElementById('primerLugar');
    const segundoLugarSelect = document.getElementById('segundoLugar');

    primerLugarSelect.addEventListener('change', function () {
        selectedPrimerLugar = this.value;
        validateHorseSelection();
        updateSecondPlaceOptions();
    });

    segundoLugarSelect.addEventListener('change', function () {
        selectedSegundoLugar = this.value;
        validateHorseSelection();
        updateFirstPlaceOptions();
    });
}

function validateHorseSelection() {
    const primerLugarSelect = document.getElementById('primerLugar');
    const segundoLugarSelect = document.getElementById('segundoLugar');

    primerLugarSelect.classList.remove('duplicate-error');
    segundoLugarSelect.classList.remove('duplicate-error');

    if (selectedPrimerLugar && selectedSegundoLugar && selectedPrimerLugar === selectedSegundoLugar) {
        primerLugarSelect.classList.add('duplicate-error');
        segundoLugarSelect.classList.add('duplicate-error');
        return false;
    }

    return true;
}

function updateSecondPlaceOptions() {
    const segundoLugarSelect = document.getElementById('segundoLugar');
    segundoLugarSelect.querySelectorAll('option').forEach(option => {
        if (option.value === selectedPrimerLugar && option.value !== '') {
            option.disabled = true;
            option.style.color = '#ccc';
        } else {
            option.disabled = false;
            option.style.color = '#333';
        }
    });
}

function updateFirstPlaceOptions() {
    const primerLugarSelect = document.getElementById('primerLugar');
    primerLugarSelect.querySelectorAll('option').forEach(option => {
        if (option.value === selectedSegundoLugar && option.value !== '') {
            option.disabled = true;
            option.style.color = '#ccc';
        } else {
            option.disabled = false;
            option.style.color = '#333';
        }
    });
}

function setupFormSubmission() {
    const form = document.getElementById('predictionForm');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const ticketNumber = document.getElementById('ticketNumber').value.trim();

        if (!validateForm(username, email, ticketNumber)) return;

        handleSuccessfulSubmission(username, email, ticketNumber);
    });
}

function validateForm(username, email, ticketNumber) {
    if (!username) {
        showAlert('⚠️ Por favor ingresa tu nombre de usuario', 'warning');
        return false;
    }

    if (username.length < 3) {
        showAlert('⚠️ El nombre de usuario debe tener al menos 3 caracteres', 'warning');
        return false;
    }

    if (!email) {
        showAlert('⚠️ Por favor ingresa tu email', 'warning');
        return false;
    }

    if (!isValidEmail(email)) {
        showAlert('⚠️ Por favor ingresa un email válido', 'warning');
        return false;
    }

    if (!ticketNumber) {
        showAlert('⚠️ Por favor ingresa tu número de ticket', 'warning');
        return false;
    }

    if (!selectedPrimerLugar) {
        showAlert('⚠️ Por favor selecciona el caballo que llegará en primer lugar', 'warning');
        return false;
    }

    if (!selectedSegundoLugar) {
        showAlert('⚠️ Por favor selecciona el caballo que llegará en segundo lugar', 'warning');
        return false;
    }

    if (selectedPrimerLugar === selectedSegundoLugar) {
        showAlert('⚠️ No puedes seleccionar el mismo caballo para primer y segundo lugar', 'warning');
        return false;
    }

    return true;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function handleSuccessfulSubmission(username, email, ticketNumber) {
    const payload = {
        username,
        email,
        ticketNumber,
        primerLugarNum: selectedPrimerLugar,
        primerLugarName: HORSES[selectedPrimerLugar],
        segundoLugarNum: selectedSegundoLugar,
        segundoLugarName: HORSES[selectedSegundoLugar],
        timestamp: new Date().toISOString()
    };

    Swal.fire({
        title: 'Enviando pronóstico...',
        text: 'Por favor espera unos segundos',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => { Swal.showLoading(); }
    });

    fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
    })
        .then(response => response.text())
        .then(text => {
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                showAlert("✅ ¡Pronóstico enviado! Buena suerte en el Kentucky Derby 🏇", "success");
                return;
            }
            if (data.status === "duplicado") {
                showAlert(data.message, "warning");
                return;
            }
            if (data.status === "ok") {
                sendConfirmationEmail(payload);
                const msg = `✅ ¡Pronóstico registrado exitosamente!<br><br>
                    🥇 <b>1er lugar:</b> ${payload.primerLugarNum} - ${payload.primerLugarName}<br>
                    🥈 <b>2do lugar:</b> ${payload.segundoLugarNum} - ${payload.segundoLugarName}<br><br>
                    ¡Buena suerte en el Kentucky Derby! 🏇`;
                showAlert(msg, "success");
            }
        })
        .catch(err => {
            console.error(err);
            showAlert("❌ Error al conectar con el servidor. Intenta de nuevo más tarde.", "error");
        });
}

function showAlert(message, type = 'info') {
    Swal.fire({
        icon: type,
        title: type === 'success' ? '✅ Pronóstico enviado' :
            type === 'warning' ? '⚠️ Atención' :
                type === 'error' ? '❌ Error' : 'ℹ️ Información',
        html: message.replace(/\\n/g, '<br>'),
        confirmButtonText: 'Aceptar'
    }).then(() => {
        if (type === 'success') resetForm();
    });
}

function resetForm() {
    document.getElementById('predictionForm').reset();
    selectedPrimerLugar = null;
    selectedSegundoLugar = null;

    document.querySelectorAll('select option').forEach(option => {
        option.disabled = false;
        option.style.color = '#333';
    });

    document.querySelectorAll('.duplicate-error').forEach(el => el.classList.remove('duplicate-error'));
}

function setupInputEffects() {
    document.querySelectorAll('.form-control').forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.style.transform = 'translateX(5px)';
            this.parentElement.style.transition = 'transform 0.3s ease';
        });

        input.addEventListener('blur', function () {
            this.parentElement.style.transform = 'translateX(0)';
        });

        input.addEventListener('input', function () {
            validateInput(this);
        });
    });
}

function validateInput(input) {
    const value = input.value.trim();

    if (input.id === 'username') {
        input.style.borderColor = value.length < 3 ? '#e74c3c' : '#27ae60';
    }

    if (input.id === 'email') {
        input.style.borderColor = value && !isValidEmail(value) ? '#e74c3c' : '#27ae60';
    }

    if (input.id === 'ticketNumber') {
        if (value && !/^\d{6,10}$/.test(value)) {
            input.style.borderColor = '#f39c12';
        } else if (value) {
            input.style.borderColor = '#27ae60';
        }
    }
}

function sendConfirmationEmail(payload) {
    fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    }).catch(err => console.error("Error al enviar correo de confirmación:", err));
}

document.addEventListener('DOMContentLoaded', initializeApp);

window.KentuckyApp = {
    resetForm,
    validateForm,
    isValidEmail,
    validateHorseSelection
};
