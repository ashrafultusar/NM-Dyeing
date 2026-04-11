export function buildLedger(billings, payments, openingBalance = 0, initialCharge = 0, initialPayment = 0, savedRecordIds = []) {
    let startBal = openingBalance;
    if (initialCharge > 0 || initialPayment > 0) {
        startBal += initialPayment - initialCharge;
    }
    const combined = [
        ...billings.map((b) => ({
            date: b.createdAt, provider: "CALENDER BILL",
            displayOrderId: b.displayOrderId || "N/A",
            companyName: b.companyName || "Unknown",
            description: `Invoice: ${b.invoiceNumber}`,
            qty: b.totalQty, price: b.price, charge: b.total, payment: 0, type: "debit", colour: b.colour,
            clothType: b.clotheType || b.clothType, quality: b.quality, sillName: b.sillName, finishingType: b.finishingType,
            recordId: b._id, modelType: "BillingSummary", isSaved: savedRecordIds.includes(b._id.toString()),
        })),
        ...payments.map((p) => ({
            date: p.date, provider: p.method.toUpperCase(),
            description: p.description || "Payment Received",
            charge: 0, payment: p.amount, type: "credit",
            recordId: p._id, modelType: "Payment", isSaved: savedRecordIds.includes(p._id.toString()),
        })),
    ];
    combined.sort((a, b) => new Date(a.date) - new Date(b.date));
    let bal = startBal;
    return combined.map((item) => { bal += item.payment - item.charge; return { ...item, balance: bal }; });
}

export function fmtDate(d) { return new Date(d).toLocaleDateString("en-GB"); }
