'use strict';

const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'https://skatteverket.entryscape.net/rowstore/dataset/88320397-5c32-4c16-ae79-d36d95b17b95';

const getTaxes = async url => {
    try {
        const response = await axios.get(url, { headers: { Accept: 'application/json' } });
        const { results } = response.data;

        const intervals = results.map(r =>  {
            return { start: parseInt(r['inkomst fr.o.m.'], 10), end: parseInt(r['inkomst t.o.m.'], 10) }
        });

        return intervals;
    } catch (error) {
        console.log('Error: ' + error);
    }
};

const fetchLimits = async () => {
    const tab = '33';
    const year = (new Date()).getFullYear();
    let url = `${BASE_URL}?tabellnr=${tab}&%C3%A5r=${year}&inkomst+fr.o.m.=~^[89]\\d{4}|\\d{6}`;
    const limits = await getTaxes(url);
    //console.log(JSON.stringify(data));

    fs.writeFile('highLimits.js', `exports.limits = ${JSON.stringify(limits)};`, (err) => {
        if (err) throw err;
    });
};



fetchLimits();

