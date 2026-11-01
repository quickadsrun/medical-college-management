# Developer Implementation Notes

## Fee allocation algorithm
When a payment is received, create one `FeePayment`. If “oldest dues first” is selected, query the student's `MonthlyFee` rows ordered by month ascending where `payableAmount - paidAmount > 0`; allocate the payment amount across those rows; create `PaymentAllocation` records; update each row's `paidAmount` and status. For manual allocation, validate that allocations do not exceed each month's outstanding amount and total allocations equal payment amount.

## Defaulter reporting
For a date range, return monthly fee records with status PENDING or PARTIAL. Show both `feeRecordCount` and `uniqueStudentCount`. Sum `payableAmount - paidAmount` for outstanding. Do not count a student twice in unique student count when they owe multiple months.

## Concession rules
Concession is stored against the monthly fee record (and optionally mirrored in Concession for reporting). Never assume a student's concession is permanent. Support fixed amount and percentage. Preserve an audit trail for edits in production.

## Security
Implement RBAC, audit logs, server-side validation, rate limiting, encrypted secrets, database backups, and least-privilege access before production. Financial actions should be immutable/audited rather than hard-deleted.

## Receipt
Generate a receipt after successful payment with student identity, transaction ID, date, method, allocated months, original fee, concession, paid amount, and remaining balance.
