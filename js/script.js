const ascentRate = 9
let depth = document.getElementById('depth')
depth.value = 0
depth.innerHTML = depth.value
let ATA = depth.value / 10 + 1

let sensor1 = document.getElementById('sensor1')
let sensor2 = document.getElementById('sensor2')
let sensor3 = document.getElementById('sensor3')

let fO2 = document.getElementById('fO2').value / 100
let fHe = document.getElementById('fHe').value / 100
let fN2 = 1 - fO2 - fHe
let ppO2 = fO2 * ATA
let ppHe = fHe * ATA
let loopO2 = ppO2

let tts = document.getElementById('tts')
tts.value = Math.ceil(depth.value / ascentRate)
tts.innerHTML = tts.value

let discrepancyFactor = 1
let svFailure = false
let sv = document.getElementById('solenoid_valve')
let votingFailure = false
let nerdCenter = document.getElementById('nerd-center')
let warningMessageFC10 = document.getElementById('nerd-warning-FC10')
let o2RunawayFailure = false
let diluentRunawayFailure = false
let co2AbsorbentFailure = false
let counterlungADVFailure = false
let adv = document.getElementById('adv_valve')
adv.textContent = '- ADV'
let refreshADV
let causticCocktail = false
let randomNo

let showSolutions = false
let isFC1Active = false
let isFC2Active = false
let isFC3Active = false
let isFC4Active = false
let isFC5Active = false
let isFC6Active = false
let isFC7Active = false
let isFC8Active = false
let isFC9Active = false
let isFC10Active = false
let isFC11Active = false
let isFC12Active = false
let isFC13Active = false
let isFC14Active = false
let isFC15Active = false
let isFC16Active = false

// TIMER
let minutesLabel = document.getElementById("minutes");
let secondsLabel = document.getElementById("seconds");
let totalSeconds = 0;
setInterval(setTime, 1000);

function setTime() {
  ++totalSeconds;
  secondsLabel.innerHTML = pad(totalSeconds % 60);
  minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
}

function pad(val) {
  var valString = val + "";
  if (valString.length < 2) {
    return "0" + valString;
  } else {
    return valString;
  }
}

// SENSORS
function checkSensors () {
  ATA = depth.value / 10 + 1
  fO2 = document.getElementById('fO2').value / 100
  fHe = document.getElementById('fHe').value / 100
  fN2 = 1 - fO2 - fHe

  if ( isFC5Active && sensor1.value > 1.1 ) {
    sensor1.value = 1.11
    sensor2.value = 1.15
  } else {
    sensor1.value = loopO2
    sensor2.value = loopO2 * 1.01
  }

  sensor3.value = loopO2 * 0.99 * discrepancyFactor

  sensor1.innerHTML = sensor1.value.toFixed(2)
  sensor2.innerHTML = sensor2.value.toFixed(2)
  sensor3.innerHTML = sensor3.value.toFixed(2)

  function sensorAlert (x) {
    if ( x.value < 0.4 || x.value > 1.6) {
      x.classList.add('danger')
    } else {
      x.classList.remove('danger')
    }
  }

  sensorAlert (sensor1)
  sensorAlert (sensor2)
  sensorAlert (sensor3)

  if ( sensor1.value >= 0.16 && sensor1.value <= 2 ) {
    document.getElementById('app').classList.add('has-background-info')
    document.getElementById('app').classList.remove('has-background-danger')
    document.getElementById('messages').classList.add('passive')
    document.getElementById('reason').textContent = ""
    document.getElementById('symptoms').classList.add('is-hidden')
    document.getElementById('hypoxia_symptoms').classList.add('is-hidden')
    document.getElementById('fc15symptoms').classList.add('is-hidden')
  } else if (sensor1.value < 0.16) {
    document.getElementById('app').classList.add('has-background-danger')
    document.getElementById('app').classList.remove('has-background-info')
    document.getElementById('messages').classList.remove('passive')
    document.getElementById('reason').textContent = "Hypoxia"
    document.getElementById('symptoms').classList.remove('is-hidden')
    document.getElementById('hypoxia_symptoms').classList.remove('is-hidden')
  } else if (sensor1.value > 2) {
    document.getElementById('app').classList.add('has-background-danger')
    document.getElementById('app').classList.remove('has-background-info')
    document.getElementById('messages').classList.remove('passive')
    document.getElementById('reason').textContent = "Hyperoxia"
    document.getElementById('symptoms').classList.remove('is-hidden')
    document.getElementById('fc15symptoms').classList.remove('is-hidden')
  } 
  
  if (loopO2 <= 0.01 ) {
    loopO2 = 0.01
  }

  // Check Gas Mix 
  fO2 = document.getElementById('fO2').value / 100
  fHe = document.getElementById('fHe').value / 100

  if ( (fO2 + fHe) > 1 ) {
    document.getElementById('fHe').classList.add('has-text-warning')
  } else {
    document.getElementById('fHe').classList.remove('has-text-warning')
  }
}

