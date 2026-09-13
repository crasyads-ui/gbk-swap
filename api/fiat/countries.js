export default function handler(req, res) {
  const countries = [
    { alpha2: "IN", name: "India", currencyCode: "INR", isAllowed: true },
    { alpha2: "US", name: "United States", currencyCode: "USD", isAllowed: true },
    { alpha2: "GB", name: "United Kingdom", currencyCode: "GBP", isAllowed: true },
    { alpha2: "AE", name: "United Arab Emirates", currencyCode: "AED", isAllowed: true },
    { alpha2: "SG", name: "Singapore", currencyCode: "SGD", isAllowed: true },
    { alpha2: "CA", name: "Canada", currencyCode: "CAD", isAllowed: true },
    { alpha2: "AU", name: "Australia", currencyCode: "AUD", isAllowed: true },
    { alpha2: "JP", name: "Japan", currencyCode: "JPY", isAllowed: true },
    { alpha2: "CN", name: "China", currencyCode: "CNY", isAllowed: true },
    { alpha2: "DE", name: "Germany", currencyCode: "EUR", isAllowed: true },
    { alpha2: "FR", name: "France", currencyCode: "EUR", isAllowed: true }
  ];

  res.status(200).json({
    success: true,
    countries
  });
}
