import { rollCryptoDie } from './dice';

const CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excluded easily confused chars (0, 1, I, O)

/**
 * Generates a 6-digit collision-resistant alphanumeric sync code using CSPRNG
 */
export function generate6DigitSyncCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    const idx = rollCryptoDie(CHARSET.length) - 1;
    code += CHARSET[idx];
  }
  return code;
}