checkSensors ();

// O2 USAGE
function o2consumption () {
  o2scr = 0.003
  setInterval(seto2scr, 1000)

  function seto2scr () {
    loopO2 = loopO2 - o2scr
    checkSensors ()
    checkNarcosis ()
    checkDensity ()
  }
}

o2consumption ()

// MANUEL ADDITIONAL VALVES
function mavDiluent () {
  ATA = depth.value / 10 + 1
  ppO2 = fO2 * ATA

  if ( (loopO2 / ATA) > (ppO2 + 0.04) ) {
    loopO2 = loopO2 - 0.05
  } else {
    loopO2 = ppO2
  }

  checkSensors ()
}

function mavOxygen () {
  ATA = depth.value / 10 + 1

  if (loopO2 / ATA < 0.94) {
    loopO2 = loopO2 + 0.05
  } else {
    loopO2 = 1 * ATA
  }

  checkSensors ()
}



/* -------- DEPTH CHANGES -------- */
function descend () {
  if(depth.value < 60) {
    depth.value = depth.value + 5;
    depth.innerHTML = depth.value;
    tts.value = Math.ceil(depth.value / ascentRate);
    tts.innerHTML = tts.value;
    ATA = depth.value / 10 + 1
    loopO2 = loopO2 / (ATA - .5) * ATA
    checkSensors ()
  } else {
    return;
  }
}

function ascend () {
  if(depth.value > 0) {
    depth.value = depth.value - 5;
    depth.innerHTML = depth.value;
    tts.value = Math.ceil(depth.value / ascentRate);
    tts.innerHTML = tts.value;
    ATA = depth.value / 10 + 1
    loopO2 = loopO2 / (ATA + .5) * ATA
    checkSensors ()
  } else {
    return;
  }
}

function autoAscend () {
  document.getElementById('descend').disabled = true
  document.getElementById('ascend').disabled = true
  document.getElementById('auto_ascend').disabled = true

  setTimeout( function () {
    depth.value = depth.value - 1;
    depth.innerHTML = depth.value;
    tts.value = Math.ceil(depth.value / ascentRate);
    tts.innerHTML = tts.value;
    ATA = depth.value / 10 + 1
    loopO2 = loopO2 / (ATA + .1) * ATA
    checkSensors ()

    if (0 < depth.value) {
      autoAscend ();
    } else {
      document.getElementById('descend').disabled = false
      document.getElementById('ascend').disabled = false
      document.getElementById('auto_ascend').disabled = false
    }
  }, 1000)
}

// FLUSHES
function diluentFlush () {
  ATA = depth.value / 10 + 1
  loopO2 = fO2 * ATA

  checkSensors ()
}

function oxygenFlush () {
  ATA = depth.value / 10 + 1
  loopO2 = 1 * ATA

  checkSensors ()
}

// SETPOINT
function checkSetpoint () {
  if ( svFailure ) {
    return
  } else {
    let setpoint = document.querySelector('#setpoint input:checked')
    
    if (sensor1.value < setpoint.value) {
      if ( !o2RunawayFailure ) {
        mavOxygen ()
      }

      sv.textContent = '- Solenoid Valve [ACTIVE]'
      sv.classList.add('active')
    } else {
      sv.textContent = '- Solenoid Valve'
      sv.classList.remove('active')
    }
  }
}

setInterval(checkSetpoint, 1500);

// NERD
function showNerd () {
  document.getElementById('nerd').classList.add('visible')
  document.getElementById('showNerd').classList.add('is-hidden')
  document.getElementById('hideNerd').classList.remove('is-hidden')
}

function hideNerd () {
  document.getElementById('nerd').classList.remove('visible')
  document.getElementById('hideNerd').classList.add('is-hidden')
  document.getElementById('showNerd').classList.remove('is-hidden')
}

// RESET DATA
function resetData () {
  depth.value = 0
  depth.innerHTML = depth.value

  diluentFlush ()
}