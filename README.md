# bloomsight.js

A client side javascript library to work with bloomsight.io

## Badges

[![ License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE.md)

## Installation

Install by running

```bash
  npm install @bloomscorp/bloomsight.js
```

## Usage/Examples


### Configuration

Use the `init` method to configure the library.

For ESModule projects
```ts
import { init } from '@bloomscorp/bloomsight.js';

init({
	propertyToken: '65d72f0b5e990c6028790156',
	isDevelopmentMode: true,
	...
});
```

For CommonJS projects
```ts
const { init } = require('@bloomscorp/bloomsight.js');

init({
	propertyToken: '65d72f0b5e990c6028790156',
	isDevelopmentMode: true,
	...
});
```
Below is the table with all the possible options that can be configured.

| Option | Type     | Description                | Mandatory | Default |
| :-------- | :------- | :------------------------- | :------| :-------|
| `propertyToken` | `string` | [bloomsight.io](https://bloomsight.io) property token | ✅ | NA |
| `isDevelopmentMode` | `boolean` | if `true`, then logs data in the browser console | ✅ | NA |
| `observePageViaWebAPI` | `boolean` | if `true`, will detect page view event based on web APIs. However, if `false`, `pageViewObserver` should be used to trigger page view event | ❌ | `true` |
| `stopSimpleEvent` | `boolean` | stops only simple event tracking| ❌ | `false` |
| `stopDataEvent` | `boolean` | stops only data event tracking| ❌ | `false` |
| `stopPageViewEvent` | `boolean` | stops only page view event tracking| ❌ | `false` |
| `stopAll` | `boolean` | stops all event tracking | ❌ | `false` |
| `logOnly` | `boolean` | tracks event but doesn't save to database. Should be used only when `isDevelopmentMode: true`| ❌ | `false` |


### Simple Event

Use the `resolveSimpleEvent` method to log simple events

```ts
import { resolveSimpleEvent } from '@bloomscorp/bloomsight.js';

resolveSimpleEvent('65d735b122354c8ba6a489c2');
```

### Data Event

Use the `resolveDataEvent` method to log data events

```ts
import { resolveDataEvent } from '@bloomscorp/bloomsight.js';

resolveDataEvent('66d735b122355c8ba6a456f8'), {
  productId: 120,
  sku: 'PROD021298
};
```
### Page View Event


By default, page view events are tracked automatically via web APIs. This approach is recommended mostly for vanilla projects where a `load` event is trigged once a new page is loaded.


However, frameworks like `Angular`, `React` etc doesn't work that way. So, it is recommended to pass `observePageViaWebAPI` as `false` and use `pageViewObserver` to trigger page view events.

>P.S: It is recommened to use appropriate library as per your framework from [here]()

Here is an example in Angular,

```ts
import {pageViewObserver} from '@bloomscorp/bloomsight.js';

export class AppComponent implements OnInit{

  constructor(
    private router: Router
  ) {
  }

  ngOnInit() {
    this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          pageViewObserver();
        }
    })
  }
}
```

## License

[MIT](./LICENSE.md)


## Support

Report issues or feature requests [here]()

