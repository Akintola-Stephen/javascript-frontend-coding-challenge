import Autocomplete from './Autocomplete';
import usStates from './us-states';
import './main.css';


// US States
const data = usStates.map(state => ({
  text: state.name,
  value: state.abbreviation
}));
new Autocomplete(document.getElementById('state'), {
  data,
  onSelect: (stateCode) => {
    console.log('selected state:', stateCode);
  },
});

//GitHub Users
new Autocomplete(document.getElementById('gh-user'), {
  url: 'https://api.github.com/search/users',
  querySymbol: 'q=',
  queryEndParams: '+in:login', //specific to GitHub's API - search just login property
  perPageKey: '&per_page=',
  onInputChange: (initialData) => {
    let userLogins = initialData.items.map(user => { 
      return ({
        text: user.login, 
        img: user.avatar_url + '.png' 
        })
      });
    return userLogins;
  },
  onSelect: (ghUserId) => {
    console.log('selected github user id:', ghUserId.textContent);
    
  },
});

//Breweries
new Autocomplete(document.getElementById('brewery'), {
  url: 'https://api.openbrewerydb.org/breweries/autocomplete',
  querySymbol: 'query=',
  perPageKey: '&per_page=',
  onInputChange: (initialData) => {
    return initialData.map(brew => ({ text: brew.name}));   
  },
  onSelect: (brewery) => {
    console.log('selected brewery name: ', brewery.textContent);
  },
});

//NASA images
//there is not a clear way to specify the number of results per page
new Autocomplete(document.getElementById('nasa'), {
  url: 'https://images-api.nasa.gov/search',
  querySymbol: 'title=',
  queryEndParams: '&media_type=image',
  onInputChange: (initialData) => {
    let nasaImgs = initialData.collection.items.map(image => {
      return ({ 
        text: image.data[0].title,
        img: image.links[0].href
      })
    });
    return nasaImgs;
  },
  onSelect: (nasaImg) => {
    console.log('selected image title: ', nasaImg.textContent);
  },
});
