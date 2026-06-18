Horizontal stepper for a delivery journey — show on shipment detail / tracking screens.

```jsx
<ProgressTracker current={2} steps={[
  {label:'Picked up', sub:'09:12'},
  {label:'In transit', sub:'11:40'},
  {label:'Out for delivery', sub:'14:05'},
  {label:'Delivered'},
]} />
```

`current` (0-based) marks the active step; earlier steps fill orange with a check.
