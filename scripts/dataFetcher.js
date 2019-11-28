const axios = require('axios');

const BASE_URL = 'https://skatteverket.entryscape.net/rowstore/dataset/88320397-5c32-4c16-ae79-d36d95b17b95';
const LIMIT_START = 80001;

const getNext = async url => {
    try {
        const response = await axios.get(url, { headers: { Accept: 'application/json' } });
        const { results } = response.data;
        console.log('Results: ' + results);
        return results[0];
    } catch (error) {
        console.log('Error: ' + error);
    }
};

fetchLimits = async () => {
    let done = false;
    let start = LIMIT_START;
    const tab = '33';
    const year = Date.now.year;
    let url = `${BASE_URL}?tabellnr=${tab}&%C3%A5r=${year}&inkomst+fr.o.m.=${start}`;

    while (!done) {
        console.log(url);
        const data = await getNext(url);
        console.log(data);
        done = true;
    }
};

console.log(fetchLimits());