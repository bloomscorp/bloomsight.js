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
https://cdn.jsdelivr.net/gh/bloomscorp/bloomsight.js@<VERSION>/umd/dom.js 
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

| Option              | Type      | Description                                                                                   | Mandatory | Default |
|:--------------------|:----------|:----------------------------------------------------------------------------------------------|:----------|:--------|
| `propertyToken`     | `string`  | [bloomsight.io](https://bloomsight.io) property token                                         | ✅         | NA      |
| `isDevelopmentMode` | `boolean` | if `true`, then logs data in the browser console                                              | ✅         | NA      |
| `stopSimpleEvent`   | `boolean` | stops only simple event tracking                                                              | ❌         | `false` |
| `stopDataEvent`     | `boolean` | stops only data event tracking                                                                | ❌         | `false` |
| `stopPageViewEvent` | `boolean` | stops only page view event tracking                                                           | ❌         | `false` |
| `stopAll`           | `boolean` | stops all event tracking                                                                      | ❌         | `false` |
| `logOnly`           | `boolean` | tracks event but doesn't save to database. Should be used only when `isDevelopmentMode: true` | ❌         | `false` |

### Simple Event

Use the `resolveSimpleEvent` method to log simple events

```ts
import {resolveSimpleEvent} from '@bloomscorp/bloomsight.js';

resolveSimpleEvent(
	'65d735b122354c8ba6a489c2',
	'Contact Us CTA button'
);
```

| Option       | Type     | Description                                     | Mandatory | Default |
|:-------------|:---------|:------------------------------------------------|:----------|:--------|
| `eventToken` | `string` | Id of simple event                              | ✅         | NA      |
| `label`      | `string` | a label/name for the event for future reference | ❌         | ''      |

### Data Event

Use the `resolveDataEvent` method to log data events

```ts
import {resolveDataEvent} from '@bloomscorp/bloomsight.js';

resolveDataEvent(
	'66d735b122355c8ba6a456f8',
	{
		productId: 120,
		sku: 'PROD021298'
	},
	'Add to Wishlist CTA button'
);
```

| Option       | Type     | Description                                     | Mandatory | Default |
|:-------------|:---------|:------------------------------------------------|:----------|:--------|
| `eventToken` | `string` | Id of data event                                | ✅         | NA      |
| `eventData`  | `Object` | additional metadata in key, value format        | ✅         | NA      |
| `label`      | `string` | a label/name for the event for future reference | ❌         | ''      |

### Page View Event

Use `pageViewObserver` to trigger page view events once your page is loaded. Ideally, the function should be triggered based on `DOMContentLoaded` or `load` event with a slight delay.

> P.S: It is recommended to use appropriate library as per your framework from [here]() which will
> handle page view events automatically.

```html
<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Document</title>
	<script src="https://cdn.jsdelivr.net/gh/bloomscorp/bloomsight.js@<VERSION>/umd/production.js"></script>
	<script src="https://cdn.jsdelivr.net/gh/bloomscorp/bloomsight.js@<VERSION>/umd/dom.js"></script> // mandatory for DOM resolution
</head>
<body>


	
	<script>
		init({
			propertyToken: '65d72f0b5e990c6028790156',
			isDevelopmentMode: true,
			...
		});
	</script>
	<script>
		pageViewObserver();
	</script>
	<script src="./app.js"></script>
</body>

</html>
```

### Send Email

Use `sendEmail` method to send email

```ts
import {sendEmail} from '@bloomscorp/bloomsight.js';

let formData = new FormData();
formData.append('name', 'John');
formData.append('email', 'john.doe@gmail.com');

sendEmail(
	'GMAIL',
	'66d735b122355c8ba6a456f8',
	'63d735h822355s6ba6a4556k',
	'61d895h922355b6ba6a4587a',
	formData,
	() => alert('email sent successfully!'),
	() => alert('unable to send email! Try again later.')
)
```

| Option            | Type         | Description                                                                                | Mandatory | Default |
|:------------------|:-------------|:-------------------------------------------------------------------------------------------|:----------|:--------|
| `engineType`      | `string`     | Type of the email engine - GMAIL or CUSTOM_SMTP                                            | ✅         | NA      |
| `engineId`        | `string`     | Id of the engine that will be used to send email                                           | ✅         | NA      |
| `templateId`      | `string`     | Id of the email template that will be used as email body                                   | ✅         | NA      |
| `templateOwnerId` | `string`     | Id of the user who has created the template                                                | ✅         | NA      |
| `emailMetaData`   | `FormData`   | attachment & variables used in the template & their respective values in key, value format | ❌         | NA      |
| `onSuccess`       | `() => void` | callback for operation success event                                                       | ❌         | NA      |
| `onError`         | `() => void` | callback for operation error event                                                         | ❌         | NA      |

## Other Integration Options
If the framework impose limited control over the codebase but one have access to JS snippets, use the DOM based 
event resolution approach as below to use our library.

1. Identify the DOM element where you want to integrate the event handler.
2. Find a unique HTML element selector that can be used to select the DOM element. Note, the selector should follow standards as mentioned [here](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector).
3. Use the `resolveDOM` function to pass on the selector and the event handler.

```html
<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Document</title>
	<script src="https://cdn.jsdelivr.net/gh/bloomscorp/bloomsight.js@<VERSION>/umd/production.js"></script>
	<script src="https://cdn.jsdelivr.net/gh/bloomscorp/bloomsight.js@<VERSION>/umd/dom.js"></script>
</head>
<body>


	
	<script>
		init({
			propertyToken: '65d72f0b5e990c6028790156',
			isDevelopmentMode: true,
			...
		});
	</script>
	<script>
		resolveDOM("button[type=submit]", () => resolveSimpleEvent('61d895h922355b6ba6a4587a'));
	</script>
	<script src="./app.js"></script>
</body>

</html>
```

> Note: Make sure the element selector is unique within the page. If there are multiple elements present
> in the page with same selector, then only the first element will be considered for event resolution.
> 

## License

[MIT](./LICENSE.md)

## Support

Report issues or feature requests [here]()

