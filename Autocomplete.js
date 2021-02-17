export default class Autocomplete {
  constructor(rootEl, options = {}) {
    options = Object.assign(
      {
        numOfResults: 5,
        data: [],
        endpoint: "https://api.github.com/search/users",
      },
      options
    );
    Object.assign(this, { rootEl, options });

    this.init();
  }

  async onQueryChange(query) {
    // Get data for the dropdown
    await this.getResults(query).then((res) => this.updateDropdown(res));
  }

  /**
   * Given an array and a query, return a filtered array based on the query.
   */
  async getResults(query) {
    let { numOfResults, endpoint, data } = this.options;
    if (!query) return [];
    try {
      const res = await fetch(
        `${endpoint}?q=${query}&per_page=${numOfResults}`
      );
      data = await res.json();
    } catch (err) {
      console.log("Error: " + err);
    }
    return data.items;
  }

  updateDropdown(results) {
    this.listEl.innerHTML = this.createResultsEl(results);
    this.createArrowEventListener();
  }

  createResultsEl(results) {
    let listItems = "";
    results.map((item) => {
      listItems =
        listItems +
        `<li class="result"><a tabindex="0" href="${item.html_url}">${item.login}</li>`;
    });

    return listItems;
  }

  // Adapted from https://stackoverflow.com/a/45984973/4718107
  createArrowEventListener() {
    const ul = this.listEl;
    let liSelected;
    let index = -1;

    document.addEventListener(
      "keydown",
      function (e) {
        let len = ul.getElementsByTagName("li").length - 1;
        if (e.which === 40) {
          index++;
          //down
          if (liSelected) {
            removeClass(liSelected, "selected");
            let next = ul.getElementsByTagName("li")[index];
            if (typeof next !== undefined && index <= len) {
              liSelected = next;
            } else {
              index = 0;
              liSelected = ul.getElementsByTagName("li")[0];
            }
            liSelected.firstChild.focus();
            addClass(liSelected, "selected");
          } else {
            index = 0;

            liSelected = ul.getElementsByTagName("li")[0];
            liSelected.firstChild.focus();
            addClass(liSelected, "selected");
          }
        } else if (e.which === 38) {
          //up
          if (liSelected) {
            removeClass(liSelected, "selected");
            index--;
            let next = ul.getElementsByTagName("li")[index];
            if (typeof next !== undefined && index >= 0) {
              liSelected = next;
            } else {
              index = len;
              liSelected = ul.getElementsByTagName("li")[len];
            }
            liSelected.firstChild.focus();
            addClass(liSelected, "selected");
          } else {
            index = 0;
            liSelected = ul.getElementsByTagName("li")[len];
            liSelected.firstChild.focus();
            addClass(liSelected, "selected");
          }
        }
      },
      false
    );

    function removeClass(el, className) {
      if (el.classList) {
        el.classList.remove(className);
      } else {
        el.className = el.className.replace(
          new RegExp(
            "(^|\\b)" + className.split(" ").join("|") + "(\\b|$)",
            "gi"
          ),
          " "
        );
      }
    }

    function addClass(el, className) {
      if (el.classList) {
        el.classList.add(className);
      } else {
        el.className += " " + className;
      }
    }
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
    Object.assign(this.listEl, { className: "results", tabindex: "0" });
    this.rootEl.appendChild(this.listEl);
  }
}
