// EAN-8, EAN-13, UPC-A checksum validation.
// Rejects garbage decodes from html5-qrcode before they hit the API.

export function isValidBarcode(code: string): boolean {
  const digits = code.replace(/\D/g, '')

  // EAN-8 = 8 digits, UPC-A = 12 digits, EAN-13 = 13 digits
  if (digits.length !== 8 && digits.length !== 12 && digits.length !== 13) {
    return false
  }

  const nums = digits.split('').map(Number)
  const check = nums.pop()!
  // EAN-13 / UPC-A: alternating 1,3 weights; EAN-8: alternating 3,1
  const weights =
    digits.length === 8
      ? nums.map((_, i) => (i % 2 === 0 ? 3 : 1))
      : nums.map((_, i) => (i % 2 === 0 ? 1 : 3))

  const sum = nums.reduce((acc, n, i) => acc + n * weights[i], 0)
  return (10 - (sum % 10)) % 10 === check
}
