function resolveDOM(targetSelector, eventHandler) {
	const doesCoreModulePresent = window.hasOwnProperty('resolveSimpleEvent');
	if (!doesCoreModulePresent)
		console.error("bloomsight.dom.js: core CDN library must be integrated first");

	const targetElement = document.querySelector(targetSelector);
	if (!targetElement)
		console.error(`bloomsight.dom.js: element with selector ${targetSelector} not found in the DOM!`);

	targetElement.addEventListener('click', eventHandler);
}
