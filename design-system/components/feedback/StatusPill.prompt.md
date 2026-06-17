The canonical shipment-state indicator — use anywhere a package status appears (tables, detail headers, cards).

```jsx
<StatusPill status="transit" />
<StatusPill status="delivered" size="sm" />
```

Statuses: `delivered`, `transit`, `out` (out for delivery), `delayed`, `exception`, `pending`. Colors come straight from the status tokens.
