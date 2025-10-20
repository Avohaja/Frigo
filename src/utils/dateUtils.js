import dayjs from "dayjs";

export function daysUntilExpiration(expirationDate) {
  return dayjs(expirationDate).diff(dayjs(), "day");
}
