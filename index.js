
const axios = require('axios');

const BASE_URL = 'https://skatteverket.entryscape.net/rowstore/dataset/88320397-5c32-4c16-ae79-d36d95b17b95';
const PERCENTAGE_THRESHOLD = 80000;

const getData = async url => {
    try {
        const response = await axios.get(url, { headers: { Accept: 'application/json' } });
        const { results } = response.data;
        return results[0];
    } catch (error) {
        console.log('Error: ' + error);
    }
}

exports.getTaxAmount = async (req, res) => {
    switch (req.method) {
        //case 'OPTION'
        case 'GET':
            const tab = req.query.tab || '33';
            const year = req.query.year || (new Date()).getFullYear();
            const salary = req.query.salary || 0;

            let incomeMin = 0;

            if (salary > PERCENTAGE_THRESHOLD) {
                const highLimits = require('./highLimits.js').limits;

                for (const range of highLimits) {
                    if (range.start <= salary && (salary < range.end || range.end == null)) {
                        incomeMin = range.start;
                    }
                }
           } else {
            incomeMin = Math.floor(salary / 200) * 200 + 1;
           }

            const url = `${BASE_URL}?tabellnr=${tab}&%C3%A5r=${year}&inkomst+fr.o.m.=${incomeMin}`;

            const taxAmounts = await getData(url);

            let taxAmount = 0;

            if (taxAmounts['antal dgr'] === '30B') {
                taxAmount = parseInt(taxAmounts['kolumn 1'], 10);
            } else {
                const percent = parseInt(taxAmounts['kolumn 1'], 10)/100;
                taxAmount = Math.round(salary*percent);
            }

            const afterTax = parseInt(salary, 10) - taxAmount;

            res.status(200).send({ salary, taxAmount, afterTax });
            break;
        default:
            res.status(405).send({ error: 'Only GET allowed' });
            break;
    }
};