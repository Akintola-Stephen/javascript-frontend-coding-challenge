export default class Autocomplete {
  constructor(rootEl, options = {}) {
    options = Object.assign({ numOfResults: 10, data: [] }, options);
    Object.assign(this, { rootEl, options });

    this.init();
  }

  init() {
    // Build query input
    this.inputEl = this.createQueryInputEl();
    this.rootEl.appendChild(this.inputEl);

    // Build results dropdown
    this.listEl = document.createElement("ul");
    Object.assign(this.listEl, { className: "results border-no" });
    this.rootEl.appendChild(this.listEl);

    //initialize list index as a reference for arrow keys
    this.listIndex = -1;

    //timeout variable allows slight delay in api call to account for continuous typing with debounce function
    this.timeout = null;

    //clear info when searching another input box
    this.inputEl.addEventListener("blur", () => {
      this.inputEl.value = "";
      // document.getElementById('select-text').innerHTML = '';
      // let selectImg = document.getElementById('select-img');
      // selectImg.src = '';
      // selectImg.alt = '';
    });

    //add event listener for arrow keys to the root element
    this.rootEl.addEventListener("keydown", this.onKeyboardEvent);
    //Event listener callback moved to onSelectElement to accomodate both click and Enter events
    this.rootEl.addEventListener("click", this.onSelectElement);

    //variable updates based on the current input field - used for testing only
    this.currentQuery = "";
  }


  createQueryInputEl() {
    const inputEl = document.createElement('input');
    Object.assign(inputEl, {
      type: 'search',
      name: 'query',
      autocomplete: 'off'
    });
    inputEl.addEventListener('input', event => {
      this.currentQuery = event.target.value;

      //check whether there is an onInputChange function to determine whether there is an API call or not
      if(typeof(this.options.onInputChange) !== 'function') {
        this.onQueryChange(event.target.value);
      } else {
        //reduce the number of api calls with debounce
        this.debounce(() => this.onQueryChange(event.target.value));
      }   
    });
      
    return inputEl;
  }



  onQueryChange(query) {
    // Get data for the dropdown
    let results = this.getResults(query, this.options.data);
    results = results.slice(0, this.options.numOfResults);

    this.updateDropdown(results);
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

    return results;
  }

  updateDropdown(results) {
    this.listEl.innerHTML = "";
    this.listEl.appendChild(this.createResultsEl(results));
  }

  createResultsEl(results) {
    const fragment = document.createDocumentFragment();
    results.forEach((result) => {
      const el = document.createElement("li");
      Object.assign(el, {
        className: "result",
        textContent: result.text,
      });

      // Pass the value to the onSelect callback
      el.addEventListener("click", (event) => {
        const { onSelect } = this.options;
        if (typeof onSelect === "function") onSelect(result.value);
      });

      fragment.appendChild(el);
    });
    return fragment;
  }

  createQueryInputEl() {
    const inputEl = document.createElement("input");
    Object.assign(inputEl, {
      type: "search",
      name: "query",
      autocomplete: "off",
    });

    inputEl.addEventListener("input", (event) =>
      this.onQueryChange(event.target.value)
    );

    return inputEl;
  }

  init() {
    // Build query input
    this.inputEl = this.createQueryInputEl();
    this.rootEl.appendChild(this.inputEl);

    // Build results dropdown
    this.listEl = document.createElement("ul");
    Object.assign(this.listEl, { className: "results" });
    this.rootEl.appendChild(this.listEl);
  }
}
