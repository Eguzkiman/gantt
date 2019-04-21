"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var YEAR = 'year';
var MONTH = 'month';
var DAY = 'day';
var HOUR = 'hour';
var MINUTE = 'minute';
var SECOND = 'second';
var MILLISECOND = 'millisecond';
var month_names = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
  ptBr: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
};
var _default = {
  parse: function parse(date) {
    var date_separator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '-';
    var time_separator = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : /[.:]/;

    if (date instanceof Date) {
      return date;
    }

    if (typeof date === 'string') {
      var date_parts, time_parts;
      var parts = date.split(' ');
      date_parts = parts[0].split(date_separator).map(function (val) {
        return parseInt(val, 10);
      });
      time_parts = parts[1] && parts[1].split(time_separator); // month is 0 indexed

      date_parts[1] = date_parts[1] - 1;
      var vals = date_parts;

      if (time_parts && time_parts.length) {
        if (time_parts.length == 4) {
          time_parts[3] = '0.' + time_parts[3];
          time_parts[3] = parseFloat(time_parts[3]) * 1000;
        }

        vals = vals.concat(time_parts);
      }

      return _construct(Date, _toConsumableArray(vals));
    }
  },
  to_string: function to_string(date) {
    var with_time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (!(date instanceof Date)) {
      throw new TypeError('Invalid argument type');
    }

    var vals = this.get_date_values(date).map(function (val, i) {
      if (i === 1) {
        // add 1 for month
        val = val + 1;
      }

      if (i === 6) {
        return padStart(val + '', 3, '0');
      }

      return padStart(val + '', 2, '0');
    });
    var date_string = "".concat(vals[0], "-").concat(vals[1], "-").concat(vals[2]);
    var time_string = "".concat(vals[3], ":").concat(vals[4], ":").concat(vals[5], ".").concat(vals[6]);
    return date_string + (with_time ? ' ' + time_string : '');
  },
  format: function format(date) {
    var format_string = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'YYYY-MM-DD HH:mm:ss.SSS';
    var lang = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'en';
    var values = this.get_date_values(date).map(function (d) {
      return padStart(d, 2, 0);
    });
    var format_map = {
      YYYY: values[0],
      MM: padStart(+values[1] + 1, 2, 0),
      DD: values[2],
      HH: values[3],
      mm: values[4],
      ss: values[5],
      SSS: values[6],
      D: values[2],
      MMMM: month_names[lang][+values[1]],
      MMM: month_names[lang][+values[1]]
    };
    var str = format_string;
    var formatted_values = [];
    Object.keys(format_map).sort(function (a, b) {
      return b.length - a.length;
    }) // big string first
    .forEach(function (key) {
      if (str.includes(key)) {
        str = str.replace(key, "$".concat(formatted_values.length));
        formatted_values.push(format_map[key]);
      }
    });
    formatted_values.forEach(function (value, i) {
      str = str.replace("$".concat(i), value);
    });
    return str;
  },
  diff: function diff(date_a, date_b) {
    var scale = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DAY;
    var milliseconds, seconds, hours, minutes, days, months, years;
    milliseconds = date_a - date_b;
    seconds = milliseconds / 1000;
    minutes = seconds / 60;
    hours = minutes / 60;
    days = hours / 24;
    months = days / 30;
    years = months / 12;

    if (!scale.endsWith('s')) {
      scale += 's';
    }

    return Math.floor({
      milliseconds: milliseconds,
      seconds: seconds,
      minutes: minutes,
      hours: hours,
      days: days,
      months: months,
      years: years
    }[scale]);
  },
  today: function today() {
    var vals = this.get_date_values(new Date()).slice(0, 3);
    return _construct(Date, _toConsumableArray(vals));
  },
  now: function now() {
    return new Date();
  },
  add: function add(date, qty, scale) {
    qty = parseInt(qty, 10);
    var vals = [date.getFullYear() + (scale === YEAR ? qty : 0), date.getMonth() + (scale === MONTH ? qty : 0), date.getDate() + (scale === DAY ? qty : 0), date.getHours() + (scale === HOUR ? qty : 0), date.getMinutes() + (scale === MINUTE ? qty : 0), date.getSeconds() + (scale === SECOND ? qty : 0), date.getMilliseconds() + (scale === MILLISECOND ? qty : 0)];
    return _construct(Date, vals);
  },
  start_of: function start_of(date, scale) {
    var _scores;

    var scores = (_scores = {}, _defineProperty(_scores, YEAR, 6), _defineProperty(_scores, MONTH, 5), _defineProperty(_scores, DAY, 4), _defineProperty(_scores, HOUR, 3), _defineProperty(_scores, MINUTE, 2), _defineProperty(_scores, SECOND, 1), _defineProperty(_scores, MILLISECOND, 0), _scores);

    function should_reset(_scale) {
      var max_score = scores[scale];
      return scores[_scale] <= max_score;
    }

    var vals = [date.getFullYear(), should_reset(YEAR) ? 0 : date.getMonth(), should_reset(MONTH) ? 1 : date.getDate(), should_reset(DAY) ? 0 : date.getHours(), should_reset(HOUR) ? 0 : date.getMinutes(), should_reset(MINUTE) ? 0 : date.getSeconds(), should_reset(SECOND) ? 0 : date.getMilliseconds()];
    return _construct(Date, vals);
  },
  clone: function clone(date) {
    return _construct(Date, _toConsumableArray(this.get_date_values(date)));
  },
  get_date_values: function get_date_values(date) {
    return [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()];
  },
  get_days_in_month: function get_days_in_month(date) {
    var no_of_days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var month = date.getMonth();

    if (month !== 1) {
      return no_of_days[month];
    } // Feb


    var year = date.getFullYear();

    if (year % 4 == 0 && year % 100 != 0 || year % 400 == 0) {
      return 29;
    }

    return 28;
  }
}; // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart

exports["default"] = _default;

function padStart(str, targetLength, padString) {
  str = str + '';
  targetLength = targetLength >> 0;
  padString = String(typeof padString !== 'undefined' ? padString : ' ');

  if (str.length > targetLength) {
    return String(str);
  } else {
    targetLength = targetLength - str.length;

    if (targetLength > padString.length) {
      padString += padString.repeat(targetLength / padString.length);
    }

    return padString.slice(0, targetLength) + String(str);
  }
}