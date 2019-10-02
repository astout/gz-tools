let fact = true;
let i = 0;
postMessage('starting');
onmessage = ({ data }) => {
  console.log('msg received: ', data);
};

while (fact === true) {
  // if (i % 10000 === 0) {
  //   postMessage('okay');
  // }
  i++;
}
