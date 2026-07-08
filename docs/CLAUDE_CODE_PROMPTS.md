# Claude Code Terminal Prompts — Run One at a Time

Paste these into the Claude Code terminal **in order**. Wait for each one to
finish and check the result before pasting the next. Each prompt is written
to be short (Claude Code already has `CLAUDE.md` for full context, so you
don't need to re-explain the project every time).

Do not paste multiple prompts at once. Do not skip ahead.

---

### Prompt 1 — Shared UI primitives
```
Read CLAUDE.md and docs/PRD.md section 10 (UI/UX Principles). Build the shared
UI primitives: Button, Card, Modal, a NumericKeypadInput component, and a
full-screen confirmation/toast component. Use the canvas Tailwind color.
Don't build any screens yet — just these reusable pieces.
```

### Prompt 2 — Auth
```
Read CLAUDE.md build order step 2. Build the Login screen and Supabase Auth
session handling, with role-based redirect (admin vs cem) based on the
profiles table. Include "Remember me" and a "Change Password" screen for CEMs.
```

### Prompt 3 — CEM check-in shell
```
Read CLAUDE.md build order step 3 and PRD section 5 + 11 (CEM App screens 2-4).
Build Building Selector, Location Selector (Warehouse/Floor/All  Floors), and
Today's Check-In checklist as READ-ONLY for now (no action buttons wired yet).
Pull real data from inventory_stock and products via Supabase.
```

### Prompt 4 — Delivery flow
```
Read CLAUDE.md build order step 4 and PRD section 5 step 3a. Build the Log
Delivery flow (warehouse only): quantity + price per unit (pre-filled with
last used price), auto-calculated total, confirm screen, and the ledger
insert + inventory_stock update logic.
```

### Prompt 5 — Consumption flow
```
Read CLAUDE.md build order step 5 and PRD section 5 step 3b. Build the Log
Consumption/Update Stock flow: quantity used + reason, confirm screen, hard
block if quantity exceeds current stock, ledger insert + stock update logic.
```

### Prompt 6 — Transfer flow
```
Read CLAUDE.md build order step 6 and PRD section 5 step 3c. Build the Log
Transfer Stock flow: quantity + from/to location, confirm screen, hard block
if quantity exceeds source stock, ledger insert + stock updates at both
locations.
```

### Prompt 7 — Product management
```
Read CLAUDE.md build order step 7 and PRD section 11 (Add New Product / Edit
Product). Build Add Product and Edit Product screens for CEMs, including the
soft dedup warning against existing normalized product names in that building.
```

### Prompt 8 — CEM ledger, alerts, note
```
Read CLAUDE.md build order step 8 and PRD section 11 (My Ledger, Alerts, My
Note). Build the CEM's scrollable filterable ledger view, the active
low-stock alerts list, and the single overwritable sticky note screen.
```

### Prompt 9 — Admin overview dashboard
```
Read CLAUDE.md build order step 9 and PRD section 11 (Admin Overview
Dashboard). Build the all-buildings stock health summary, clickable alerts,
and total spend view with day/week/month/custom filters.
```

### Prompt 10 — Admin building management
```
Read CLAUDE.md build order step 10 and PRD section 11 (Building Detail View,
Manage Buildings & Floors). Build the building drill-down view and CRUD
screens for buildings and floors (warehouse excluded from manual creation).
```

### Prompt 11 — CEM account creation
```
Read CLAUDE.md build order step 11 and PRD section 4.2 + 8 (RLS notes on CEM
account creation). Build the Manage CEM Assignments screen and the Create CEM
Account flow, including the Supabase Edge Function that uses the Admin API
(service role) to create the auth user + profiles row in one step. Admin
types the temporary password manually.
```

### Prompt 12 — Product catalog (admin)
```
Read CLAUDE.md build order step 12 and PRD section 11 (Product Catalog).
Build the admin's read-only product catalog view across all buildings with
the deactivate toggle only — no create/edit access for admin.
```

### Prompt 13 — Ledger history (admin, 3 tabs)
```
Read CLAUDE.md build order step 13 and PRD section 11 (Ledger History).
Build the three admin ledger history tables — Purchase/Delivery, Transfer,
Consume/Update — with the exact columns specified in the PRD and their
respective filters.
```

### Prompt 14 — Analytics
```
Read CLAUDE.md build order step 14 and PRD section 11 (Analytics). Build the
Recharts-based analytics view: spend by category/building/time, top-consumed
products, usage trend charts.
```

### Prompt 15 — Reports & export
```
Read CLAUDE.md build order step 15 and PRD section 13 (Reporting & Export).
Build PDF/Excel export for Purchase/Delivery history only, filterable by date
range, building, category, product.
```

### Prompt 16 — Low-stock alert automation
```
Read CLAUDE.md build order step 16 and PRD section 12 (Alerts Logic). Build
the Supabase Edge Function that generates a low_stock alert automatically on
every relevant ledger insert, based on each product's low_stock_threshold
(skip generation entirely if threshold is null).
```

---

## After all 16 prompts
Do a final pass: ask Claude Code to review the whole app against
`docs/PRD.md` section by section and list any gaps before you consider Phase
1 complete.
