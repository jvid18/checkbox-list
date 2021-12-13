import CheckboxList from '/src/CheckboxList.js'

const settings = {
  selectAll: true,
  search: true,
  apply: { saveOnApply: true },
  items: [
    ...Array(10)
      .fill(0)
      .map((_, i) => ({
        id: `checkbox-${i + 1}`,
        label: `Checkbox ${i + 1}`,
        value: i + 1,
        checked: [3, 6].includes(i + 1),
      })),
  ],
  onApply: (items) => {
    console.log(items)
  },
  onChange: (items) => {
    console.log(items)
  },
}

const el = document.getElementById('checkbox-list')

window.cl = new CheckboxList(settings, el)
