import { bignumber } from 'mathjs';

export default function getRatioNumber(num: number, base: 1 | 100 = 1) {
  return bignumber(1)
    .sub(bignumber(num ?? 0))
    .mul(100 * base)
    .floor()
    .div(100)
    .toNumber();
}
