# Example shapes

## Lead

{ "company": "Example Clinic", "website_url": "https://example.jp",
"segment": "professional_office", "score": 72, "stage": "contacted",
"pain_flags": ["eol_php", "missing_dmarc"], "preferred_template": "branded" }

## Scan result

{ "tls": { "valid": true, "days_left": 41 },
"php": { "version": "7.4", "eol": true },
"cms": { "name": "WordPress", "version": "5.8", "outdated": true },
"dns": { "spf": true, "dmarc": false },
"exposed": [".git/config"],
"score_inputs": { "technical_decay": 30, "segment_fit": 25 } }

## Invoice line items

[ { "description": "External Check", "quantity": 1,
"unit_price": 29800, "tax_rate": 10 } ]
