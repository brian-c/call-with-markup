var toArray = Array.prototype.slice.call.bind(Array.prototype.slice);

function isAPromise (object) {
  return object !== undefined &&
    object !== null &&
    object.then !== undefined &&
    object.catch !== undefined;
}

function removeElement (element) {
  element.parentNode.removeChild(element);
}

function callWithMarkup (markup, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = undefined;
  }

  var config = Object.assign({
    document: typeof document !== 'undefined' ? document : null,
    parent: null
  }, options);
  if (config.parent === null) {
    config.parent = config.document.body;
  }
  config.document = config.parent.ownerDocument;

  var sourceDiv = config.document.createElement('div');
  sourceDiv.innerHTML = markup;
  var temporaryElements = toArray(sourceDiv.children);
  sourceDiv = null;

  temporaryElements.forEach(config.parent.appendChild, config.parent);

  function cleanUp () {
    temporaryElements.forEach(removeElement);
  }

  var result;
  var error;
  try {
    result = callback.apply(null, temporaryElements);
  } catch (caughtError) {
    error = caughtError;
  }

  if (isAPromise(result)) {
    result.then(cleanUp, cleanUp);
  } else {
    cleanUp();
  }

  if (error !== undefined) {
    throw error;
  }

  return result;
}

module.exports = callWithMarkup;
