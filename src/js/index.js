import 'bootstrap';
import '../scss/index.scss';
import _ from 'lodash';
import { WebCPU } from 'webcpu';
import Worker from './gen.worker.js';
// import path from 'path';

let maxThreads = 0;
let workers = [];
let workersRunning = false;

function toggleWorkers() {
  const startBtn = document.getElementById('thread-start');
  const stopBtn = document.getElementById('thread-stop');
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
    startBtn.className += ' disabled';
    pBar.className = _.replace(pBar.className, ' d-none', '');
  } else {
    console.log(`terminating ${maxThreads} workers`);
    workers.forEach(w => {
      w.terminate();
      console.log(`${w._id}: terminated`);
    });
    workers = [];
    startBtn.className = _.replace(startBtn.className, ' disabled', '');
    stopBtn.className += ' disabled';
    pBar.className += ' d-none';
  }
}

$(document).ready(() => {
  const startBtn = document.getElementById('thread-start');
  const stopBtn = document.getElementById('thread-stop');
  $('#alert').click(() => {
    alert('jQuery works!');
  });
  WebCPU.detectCPU().then(result => {
    console.log(`Reported Cores: ${result.reportedCores}`);
    console.log(`Estimated Idle Cores: ${result.estimatedIdleCores}`);
    console.log(`Estimated Physical Cores: ${result.estimatedPhysicalCores}`);
    maxThreads = result.estimatedPhysicalCores * 3;
    document.getElementById('cpu-num').innerHTML = result.estimatedPhysicalCores;
  });
  startBtn.onclick = () => {
    toggleWorkers();
  };
  stopBtn.onclick = () => {
    toggleWorkers();
  };
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
