export default class Autocomplete {
  constructor(rootEl, options = {}) {
    options = Object.assign({ numOfResults: 10, data: [] }, options);
    Object.assign(this, { rootEl, options });

    this.init();
  }

  onQueryChange(query) {
    let results;
    //check if there is an endpoint provided
    if (this.options.endPoint) {
      this.getEndPointResults(query, this.options.endPoint);
    } else {
      this.getResults(query, this.options.data);
    }
  }

  /**
   * Given an array and a query, return a filtered array based on the query.
   */
  getResults(query, data) {
    if (!query) return [];

    // Filter for matching strings
    let results = data.filter((item) => {
      return item.text.toLowerCase().includes(query.toLowerCase());
    });

    results = results.slice(0, this.options.numOfResults);
    this.updateDropdown(results);
    this.keyboardNav(results);
  }

  getEndPointResults(query, endPoint) {
    if (!query)  return [];

    let results

    fetch(`${endPoint}${query}`)
    .then((response) => {
      if(response.ok) {
          return response.json();
      } else {
          throw new Error('Server response wasn\'t OK');
      }
    })
    .then((data) => {
      results = data.items.map((child) => {
        return {text: child.login}
      })
      this.updateDropdown(results);
      this.keyboardNav(results);
    })
  }

  updateDropdown(results) {
    this.listEl.innerHTML = '';
    this.listEl.appendChild(this.createResultsEl(results));
  }

  keyboardNav(results) {
    const resultsLength = results.length
    let activeIndex
    let previousIndex

    document.addEventListener('keydown', (event) => {
      if (event.keyCode == 40) {
        if (activeIndex == undefined) {
          this.listEl.children[0].classList.add('active')
          activeIndex = 0
        } else {
          previousIndex = activeIndex;
          activeIndex++;
          this.listEl.children[activeIndex].classList.add('active');
          this.listEl.children[previousIndex].classList.remove('active');
        }
      }

      if (event.keyCode == 38) {
        if (activeIndex == undefined) {
          activeIndex = resultsLength-1
          this.listEl.children[activeIndex].classList.add('active')
        } else {
          previousIndex = activeIndex;
          activeIndex--;
          this.listEl.children[activeIndex].classList.add('active');
          this.listEl.children[previousIndex].classList.remove('active');
        }
      }

      if (event.keyCode === 13) {
        const { onSelect } = this.options;
        if (typeof onSelect === 'function') onSelect(this.listEl.children[activeIndex].innerText);
      }

    })
  }

  createResultsEl(results) {
    const fragment = document.createDocumentFragment();
    results.forEach((result) => {
      const el = document.createElement('li');
      Object.assign(el, {
        className: 'result',
        textContent: result.text
      });

      // Pass the value to the onSelect callback
      el.addEventListener('click', (event) => {
        const { onSelect } = this.options;
        if (typeof onSelect === 'function') onSelect(result.value);
      });

      fragment.appendChild(el);
    });
    return fragment;
  }

  createQueryInputEl() {
    const inputEl = document.createElement('input');
    Object.assign(inputEl, {
      type: 'search',
      name: 'query',
      autocomplete: 'off',
    });

    inputEl.addEventListener('input', event =>
      this.onQueryChange(event.target.value));

    return inputEl;
  }

  init() {
    // Build query input
    this.inputEl = this.createQueryInputEl();
    this.rootEl.appendChild(this.inputEl)

    // Build results dropdown
    this.listEl = document.createElement('ul');
    Object.assign(this.listEl, { className: 'results' });
    this.rootEl.appendChild(this.listEl);
  }
}