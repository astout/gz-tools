import 'bootstrap';
import '../scss/index.scss';
import _ from 'lodash';
import { WebCPU } from 'webcpu';
import Worker from './gen.worker.js';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { faArrowCircleUp } from '@fortawesome/free-solid-svg-icons/faArrowCircleUp';
import { faArrowCircleDown } from '@fortawesome/free-solid-svg-icons/faArrowCircleDown';
library.add(faArrowCircleUp);
library.add(faArrowCircleDown);
dom.watch();

// import path from 'path';

let maxThreads = 0;
let cpuCount = 0;
let runningThreads = 0;
let workers = [];
let workersRunning = false;

function toggleWorkers() {
  const startBtn = document.getElementById('thread-start');
  const stopBtn = document.getElementById('thread-stop');
  const incBtn = document.getElementById('thread-inc');
  const decBtn = document.getElementById('thread-dec');
  const pBar = document.getElementById('loading-bar');
  workersRunning = !workersRunning;
  if (workersRunning) {
    console.log(`creating ${maxThreads} workers`);
    for (let i = 0; i < maxThreads; i++) {
      const w = new Worker();
      w._id = i;
      w.onmessage = ({ data }) => {
        console.log(`${w._id}: ${data}`);
      };
      console.log(`${w._id}: created`);
      workers.push(w);
    }
    setTimeout(() => {
      console.log(`-- posting ${workers.length} messages --`);
      workers.forEach(w => {
        console.log(`posting message to ${w._id}`);
        w.postMessage('do you copy?');
      });
    }, 2000);
    console.log(stopBtn.className);
    stopBtn.className = _.replace(stopBtn.className, ' disabled', '');
    incBtn.className = _.replace(incBtn.className, ' disabled', '');
    decBtn.className = _.replace(decBtn.className, ' disabled', '');
    startBtn.className += ' disabled';
    pBar.className = _.replace(pBar.className, ' d-none', '');
    setRunningThreads(maxThreads);
  } else {
    console.log(`terminating ${maxThreads} workers`);
    workers.forEach(w => {
      w.terminate();
      console.log(`${w._id}: terminated`);
    });
    workers = [];
    startBtn.className = _.replace(startBtn.className, ' disabled', '');
    stopBtn.className += ' disabled';
    incBtn.className += ' disabled';
    decBtn.className += ' disabled';
    pBar.className += ' d-none';
    setRunningThreads(0);
  }
}

function increaseThreads() {
  for (let i = 0; i < 4; i++) {
    const w = new Worker();
    w._id = runningThreads + i;
    w.onmessage = ({ data }) => {
      console.log(`${w._id}: ${data}`);
    };
    console.log(`${w._id}: created`);
    workers.push(w);
  }
  setRunningThreads(runningThreads + 4);
}

function decreaseThreads() {
  for (let i = 0; i < 4; i++) {
    const w = workers.pop();
    if (w && _.isFunction(w.terminate)) {
      w.terminate();
      console.log(`${w._id}: terminated`);
    }
  }
  setRunningThreads(runningThreads - 4);
}

function setRunningThreads(num = 4) {
  runningThreads = num > 0 ? num : 0;
  document.getElementById('thread-num').innerHTML = runningThreads;
}

function setMaxThreads(num = 4) {
  maxThreads = num;
}

function setCpuCount(num = 0) {
  cpuCount = num;
  document.getElementById('cpu-num').innerHTML = cpuCount;
}

function isBtnEnabled(btn = {}) {
  console.log(btn);
  if (!btn) {
    return false;
  }
  return !_.includes(btn.className, 'disabled');
}

$(document).ready(() => {
  const startBtn = document.getElementById('thread-start');
  const stopBtn = document.getElementById('thread-stop');
  const incBtn = document.getElementById('thread-inc');
  const decBtn = document.getElementById('thread-dec');
  $('#alert').click(() => {
    alert('jQuery works!');
  });
  WebCPU.detectCPU().then(result => {
    console.log(`Reported Cores: ${result.reportedCores}`);
    console.log(`Estimated Idle Cores: ${result.estimatedIdleCores}`);
    console.log(`Estimated Physical Cores: ${result.estimatedPhysicalCores}`);
    setCpuCount(result.estimatedPhysicalCores);
    setMaxThreads(result.estimatedPhysicalCores * 4);
    setRunningThreads(0);
  });
  startBtn.onclick = () => {
    if (isBtnEnabled(startBtn)) {
      toggleWorkers();
    }
  };
  stopBtn.onclick = () => {
    if (isBtnEnabled(stopBtn)) {
      toggleWorkers();
    }
  };
  incBtn.onclick = () => {
    if (isBtnEnabled(incBtn)) {
      increaseThreads();
    }
  };
  decBtn.onclick = () => {
    if (isBtnEnabled(decBtn)) {
      decreaseThreads();
    }
  };
  $('[data-toggle="tooltip"]').tooltip();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
