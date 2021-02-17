class Autocomplete {
  constructor(rootEl, options = {}) {
    Object.assign(this, { rootEl, numOfResults: 10, data: [], options });
    this.init();
  }

  init() {
    // Build query input
    this.inputEl = this.createQueryInputEl();
    this.rootEl.appendChild(this.inputEl)

    // Build results dropdown
    this.listEl = document.createElement('ul');
    Object.assign(this.listEl, { className: 'results border-no' });
    this.rootEl.appendChild(this.listEl);

    //initialize list index as a reference for arrow keys
    this.listIndex = -1;

    //timeout variable allows slight delay in api call to account for continuous typing with debounce function
    this.timeout = null;

    //clear info when searching another input box
    this.inputEl.addEventListener('blur', () => {
      this.inputEl.value = '';
      // document.getElementById('select-text').innerHTML = '';
      // let selectImg = document.getElementById('select-img');
      // selectImg.src = '';
      // selectImg.alt = '';
    });

    //add event listener for arrow keys to the root element
    this.rootEl.addEventListener('keydown', this.onKeyboardEvent);
    //Event listener callback moved to onSelectElement to accomodate both click and Enter events
    this.rootEl.addEventListener('click', this.onSelectElement);

    //variable updates based on the current input field - used for testing only
    this.currentQuery = '';
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

  createResultsEl(results) {
    //get rid of extra border when result list is empty
    if(!results.length) {
      this.listEl.classList.remove('border-yes');
      this.listEl.classList.add('border-no');
    } else {
      this.listEl.classList.remove('border-no');
      this.listEl.classList.add('border-yes');
    }

    const fragment = document.createDocumentFragment();
    results.forEach((result, i) => {
      const el = document.createElement('li');

      //added otherValue property so value can be accessed from the node list and not just the results array
      Object.assign(el, {
        className: 'result',
        textContent: result.text,
        imgKey: result.img,
        otherValue: result.value
      });

      fragment.appendChild(el);
    });

    this.listIndex = -1;
    return fragment;
  }

  onQueryChange(query) {
    //empty the dropdown when input is empty
    if(!query) {
      this.updateDropdown([]);
      return;
    } 

    // Get data for the dropdown - reusable block of code for both API and non-API data sets (lines 101 and 104)
    const parseResults = () => {
      let results = this.getResults(query, (this.options.data || this.data));
      results = results.slice(0, this.numOfResults);

      this.updateDropdown(results);
    }

    const { onInputChange, url, queryEndParams, querySymbol, perPageKey  } = this.options;
    //check for API-calling instance
    if(typeof onInputChange === 'function') {
      //use IIFE to run async calls and retrieve and process data
      (async () => {
        //create the endpoint with the parameters given and call the API
        let compoundQuery = queryEndParams ? query + queryEndParams : query; 
        let perPage = perPageKey ? perPageKey + this.numOfResults : '';
        const initialData = await this.getAPIData(`${url}?${querySymbol}${compoundQuery}${perPage}`);
        //update this.data with API-specific code in this.options.onInputChange
        //console.log('called api!');
        this.data = onInputChange(initialData);
        parseResults();  
      })();
    } else {
      parseResults();
    }
    return;
  }

  getAPIData = async (endpoint) => {
    const results = await fetch(endpoint).catch(err => new Error("Could not get data. " + err));
    if(results.ok) {
      return await results.json().catch(err => new Error("Could not parse data. " + err));
    }
    return [];
  };

  getResults(query, data) {
    if (!query) return [];
    if(!data.length) {
      console.log('No data!')
      return [];
    }
    //console.log(data)
    
    // Filter for matching strings
    let results = data.filter(item => item.text.toLowerCase().includes(query.toLowerCase()));

    return results;
  }

  updateDropdown(results) {
    this.listEl.innerHTML = '';
    this.listEl.appendChild(this.createResultsEl(results));
  }

  //runs for every Enter or click on a list element
  onSelectElement = (event) => {
    const { onSelect } = this.options;

    document.getElementById('select-text').innerHTML = '';
    let selectImg = document.getElementById('select-img');
    selectImg.src = '';
    selectImg.alt = '';

    let eventNode;
    if(event.type === 'click') {
      eventNode = event.target;
    } else {
      //when using Enter for selection, find the active node 
      let activeNodes = this.listEl.getElementsByClassName('active');
      eventNode = activeNodes[0];
    }
    //update input value with text from selected node
    this.inputEl.value = eventNode.textContent;

    //clear dropdown
    this.updateDropdown([]);

    //run onSelect function, if applicable
    if (typeof onSelect === 'function') onSelect(eventNode);

    //set the display to show text and image, if available
    let textDisplay = document.getElementById('select-text');
    textDisplay.innerHTML = eventNode.textContent;
    if(eventNode.imgKey) {
      let avatar = document.getElementById('select-img');
      avatar.src = eventNode.imgKey; 
      avatar.alt = eventNode.textContent;
    }
  }

  onKeyboardEvent = (event) => {
    //get all of the nodes created by createResultsEl
    let nodeList = this.listEl.querySelectorAll('li');

    let length = nodeList.length;
    switch(event.key) {
      case 'ArrowDown':
        //increment the listIndex (initialized to -1)
        this.listIndex = this.listIndex === length - 1 ? 0 : this.listIndex + 1;
        
        if(this.listIndex > -1 && this.listIndex < length) {

          //add class 'active' to node at the current index in nodeList
          nodeList[this.listIndex].classList.add('active');

          //remove class 'active' from the previous node
          if(this.listIndex !== 0) {
            nodeList[this.listIndex - 1].classList.remove('active');
          } else {
            if(length > 1) nodeList[length - 1].classList.remove('active');
          }
        }
        //account for 0 index of one-element list
        if(this.listIndex === length) this.listIndex = 0;
        break;
        case 'ArrowUp':
          //decrement listIndex or send to the end of the list
          this.listIndex = this.listIndex === -1 ? length - 1 : this.listIndex - 1;
          if(this.listIndex < 0) this.listIndex = length -1;
          if(this.listIndex > -1 && this.listIndex < length) {
            //add class 'active' to node at the current index in nodeList
            nodeList[this.listIndex].classList.add('active');

            //remove class 'active' from the previous node
            if(this.listIndex !== length - 1) {
              nodeList[this.listIndex + 1].classList.remove('active');
            } else {
              nodeList[0].classList.remove('active');
            }
          }
          break;
      case "Enter":
        if(this.listIndex !== -1) {
          this.onSelectElement(event);
        }
        break;
    }
  }
//help from: https://dev.to/otamnitram/throttling-and-debouncing-avoiding-unnecessary-api-calls-2god
//this function enables limiting API calls so they are not called on every letter added
  debounce(callback) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(callback, 300);
  }
};

export default Autocomplete;