Underline tab navigation for switching views within a page (e.g. All / In transit / Delivered).

```jsx
<Tabs value={tab} onChange={setTab} tabs={[
  {key:'all', label:'All', count:1284},
  {key:'transit', label:'In transit', count:412},
  {key:'delivered', label:'Delivered', count:806},
]} />
```

Active tab gets an orange underline (spring-eased) and orange-tinted count chip.
