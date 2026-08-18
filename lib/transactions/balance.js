export function validateExpense(partitionBalance, amount) {
  return Number(partitionBalance) - Number(amount) >= 0;
}
