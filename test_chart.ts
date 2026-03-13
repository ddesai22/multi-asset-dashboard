import YahooFinance from 'yahoo-finance2';
const yf = new YahooFinance();
async function run() {
    try {
        const result = await yf.chart('AAPL', { period1: '2025-01-01', period2: '2025-01-10', interval: '1d' });
        console.log("Quotes size:", result.quotes.length);
        console.log("First quote:", result.quotes[0]);
    } catch (e) {
        console.error("Error:", e);
    }
}
run();
