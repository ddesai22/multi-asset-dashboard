const yahooFinance = require('yahoo-finance2').default;
async function run() {
    try {
        const result = await yahooFinance.search('finance', { newsCount: 2 });
        console.log("News:", result.news);
    } catch (e) {
        console.error("Error:", e);
    }
}
run();
