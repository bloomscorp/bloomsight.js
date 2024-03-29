# bloomsight.js

A client side javascript library to work with bloomsight.io

## Badges

[![ License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE.md)

## Installation

Install using `npm` by running

```bash
npm install @bloomscorp/bloomsight.js
```
OR

Use our CDN url without installation. Make sure to change `<VERSION>` with appropriate release 
version of the library
```
https://cdn.jsdelivr.net/gh/bloomscorp/bloomsight.js@<VERSION>/umd/production.js
```

## Usage/Examples


### Configuration

Use the `init` method to configure the library.

For ESModule projects
```ts
import {init} from '@bloomscorp/bloomsight.js';

init({
   propertyToken: '65d72f0b5e990c6028790156', 
   isDevelopmentMode: true,
   ...
});
```

For CommonJS projects
```ts
const {init} = require('@bloomscorp/bloomsight.js');

init({
   propertyToken: '65d72f0b5e990c6028790156', 
   isDevelopmentMode: true,
   ...
});
```

For CDN 
```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>


    <script src="https://cdn.jsdelivr.net/gh/bloomscorp/bloomsight.js@<VERSION>/umd/production.js"></script>
    <script>
        init({
            propertyToken: '65d72f0b5e990c6028790156', 
            isDevelopmentMode: true,
            ...
        });
    </script>
    <script src="./app.js"></script>
</body>

</html>
```

Below is the table with all the possible options that can be configured.

| Option                 | Type      | Description                                                                                                                                 | Mandatory | Default |
|:-----------------------|:----------|:--------------------------------------------------------------------------------------------------------------------------------------------|:----------|:--------|
| `propertyToken`        | `string`  | [bloomsight.io](https://bloomsight.io) property token                                                                                       | ✅         | NA      |
| `isDevelopmentMode`    | `boolean` | if `true`, then logs data in the browser console                                                                                            | ✅         | NA      |
| `observePageViaWebAPI` | `boolean` | if `true`, will detect page view event based on web APIs. However, if `false`, `pageViewObserver` should be used to trigger page view event | ❌         | `true`  |
| `stopSimpleEvent`      | `boolean` | stops only simple event tracking                                                                                                            | ❌         | `false` |
| `stopDataEvent`        | `boolean` | stops only data event tracking                                                                                                              | ❌         | `false` |
| `stopPageViewEvent`    | `boolean` | stops only page view event tracking                                                                                                         | ❌         | `false` |
| `stopAll`              | `boolean` | stops all event tracking                                                                                                                    | ❌         | `false` |
| `logOnly`              | `boolean` | tracks event but doesn't save to database. Should be used only when `isDevelopmentMode: true`                                               | ❌         | `false` |


### Simple Event

Use the `resolveSimpleEvent` method to log simple events

```ts
import {resolveSimpleEvent} from '@bloomscorp/bloomsight.js';

resolveSimpleEvent('65d735b122354c8ba6a489c2');
```
| Option       | Type     | Description        | Mandatory | Default |
|:-------------|:---------|:-------------------|:----------|:--------|
| `eventToken` | `string` | Id of simple event | ✅         | NA      |


### Data Event

Use the `resolveDataEvent` method to log data events

```ts
import {resolveDataEvent} from '@bloomscorp/bloomsight.js';

resolveDataEvent('66d735b122355c8ba6a456f8'), {
  productId: 120,
  sku: 'PROD021298'
});
```
| Option       | Type     | Description                              | Mandatory | Default |
|:-------------|:---------|:-----------------------------------------|:----------|:--------|
| `eventToken` | `string` | Id of data event                         | ✅         | NA      |
| `eventData`  | `Object` | additional metadata in key, value format | ✅         | NA      |

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

### Send Email

Use `sendEmail` method to send email

```ts
import {sendEmail} from '@bloomscorp/bloomsight.js';

sendEmail(
  '66d735b122355c8ba6a456f8', 
  '63d735h822355s6ba6a4556k',
  '61d895h922355b6ba6a4587a',
  ...
)
```

| Option            | Type       | Description                                                                                | Mandatory | Default |
|:------------------|:-----------|:-------------------------------------------------------------------------------------------|:----------|:--------|
| `engineId`        | `string`   | Id of the engine that will be used to send email                                           | ✅         | NA      |
| `templateId`      | `string`   | Id of the email template that will be used as email body                                   | ✅         | NA      |
| `templateOwnerId` | `string`   | Id of the user who has created the template                                                | ✅         | NA      |
| `emailMetaData`   | `FormData` | attachment & variables used in the template & their respective values in key, value format | ❌         | NA      |

## License

[MIT](./LICENSE.md)


## Support

Report issues or feature requests [here]()

