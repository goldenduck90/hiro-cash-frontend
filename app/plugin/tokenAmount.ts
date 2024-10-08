import { CURRENCIES_WITH_PLAIN_STYLE } from "~/plugin/constants";

export function tokenAmount(invoice: {
  currency: string;
  amountInMinor: number;
}) {
  function formatCurrency(minor: number) {
    const style = CURRENCIES_WITH_PLAIN_STYLE.includes(invoice.currency)
      ? "decimal"
      : "currency";

    var formatter = new Intl.NumberFormat("en-US", {
      style: style,
      currency: invoice.currency,

      // These options are needed to round to whole numbers if that's what you want.
      minimumFractionDigits: 2, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
      //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
    });

    return formatter.format(minor / 100); /* $2,500.00 */
  }

  const nativeFormatted = formatCurrency(invoice.amountInMinor);

  return nativeFormatted;
}
