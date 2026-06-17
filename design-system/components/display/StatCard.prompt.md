A dashboard KPI tile — big rounded number, delta pill, icon accent. Use in metric grids.

```jsx
<StatCard label="On-time rate" value="96.4" unit="%" delta="2.1%" deltaDir="up" tone="success" icon={<ClockIcon/>} />
```

`tone` colors the icon chip. `deltaDir="down"` flips the arrow and reds the pill.
