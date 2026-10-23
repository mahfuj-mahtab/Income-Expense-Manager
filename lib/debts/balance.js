export function roundMoney(value) {
  return Math.round(Number(value) * 100) / 100;
}

export function outstandingAmount(amount, repaidAmount) {
  return Math.max(0, roundMoney(Number(amount) - Number(repaidAmount || 0)));
}

export function debtStatus(amount, repaidAmount) {
  const repaid = roundMoney(repaidAmount || 0);
  const outstanding = outstandingAmount(amount, repaid);
  if (outstanding <= 0) return 'repaid';
  if (repaid > 0) return 'partial';
  return 'open';
}

export function canTakeDebt(partitionBalance, amount) {
  const balance = roundMoney(partitionBalance);
  const value = roundMoney(amount);
  return balance > 0 && value > 0 && value <= balance;
}

export function canRepayDebt(outstanding, amount) {
  const value = roundMoney(amount);
  return value > 0 && value <= roundMoney(outstanding);
}
