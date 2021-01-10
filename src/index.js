import { from, fromEvent, combineLatest } from "rxjs";
import {
  map,
  pipe,
  debounceTime,
  startWith,
  tap,
  reduce
} from "rxjs/operators";

document.getElementById("app").innerHTML = `
<p>Search: <input id="main-search" type=text /></p>

<ul>
  <li>
    <input id="char-filter" type=checkbox> min 5 chars</input>
  </li>
</ul>

<br>

<ul id="names">
</ul>
`;

// mock async datastream
const names = ["jef", "Wim", "Thomas", "Inessa", "Sam"];
const names$ = from([names]);

// event to stream of search
const searchText$ = fromEvent(
  document.getElementById("main-search"),
  "keyup"
).pipe(
  map(e => e.target.value),
  debounceTime(300),
  startWith("")
);

// event to stream of checkbox
const charFilter$ = fromEvent(
  document.getElementById("char-filter"),
  "click"
).pipe(
  map(e => e.target.checked),
  startWith(false)
);

const filterSearchText = data => {
  if (data.filter.searchText) {
    return {
      ...data,
      ...{
        names: data.names.filter(
          name =>
            name.toLowerCase().indexOf(data.filter.searchText.toLowerCase()) >=
            0
        )
      }
    };
  }
  return data;
};

const filterCharLength = data => {
  if (data.filter.charFilter) {
    return {
      ...data,
      ...{
        names: data.names.filter(name => name.length >= 5)
      }
    };
  }
  return data;
};

// Log output
// charFilter$.subscribe(value => console.log(value));
// searchText$.subscribe(console.log); // or by passing just a function

// filter and link everything
const result$ = combineLatest(names$, searchText$, charFilter$).pipe(
  map(([names, searchText, charFilter]) => ({
    names,
    filter: { searchText, charFilter }
  })),
  tap(console.log),
  map(filterSearchText),
  map(filterCharLength),
  map(data => data.names)
);

// render results
const subscription = result$.subscribe(names => {
  const namesList = document.getElementById("names");
  namesList.innerHTML = names.map(name => `<li> ${name} </li>`);
});

// on leaving the component unsubscribe the stream
// uncomment and see reactiveness is gone
//subscription.unsubscribe();
