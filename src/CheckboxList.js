import en from './locale/en.js'

class CheckboxList {
  _locale = {}
  _selected = []
  _searchedValue = ''

  constructor(settings, el) {
    this._el = el

    this._setLocale(settings.locale)
    this._setSettings(settings)

    this.init()
  }

  init() {
    this._el.innerHTML = this._generateHTML()
    this._nodeItemsContainer = this._el.querySelector('.checkbox-list__items')
    this._nodeItems = this._nodeItemsContainer.querySelectorAll(
      '.checkbox-list__item'
    )
    this._nodeSearch = this._el.querySelector('.checkbox-list__search')
    this._nodeSelectAll = this._el.querySelector('.checkbox-list__select-all')
    this._nodeApply = this._el.querySelector('.checkbox-list__apply-btn')
    this._nodeCancel = this._el.querySelector('.checkbox-list__cancel-btn')

    this._initSelected()
    this._syncCount()
    this._bindEvents()
  }

  _initSelected() {
    const { items, selectAll } = this._settings
    const { checked } = selectAll

    items.forEach((item) => {
      if (item.checked || checked) this._selected.push(`${item.value}`)
    })
  }

  _setLocale(locale) {
    this._locale = {
      ...en,
      ...locale,
    }
  }

  _setSettings(settings) {
    const enabledCancel =
      settings.apply?.enabled ||
      settings.apply ||
      settings.cancel?.enabled ||
      settings.cancel

    this._settings = {
      search: settings.search || false,
      title: settings.title || 'Choice',
      apply: {
        enabled: settings.apply?.enabled || settings.apply || false,
        className: settings.apply?.className || '',
        saveOnApply: settings.apply?.saveOnApply || false,
      },
      cancel: {
        enabled: enabledCancel,
        className: settings.cancel?.className || '',
      },
      selectAll: {
        enabled: settings.selectAll || false,
        class: settings.selectAll?.className || 'select-all',
        checked: settings.selectAll?.checked || false,
        callOnChangeForEachItem:
          settings.selectAll?.callOnChangeForEachItem || false,
        ...settings.selectAll,
      },
      items: settings.items || [],
    }

    this.isSelectAll = this._settings.selectAll.checked

    this._onSelectAllCallback = settings.onSelectAll || (() => {})
    this._onSearchCallback = settings.onSearch || (() => {})
    this._onChangeCallback = settings.onChange || (() => {})
    this._onApplyCallback = settings.onApply || (() => {})
    this._onCancelCallback = settings.onCancel || (() => {})
  }

  _generateHTML() {
    const { title } = this._settings

    return `
      <details class="checkbox-list" open>
        <summary class="checkbox-list__title">
          <span class="checkbox-list__summary-text">${title}</span>
          ${this._generateSelectedCount()}
        </summary>
        <div class="checkbox-list__content">
          ${this._generateContentHTML()}
        </div>
      </details>
    `
  }

  _generateContentHTML() {
    const { items, search, selectAll, apply } = this._settings
    const itemsHTML = items
      .map((item) => this._generateItemHTML(item, selectAll.checked))
      .join('')

    return `
        ${search || selectAll.enabled ? this._generateFiltersHTML() : ''}
        <ul class="checkbox-list__items">${itemsHTML}</ul>
        ${apply.enabled ? this._generateActionsHTML() : ''}
      `
  }

  _generateFiltersHTML() {
    const { search, selectAll } = this._settings

    return `
      <div class="checkbox-list__filters">
        ${search ? this._generateSearchHTML() : ''}
        ${selectAll.enabled ? this._generateSelectAllHTML() : ''}
      </div>
    `
  }

  _generateItemHTML(item, isSelectAll) {
    const { id, label, value, checked } = item
    const isChecked = checked || isSelectAll ? 'checked' : ''

    return `
      <li class="checkbox-list__item">
        <label class="checkbox-list__label">
          <input type="checkbox" class="checkbox-list__checkbox" id="${id}" value="${value}" ${isChecked} >
          <span class="checkbox-list__checkbox-text">${label}</span>
        </label>
      </li>
    `
  }

