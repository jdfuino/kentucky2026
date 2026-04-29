const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw_HSvinSMqVoQie1xNRVvlFkZ3RtYcOp8I5fwGQ_jVixc4fAmixL7y8JA1JxlV-mCg/exec";
const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/pouqr3uhljbc4uwolam7tahxbd0dmwdn";

// 6:00 PM hora Venezuela (GMT-4) = 22:00 UTC
const DEADLINE = new Date('2026-05-02T22:00:00Z');

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
    populateHorseSelects();
    setupHorseSelection();
    setupFormSubmission();
    setupInputEffects();
    checkDeadline();
}

function checkDeadline() {
    if (new Date() >= DEADLINE) {
        closeForm();
    } else {
        startCountdown();
    }
}

function closeForm() {
    const countdown = document.getElementById('countdown-container');
    const closedBanner = document.getElementById('closed-banner');
    const form = document.querySelector('.prediction-form');
    if (countdown) countdown.style.display = 'none';
    if (closedBanner) closedBanner.style.display = 'block';
    if (form) form.style.display = 'none';
}

function startCountdown() {
    const container = document.getElementById('countdown-container');
    if (container) container.style.display = 'block';

    function updateDisplay() {
        const diff = DEADLINE - new Date();
        if (diff <= 0) {
            clearInterval(interval);
            closeForm();
            return;
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        document.getElementById('cd-days').textContent = String(days).padStart(2, '0');
        document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('cd-minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('cd-seconds').textContent = String(seconds).padStart(2, '0');
    }

    updateDisplay();
    const interval = setInterval(updateDisplay, 1000);
}

function populateHorseSelects() {
    const selects = [document.getElementById('primerLugar'), document.getElementById('segundoLugar')];
    selects.forEach(select => {
        Object.entries(HORSES).forEach(([num, name]) => {
            const option = document.createElement('option');
            option.value = num;
            option.textContent = `${num} - ${name}`;
            select.appendChild(option);
        });
    });
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
    if (new Date() >= DEADLINE) {
        closeForm();
        return;
    }

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
            if (data.status === "cerrado") {
                closeForm();
                return;
            }
            if (data.status === "duplicado") {
                showAlert(data.message, "warning");
                return;
            }
            if (data.status === "error") {
                showAlert(data.message || "❌ Error interno. Por favor intenta de nuevo más tarde.", "error");
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
        if (!value) input.style.borderColor = '';
        else input.style.borderColor = value.length < 3 ? '#e74c3c' : '#27ae60';
    }

    if (input.id === 'email') {
        if (!value) input.style.borderColor = '';
        else input.style.borderColor = !isValidEmail(value) ? '#e74c3c' : '#27ae60';
    }

    if (input.id === 'ticketNumber') {
        if (!value) input.style.borderColor = '';
        else if (!/^\d{6,10}$/.test(value)) input.style.borderColor = '#f39c12';
        else input.style.borderColor = '#27ae60';
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
