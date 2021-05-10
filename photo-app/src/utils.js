/* Return document height */
function getDocumentHeight() {
	const body = document.body;
	const html = document.documentElement;

	return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
}

/* Return scrollTop height: The pixels value which is above the visible scrollable area */
function getScrollTop() {
	return window.pageYOffset !== undefined
		? window.pageYOffset
		: (document.documentElement || document.body.parentNode || document.body).scrollTop;
}

/* Check if scroll reached bottom */
export function scrollAreaAvailable() {
	return getScrollTop() < getDocumentHeight() - window.innerHeight;
}

/* To parse response to JSON object */
export function parseJSON(response) {
	return response.json();
}

/* Throttle function for constant execution of a function after every x secs */
export function throttle(fn, threshhold, scope) {
	threshhold || (threshhold = 250);
	var last, deferTimer;
	return function() {
		var context = scope || this;
		var now = new Date(),
			args = arguments;
		if (last && now < last + threshhold) {
			// hold on to it
			clearTimeout(deferTimer);
			deferTimer = setTimeout(function() {
				last = now;
				fn.apply(context, args);
			}, threshhold);
		} else {
			last = now;
			fn.apply(context, args);
		}
	};
}