  _generateSearchHTML() {
    const { search } = this._locale
    return `
      <div class="checkbox-list__search">
        <input type="text" placeholder="${search}">
      </div>
    `
  }

  _generateSelectAllHTML() {
    const { checked } = this._settings.selectAll
    const { selectAll } = this._locale
    const isChecked = checked ? 'checked' : ''

    return `
      <div class="checkbox-list__select-all">
        <label class="checkbox-list__select-all-label">
          <input type="checkbox" class="checkbox-list__select-all-checkbox" ${isChecked}>
          <span class="checkbox-list__select-all-text">${selectAll}</span>
        </label>
      </div>
    `
  }

  _generateActionsHTML() {
    return `
      <div class="checkbox-list__actions">
        ${this._generateApplyHTML()}
        ${this._generateCancelHTML()}
      </div>
    `
  }

  _generateApplyHTML() {
    return `
      <div class="checkbox-list__apply">
        <button class="checkbox-list__apply-btn">Apply</button>
      </div>
    `
  }

  _generateCancelHTML() {
    return `
      <div class="checkbox-list__cancel">
        <button class="checkbox-list__cancel-btn">Cancel</button>
      </div>
    `
  }

  _generateSelectedCount() {
    const count =
      this._selected.length === 0 ? '' : `(${this._selected.length})`

    return `
      <span class="checkbox-list__summary-count">${count}</span>
    `
  }

  _syncCount() {
    const countSelected = this._nodeItemsContainer.querySelectorAll(
      '.checkbox-list__checkbox:checked'
    ).length

    const summaryCount = this._el.querySelector('.checkbox-list__summary-count')

    summaryCount.innerText = countSelected === 0 ? '' : `(${countSelected})`
  }

  _bindEvents() {
    this._bindSearch()
    this._bindSelectAll()
    this._bindCheckbox()
    this._bindApply()
    this._bindCancel()
  }

  _bindSearch() {
    const { search } = this._settings

    if (!search) return

    const nodeSearch = this._nodeSearch

    nodeSearch.addEventListener('input', (e) => {
      this.search(e.target.value)
    })
  }

  _bindSelectAll() {
    const { selectAll } = this._settings

    if (!selectAll.enabled) return

    const nodeSelectAll = this._nodeSelectAll

    nodeSelectAll.addEventListener('change', (e) => {
      this.selectAll(e.target.checked)
    })
  }

  _bindCheckbox() {
    const itemsContainer = this._nodeItemsContainer

    itemsContainer.addEventListener('change', (e) => {
      const { checked, value } = e.target

      this.change(value, checked)
    })
  }

  _bindApply() {
    const { apply } = this._settings

    if (!apply.enabled) return

    this.nodeApply?.addEventListener('click', () => {
      this.apply()
    })
  }

  _bindCancel() {
    const { cancel } = this._settings

    if (!cancel.enabled) return

    this.nodeCancel?.addEventListener('click', () => {
      this.cancel()
    })
  }

  _syncSelectAll() {
    const { selectAll } = this._settings
    if (!selectAll.enabled) return

    let countHidden = 0
    let countChecked = 0
    let countFilteredChecked = 0

    this._nodeItems.forEach((item) => {
      const checkbox = item.querySelector('.checkbox-list__checkbox')
      const isHidden = item.classList.contains('hidden')
      const isChecked = checkbox.checked

      if (isChecked) {
        countChecked++
      }

      if (isChecked && !isHidden) {
        countFilteredChecked++
      }

      if (isHidden) {
        countHidden++
      }
    })

    const checkboxSelectAll = this._nodeSelectAll.querySelector(
      '.checkbox-list__select-all-checkbox'
    )

    this.countFiltered = this._nodeItems.length - countHidden
    this.countFilteredChecked = countFilteredChecked
    this.isSomeChecked = countChecked > 0
    this.isAllChecked = countChecked === this._nodeItems.length
    this.isAllUnchecked = countChecked === 0
    this.isAllFilteredChecked =
      countFilteredChecked === this._nodeItems.length - countHidden

    checkboxSelectAll.checked = this.isAllFilteredChecked || this.isAllChecked
  }

