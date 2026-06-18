Custom dropdown for choosing one option from a short list (status filter, hub, sort).

```jsx
<Select label="Hub" value={hub} onChange={setHub} options={[{value:'cwb',label:'Curitiba'},{value:'gru',label:'São Paulo'}]} />
```

`options` accepts `{value,label}` objects or plain strings. Selected row is orange-tinted with a check.
