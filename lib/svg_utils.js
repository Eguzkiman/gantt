"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.$ = $;
exports.createSVG = createSVG;
exports.animateSVG = animateSVG;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function $(expr, con) {
  return typeof expr === 'string' ? (con || document).querySelector(expr) : expr || null;
}

function createSVG(tag, attrs) {
  var elem = document.createElementNS('http://www.w3.org/2000/svg', tag);

  for (var attr in attrs) {
    if (attr === 'append_to') {
      var parent = attrs.append_to;
      parent.appendChild(elem);
    } else if (attr === 'innerHTML') {
      elem.innerHTML = attrs.innerHTML;
    } else {
      elem.setAttribute(attr, attrs[attr]);
    }
  }

  return elem;
}

function animateSVG(svgElement, attr, from, to) {
  var animatedSvgElement = getAnimationElement(svgElement, attr, from, to);

  if (animatedSvgElement === svgElement) {
    // triggered 2nd time programmatically
    // trigger artificial click event
    var event = document.createEvent('HTMLEvents');
    event.initEvent('click', true, true);
    event.eventName = 'click';
    animatedSvgElement.dispatchEvent(event);
  }
}

function getAnimationElement(svgElement, attr, from, to) {
  var dur = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '0.4s';
  var begin = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : '0.1s';
  var animEl = svgElement.querySelector('animate');

  if (animEl) {
    $.attr(animEl, {
      attributeName: attr,
      from: from,
      to: to,
      dur: dur,
      begin: 'click + ' + begin // artificial click

    });
    return svgElement;
  }

  var animateElement = createSVG('animate', {
    attributeName: attr,
    from: from,
    to: to,
    dur: dur,
    begin: begin,
    calcMode: 'spline',
    values: from + ';' + to,
    keyTimes: '0; 1',
    keySplines: cubic_bezier('ease-out')
  });
  svgElement.appendChild(animateElement);
  return svgElement;
}

function cubic_bezier(name) {
  return {
    ease: '.25 .1 .25 1',
    linear: '0 0 1 1',
    'ease-in': '.42 0 1 1',
    'ease-out': '0 0 .58 1',
    'ease-in-out': '.42 0 .58 1'
  }[name];
}

$.on = function (element, event, selector, callback) {
  if (!callback) {
    callback = selector;
    $.bind(element, event, callback);
  } else {
    $.delegate(element, event, selector, callback);
  }
};

$.off = function (element, event, handler) {
  element.removeEventListener(event, handler);
};

$.bind = function (element, event, callback) {
  event.split(/\s+/).forEach(function (event) {
    element.addEventListener(event, callback);
  });
};

$.delegate = function (element, event, selector, callback) {
  element.addEventListener(event, function (e) {
    var delegatedTarget = e.target.closest(selector);

    if (delegatedTarget) {
      e.delegatedTarget = delegatedTarget;
      callback.call(this, e, delegatedTarget);
    }
  });
};

$.closest = function (selector, element) {
  if (!element) return null;

  if (element.matches(selector)) {
    return element;
  }

  return $.closest(selector, element.parentNode);
};

$.attr = function (element, attr, value) {
  if (!value && typeof attr === 'string') {
    return element.getAttribute(attr);
  }

  if (_typeof(attr) === 'object') {
    for (var key in attr) {
      $.attr(element, key, attr[key]);
    }

    return;
  }

  element.setAttribute(attr, value);
};