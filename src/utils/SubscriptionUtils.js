export function isExpiredSubscription(subscription) {
  if (!subscription) {
    return true;
  }

  const { endDate } = subscription;
  if (!endDate) {
    return true;
  }

  const now = new Date();
  const end = new Date(endDate);
  return now > end;
}
