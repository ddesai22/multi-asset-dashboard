import yahooFinance from 'yahoo-finance2';
async function test() {
    console.log(typeof yahooFinance);
    console.log(Object.keys(yahooFinance));
    const res = await yahooFinance.search('market', { newsCount: 5 });
    console.log(JSON.stringify(res.news, null, 2));
}
test();
