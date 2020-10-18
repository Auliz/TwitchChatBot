const fetch = require('node-fetch');
const jokes = {
  joke: '',
};

const objReq = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};
const url = 'https://icanhazdadjoke.com/';

// async function dadJoke() {
//   return fetch('https://icanhazdadjoke.com/', objReq)
//     .then((resp) => resp.json())
//     .then((joke) => {
//       return joke;
//     });
// }

let fetchDataFromApi = async () => {
  let response = await fetch(url, objReq);
  let result = await response.json();
  return result;
};

async function caller() {
  const json = await fetchDataFromApi();
  jokes.joke = json.joke;
  console.log(jokes.joke);
}
caller();

console.log('====================================');
console.log(jokes.joke);
console.log('====================================');

// setTimeout(() => {
//   caller();
// }, 1000);

// if (jokes.joke === '') {
//   console.log('Fetch not fast enough.');
// } else {
//   console.log(jokes.joke);
// }
