# My Tasks ordering

The toolbar offers the existing urgent-first order and two due-date orders. The selected mode
applies to the complete filtered result set on the server, before pagination. The client does not
sort only the rows already loaded.

| Mode            | Order                                              |
| --------------- | -------------------------------------------------- |
| `default`       | Urgent first, earliest due date, task ID ascending |
| `due_date_asc`  | Earliest due date, task ID ascending               |
| `due_date_desc` | Latest due date, task ID ascending                 |

Undated tasks are last in both date modes. Urgency remains visible and filterable, but does not
override the selected date order. Overdue tasks participate as earlier dates; they are not a
separate sorting bucket.

Sort remains selected while changing search/status filters, retrying or loading more within the
mounted table. It resets to urgent-first on remount, like the table's existing local filters. Each
user/filter/search/sort combination has its own query key and page chain, so late responses cannot
append pages from another order. Search is trimmed before query-key construction.

The authenticated personal endpoint still determines assignment scope. A sort choice does not
change which tasks a user may read, claim or update. The task cursor includes its order; cursors
must not be reused across modes.

## Dates

Sorting compares the persisted due-date timestamp, without truncation, timezone conversion or data
rewriting. Equal timestamps are ordered by task ID. Existing date-only input values are parsed by
the backend as midnight UTC. Existing frontend task formatting and overdue checks use the browser's
local timezone, while backend due-date validation uses Asia/Jerusalem. This feature preserves that
existing distinction and does not introduce an app-wide timezone migration.

No database migration or new environment variables are required for the client.
