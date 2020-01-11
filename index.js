const cors = require('cors')({
    origin: true,
  });
  
  const axios = require('axios');

const BASE_URL = 'https://skatteverket.entryscape.net/rowstore/dataset/88320397-5c32-4c16-ae79-d36d95b17b95';
const PERCENTAGE_THRESHOLD = 80000;

const getData = async url => {
    try {
        const response = await axios.get(url, { headers: { Accept: 'application/json' } });
        const { results } = response.data;
        return results;
    } catch (error) {
        console.log('Error: ' + error);
    }
}

const getIncomeSearch = salary => {
    switch (true) {
        case salary < 10000: 
            return '^.$|^....$';
        case salary < PERCENTAGE_THRESHOLD:
            const firstDigit = Math.floor(salary / 10000);

            return `^[${firstDigit-1}${firstDigit}]....$`;
        case salary > PERCENTAGE_THRESHOLD:
            return '^[89]....$|^[1-9].....';
    }
}

exports.getTaxAmount = async (req, res) => {
    switch (req.method) {
        case 'GET':
        	return cors(req, res, async () => {
                const tab = req.query.tab || '33';
                const year = req.query.year || (new Date()).getFullYear();
                const salary = parseInt(req.query.salary, 10) || 0;

                const incomeSearch = getIncomeSearch(salary);
                const url = `${BASE_URL}?tabellnr=${tab}&%C3%A5r=${year}&inkomst+fr.o.m.=${incomeSearch}`;

                const taxation = await getData(url);

                const taxAmounts = taxation.find(t => parseInt(t['inkomst fr.o.m.'], 10) <= salary && salary <= parseInt(t['inkomst t.o.m.'], 10));

                let taxAmount = 0;

                if (taxAmounts['antal dgr'] === '30B') {
                    taxAmount = parseInt(taxAmounts['kolumn 1'], 10);
                } else {
                    const percent = parseInt(taxAmounts['kolumn 1'], 10)/100;
                    taxAmount = Math.round(salary*percent);
                }

                const afterTax = parseInt(salary, 10) - taxAmount;

                res.status(200).send({ salary, taxAmount, afterTax });
        });

        default:
            res.status(405).send({ error: 'Only GET allowed' });
            break;
    }
};