  _syncHTMLWithSelected() {
    const items = this._nodeItemsContainer.querySelectorAll(
      '.checkbox-list__checkbox'
    )

    items.forEach((item) => {
      const { checked, value } = item

      if (checked) {
        !this._selected.includes(value) && this._selected.push(value)
      } else {
        this._selected = this._selected.filter((item) => item !== value)
      }
    })
  }

  _syncSelectedWithHTML() {
    const items = this._nodeItemsContainer.querySelectorAll(
      '.checkbox-list__checkbox'
    )

    items.forEach((item) => {
      const { value } = item

      if (this._selected.includes(value)) {
        item.checked = true
      } else {
        item.checked = false
      }
    })
  }

  _onSearch(value) {
    this._onSearchCallback(value)
  }

  _onSelectAll(value) {
    this._onSelectAllCallback(value)
  }

  _onChange(value) {
    const { saveOnApply } = this._settings.apply
    !saveOnApply && this._syncHTMLWithSelected()

    this._syncCount()
    this._syncSelectAll()
    this._onChangeCallback(this._selected, value)
  }

  _onApply() {
    this._syncSelectAll()
    this._onApplyCallback(this._selected)
  }

  _onCancel() {
    this.search()
    this._syncSelectAll()

    this._onCancelCallback()
  }

  search(value = '') {
    this._searchValue = value
    this._nodeSearch.querySelector('input').value = value

    this._nodeItems.forEach((item) => {
      const text = item.querySelector('.checkbox-list__checkbox-text').innerText
      const isMatch = text.toLowerCase().includes(value.toLowerCase())

      if (isMatch) {
        item.classList.remove('hidden')

        item.style.display = 'block' // TODO: delete this line
      } else {
        const checkbox = item.querySelector('.checkbox-list__checkbox')
        item.classList.add('hidden')
        checkbox.checked = false

        item.style.display = 'none' // TODO: delete this line
      }
    })

    this._onSearch(value)
    this._onChange()
  }

  selectAll(value) {
    const { callOnChangeForEachItem } = this._settings.selectAll
    const checkboxSelectAll = this._nodeSelectAll.querySelector(
      '.checkbox-list__select-all-checkbox'
    )

    checkboxSelectAll.checked = value

    this._nodeItems.forEach((item) => {
      const checkbox = item.querySelector('.checkbox-list__checkbox')
      const isHidden = item.classList.contains('hidden')

      if (!isHidden) checkbox.checked = value
      else checkbox.checked = false

      callOnChangeForEachItem && this._onChange(checkbox.value)
    })

    this._onSelectAll(value)
    this._onChange(value)
  }

  change(value, checked) {
    const checkbox = this._nodeItemsContainer.querySelector(
      `.checkbox-list__checkbox[value="${value}"]`
    )
    if (!checkbox) return

    checkbox.checked = checked

    this._onChange(value)
  }

  apply() {
    this._syncHTMLWithSelected()
    this._onApply()
  }

  cancel() {
    this._syncSelectedWithHTML()
    this._onCancel()
  }
}

export default CheckboxList

/* TODO:
 *
 * Handle state before apply and cancel
 * Add not found message on search
 * Add button to keep selected items on search
 * Use variable in locale object to text
 * Make method to get summary count text for use in _generateSelectedCount too
 * Implement custom classes for generated elements
 *
 * Make styles for checkbox-list
 *
 */
