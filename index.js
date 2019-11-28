
const axios = require('axios');

const baseurl = 'https://skatteverket.entryscape.net/rowstore/dataset/88320397-5c32-4c16-ae79-d36d95b17b95';// +
//require('querystring').escape('tabellnr=33&inkomst fr.o.m.=60601&år=2019');

const getData = async url => {
    try {
        const response = await axios.get(url, { headers: { Accept: 'application/json' } });
        const { results } = response.data;
        return results[0];
    } catch (error) {
        console.log('Error: ' + error);
    }
}

exports.helloHttp = async (req, res) => {
    switch (req.method) {
        //case 'OPTION'
        case 'GET':
            const tab = req.query.tab || '33';
            const year = req.query.year || Date.now().year;
            const salary = req.query.salary || 0;

            const incomeMin = Math.floor(salary / 200) * 200 + 1;

            const url = `${baseurl}?tabellnr=${tab}&%C3%A5r=${year}&inkomst+fr.o.m.=${incomeMin}`;

            const taxAmounts = await getData(url);

            const tax = parseInt(taxAmounts['kolumn 1'], 10);
            const afterTax = parseInt(salary, 10) - tax;

            res.status(200).send({ salary, tax, afterTax });
            break;
        default:
            res.status(405).send({ error: 'Only GET allowed' });
            break;
    }
};