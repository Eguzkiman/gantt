"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _date_utils = _interopRequireDefault(require("./date_utils"));

var _svg_utils = require("./svg_utils");

var _bar = _interopRequireDefault(require("./bar"));

var _arrow = _interopRequireDefault(require("./arrow"));

var _popup = _interopRequireDefault(require("./popup"));

require("./gantt.scss");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Gantt =
/*#__PURE__*/
function () {
  function Gantt(wrapper, tasks, options) {
    _classCallCheck(this, Gantt);

    this.setup_wrapper(wrapper);
    this.setup_options(options);
    this.setup_tasks(tasks); // initialize with default view mode

    this.change_view_mode();
    this.bind_events();
  }

  _createClass(Gantt, [{
    key: "setup_wrapper",
    value: function setup_wrapper(element) {
      var svg_element, wrapper_element; // CSS Selector is passed

      if (typeof element === 'string') {
        element = document.querySelector(element);
      } // get the SVGElement


      if (element instanceof HTMLElement) {
        wrapper_element = element;
        svg_element = element.querySelector('svg');
      } else if (element instanceof SVGElement) {
        svg_element = element;
      } else {
        throw new TypeError('Frappé Gantt only supports usage of a string CSS selector,' + " HTML DOM element or SVG DOM element for the 'element' parameter");
      } // svg element


      if (!svg_element) {
        // create it
        this.$svg = (0, _svg_utils.createSVG)('svg', {
          append_to: wrapper_element,
          "class": 'gantt'
        });
      } else {
        this.$svg = svg_element;
        this.$svg.classList.add('gantt');
      } // wrapper element


      this.$container = document.createElement('div');
      this.$container.classList.add('gantt-container');
      var parent_element = this.$svg.parentElement;
      parent_element.appendChild(this.$container);
      this.$container.appendChild(this.$svg); // popup wrapper

      this.popup_wrapper = document.createElement('div');
      this.popup_wrapper.classList.add('popup-wrapper');
      this.$container.appendChild(this.popup_wrapper);
    }
  }, {
    key: "setup_options",
    value: function setup_options(options) {
      var default_options = {
        header_height: 50,
        column_width: 30,
        step: 24,
        view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month', 'Year'],
        bar_height: 20,
        bar_corner_radius: 3,
        arrow_curve: 5,
        padding: 18,
        view_mode: 'Day',
        date_format: 'YYYY-MM-DD',
        popup_trigger: 'click',
        custom_popup_html: null,
        language: 'en'
      };
      this.options = Object.assign({}, default_options, options);
    }
  }, {
    key: "setup_tasks",
    value: function setup_tasks(tasks) {
      // prepare tasks
      this.tasks = tasks.map(function (task, i) {
        // convert to Date objects
        task._start = _date_utils["default"].parse(task.start);
        task._end = _date_utils["default"].parse(task.end); // make task invalid if duration too large

        if (_date_utils["default"].diff(task._end, task._start, 'year') > 10) {
          task.end = null;
        } // cache index


        task._index = i; // invalid dates

        if (!task.start && !task.end) {
          var today = _date_utils["default"].today();

          task._start = today;
          task._end = _date_utils["default"].add(today, 2, 'day');
        }

        if (!task.start && task.end) {
          task._start = _date_utils["default"].add(task._end, -2, 'day');
        }

        if (task.start && !task.end) {
          task._end = _date_utils["default"].add(task._start, 2, 'day');
        } // if hours is not set, assume the last day is full day
        // e.g: 2018-09-09 becomes 2018-09-09 23:59:59


        var task_end_values = _date_utils["default"].get_date_values(task._end);

        if (task_end_values.slice(3).every(function (d) {
          return d === 0;
        })) {
          task._end = _date_utils["default"].add(task._end, 24, 'hour');
        } // invalid flag


        if (!task.start || !task.end) {
          task.invalid = true;
        } // dependencies


        if (typeof task.dependencies === 'string' || !task.dependencies) {
          var deps = [];

          if (task.dependencies) {
            deps = task.dependencies.split(',').map(function (d) {
              return d.trim();
            }).filter(function (d) {
              return d;
            });
          }

          task.dependencies = deps;
        } // uids


        if (!task.id) {
          task.id = generate_id(task);
        }

        return task;
      });
      this.setup_dependencies();
    }
  }, {
    key: "setup_dependencies",
    value: function setup_dependencies() {
      this.dependency_map = {};
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.tasks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var t = _step.value;
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = t.dependencies[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var d = _step2.value;
              this.dependency_map[d] = this.dependency_map[d] || [];
              this.dependency_map[d].push(t.id);
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                _iterator2["return"]();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: "refresh",
    value: function refresh(tasks) {
      this.setup_tasks(tasks);
      this.change_view_mode();
    }
  }, {
    key: "change_view_mode",
    value: function change_view_mode() {
      var mode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.options.view_mode;
      this.update_view_scale(mode);
      this.setup_dates();
      this.render(); // fire viewmode_change event

      this.trigger_event('view_change', [mode]);
    }
  }, {
    key: "update_view_scale",
    value: function update_view_scale(view_mode) {
      this.options.view_mode = view_mode;

      if (view_mode === 'Day') {
        this.options.step = 24;
        this.options.column_width = 38;
      } else if (view_mode === 'Half Day') {
        this.options.step = 24 / 2;
        this.options.column_width = 38;
      } else if (view_mode === 'Quarter Day') {
        this.options.step = 24 / 4;
        this.options.column_width = 38;
      } else if (view_mode === 'Week') {
        this.options.step = 24 * 7;
        this.options.column_width = 140;
      } else if (view_mode === 'Month') {
        this.options.step = 24 * 30;
        this.options.column_width = 120;
      } else if (view_mode === 'Year') {
        this.options.step = 24 * 365;
        this.options.column_width = 120;
      }
    }
  }, {
    key: "setup_dates",
    value: function setup_dates() {
      this.setup_gantt_dates();
      this.setup_date_values();
    }
  }, {
    key: "setup_gantt_dates",
    value: function setup_gantt_dates() {
      this.gantt_start = this.gantt_end = null;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.tasks[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var task = _step3.value;

          // set global start and end date
          if (!this.gantt_start || task._start < this.gantt_start) {
            this.gantt_start = task._start;
          }

          if (!this.gantt_end || task._end > this.gantt_end) {
            this.gantt_end = task._end;
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
            _iterator3["return"]();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      this.gantt_start = _date_utils["default"].start_of(this.gantt_start, 'day');
      this.gantt_end = _date_utils["default"].start_of(this.gantt_end, 'day'); // add date padding on both sides

      if (this.view_is(['Quarter Day', 'Half Day'])) {
        this.gantt_start = _date_utils["default"].add(this.gantt_start, -7, 'day');
        this.gantt_end = _date_utils["default"].add(this.gantt_end, 7, 'day');
      } else if (this.view_is('Month')) {
        this.gantt_start = _date_utils["default"].start_of(this.gantt_start, 'year');
        this.gantt_end = _date_utils["default"].add(this.gantt_end, 1, 'year');
      } else if (this.view_is('Year')) {
        this.gantt_start = _date_utils["default"].add(this.gantt_start, -2, 'year');
        this.gantt_end = _date_utils["default"].add(this.gantt_end, 2, 'year');
      } else {
        this.gantt_start = _date_utils["default"].add(this.gantt_start, -1, 'month');
        this.gantt_end = _date_utils["default"].add(this.gantt_end, 1, 'month');
      }
    }
  }, {
    key: "setup_date_values",
    value: function setup_date_values() {
      this.dates = [];
      var cur_date = null;

      while (cur_date === null || cur_date < this.gantt_end) {
        if (!cur_date) {
          cur_date = _date_utils["default"].clone(this.gantt_start);
        } else {
          if (this.view_is('Year')) {
            cur_date = _date_utils["default"].add(cur_date, 1, 'year');
          } else if (this.view_is('Month')) {
            cur_date = _date_utils["default"].add(cur_date, 1, 'month');
          } else {
            cur_date = _date_utils["default"].add(cur_date, this.options.step, 'hour');
          }
        }

        this.dates.push(cur_date);
      }
    }
  }, {
    key: "bind_events",
    value: function bind_events() {
      this.bind_grid_click();
      this.bind_bar_events();
    }
  }, {
    key: "render",
    value: function render() {
      this.clear();
      this.setup_layers();
      this.make_grid();
      this.make_dates();
      this.make_bars();
      this.make_arrows();
      this.map_arrows_on_bars();
      this.set_width();
      this.set_scroll_position();
    }
  }, {
    key: "setup_layers",
    value: function setup_layers() {
      this.layers = {};
      var layers = ['grid', 'date', 'arrow', 'progress', 'bar', 'details']; // make group layers

      for (var _i = 0, _layers = layers; _i < _layers.length; _i++) {
        var layer = _layers[_i];
        this.layers[layer] = (0, _svg_utils.createSVG)('g', {
          "class": layer,
          append_to: this.$svg
        });
      }
    }
  }, {
    key: "make_grid",
    value: function make_grid() {
      this.make_grid_background();
      this.make_grid_rows();
      this.make_grid_header();
      this.make_grid_ticks();
      this.make_grid_highlights();
    }
  }, {
    key: "make_grid_background",
    value: function make_grid_background() {
      var grid_width = this.dates.length * this.options.column_width;
      var grid_height = this.options.header_height + this.options.padding + (this.options.bar_height + this.options.padding) * this.tasks.length;
      (0, _svg_utils.createSVG)('rect', {
        x: 0,
        y: 0,
        width: grid_width,
        height: grid_height,
        "class": 'grid-background',
        append_to: this.layers.grid
      });

      _svg_utils.$.attr(this.$svg, {
        height: grid_height + this.options.padding + 100,
        width: '100%'
      });
    }
  }, {
    key: "make_grid_rows",
    value: function make_grid_rows() {
      var rows_layer = (0, _svg_utils.createSVG)('g', {
        append_to: this.layers.grid
      });
      var lines_layer = (0, _svg_utils.createSVG)('g', {
        append_to: this.layers.grid
      });
      var row_width = this.dates.length * this.options.column_width;
      var row_height = this.options.bar_height + this.options.padding;
      var row_y = this.options.header_height + this.options.padding / 2;
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = this.tasks[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var task = _step4.value;
          (0, _svg_utils.createSVG)('rect', {
            x: 0,
            y: row_y,
            width: row_width,
            height: row_height,
            "class": 'grid-row',
            append_to: rows_layer
          });
          (0, _svg_utils.createSVG)('line', {
            x1: 0,
            y1: row_y + row_height,
            x2: row_width,
            y2: row_y + row_height,
            "class": 'row-line',
            append_to: lines_layer
          });
          row_y += this.options.bar_height + this.options.padding;
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
            _iterator4["return"]();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }
    }
  }, {
    key: "make_grid_header",
    value: function make_grid_header() {
      var header_width = this.dates.length * this.options.column_width;
      var header_height = this.options.header_height + 10;
      (0, _svg_utils.createSVG)('rect', {
        x: 0,
        y: 0,
        width: header_width,
        height: header_height,
        "class": 'grid-header',
        append_to: this.layers.grid
      });
    }
  }, {
    key: "make_grid_ticks",
    value: function make_grid_ticks() {
      var tick_x = 0;
      var tick_y = this.options.header_height + this.options.padding / 2;
      var tick_height = (this.options.bar_height + this.options.padding) * this.tasks.length;
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = this.dates[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var date = _step5.value;
          var tick_class = 'tick'; // thick tick for monday

          if (this.view_is('Day') && date.getDate() === 1) {
            tick_class += ' thick';
          } // thick tick for first week


          if (this.view_is('Week') && date.getDate() >= 1 && date.getDate() < 8) {
            tick_class += ' thick';
          } // thick ticks for quarters


          if (this.view_is('Month') && (date.getMonth() + 1) % 3 === 0) {
            tick_class += ' thick';
          }

          (0, _svg_utils.createSVG)('path', {
            d: "M ".concat(tick_x, " ").concat(tick_y, " v ").concat(tick_height),
            "class": tick_class,
            append_to: this.layers.grid
          });

          if (this.view_is('Month')) {
            tick_x += _date_utils["default"].get_days_in_month(date) * this.options.column_width / 30;
          } else {
            tick_x += this.options.column_width;
          }
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
            _iterator5["return"]();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }
    }
  }, {
    key: "make_grid_highlights",
    value: function make_grid_highlights() {
      // highlight today's date
      if (this.view_is('Day')) {
        var x = _date_utils["default"].diff(_date_utils["default"].today(), this.gantt_start, 'hour') / this.options.step * this.options.column_width;
        var y = 0;
        var width = this.options.column_width;
        var height = (this.options.bar_height + this.options.padding) * this.tasks.length + this.options.header_height + this.options.padding / 2;
        (0, _svg_utils.createSVG)('rect', {
          x: x,
          y: y,
          width: width,
          height: height,
          "class": 'today-highlight',
          append_to: this.layers.grid
        });
      }
    }
  }, {
    key: "make_dates",
    value: function make_dates() {
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = this.get_dates_to_draw()[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var date = _step6.value;
          (0, _svg_utils.createSVG)('text', {
            x: date.lower_x,
            y: date.lower_y,
            innerHTML: date.lower_text,
            "class": 'lower-text',
            append_to: this.layers.date
          });

          if (date.upper_text) {
            var $upper_text = (0, _svg_utils.createSVG)('text', {
              x: date.upper_x,
              y: date.upper_y,
              innerHTML: date.upper_text,
              "class": 'upper-text',
              append_to: this.layers.date
            }); // remove out-of-bound dates

            if ($upper_text.getBBox().x2 > this.layers.grid.getBBox().width) {
              $upper_text.remove();
            }
          }
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6["return"] != null) {
            _iterator6["return"]();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }
    }
  }, {
    key: "get_dates_to_draw",
    value: function get_dates_to_draw() {
      var _this = this;

      var last_date = null;
      var dates = this.dates.map(function (date, i) {
        var d = _this.get_date_info(date, last_date, i);

        last_date = date;
        return d;
      });
      return dates;
    }
  }, {
    key: "get_date_info",
    value: function get_date_info(date, last_date, i) {
      if (!last_date) {
        last_date = _date_utils["default"].add(date, 1, 'year');
      }

      var date_text = {
        'Quarter Day_lower': _date_utils["default"].format(date, 'HH', this.options.language),
        'Half Day_lower': _date_utils["default"].format(date, 'HH', this.options.language),
        Day_lower: date.getDate() !== last_date.getDate() ? _date_utils["default"].format(date, 'D', this.options.language) : '',
        Week_lower: date.getMonth() !== last_date.getMonth() ? _date_utils["default"].format(date, 'D MMM', this.options.language) : _date_utils["default"].format(date, 'D', this.options.language),
        Month_lower: _date_utils["default"].format(date, 'MMMM', this.options.language),
        Year_lower: _date_utils["default"].format(date, 'YYYY', this.options.language),
        'Quarter Day_upper': date.getDate() !== last_date.getDate() ? _date_utils["default"].format(date, 'D MMM', this.options.language) : '',
        'Half Day_upper': date.getDate() !== last_date.getDate() ? date.getMonth() !== last_date.getMonth() ? _date_utils["default"].format(date, 'D MMM', this.options.language) : _date_utils["default"].format(date, 'D', this.options.language) : '',
        Day_upper: date.getMonth() !== last_date.getMonth() ? _date_utils["default"].format(date, 'MMMM', this.options.language) : '',
        Week_upper: date.getMonth() !== last_date.getMonth() ? _date_utils["default"].format(date, 'MMMM', this.options.language) : '',
        Month_upper: date.getFullYear() !== last_date.getFullYear() ? _date_utils["default"].format(date, 'YYYY', this.options.language) : '',
        Year_upper: date.getFullYear() !== last_date.getFullYear() ? _date_utils["default"].format(date, 'YYYY', this.options.language) : ''
      };
      var base_pos = {
        x: i * this.options.column_width,
        lower_y: this.options.header_height,
        upper_y: this.options.header_height - 25
      };
      var x_pos = {
        'Quarter Day_lower': this.options.column_width * 4 / 2,
        'Quarter Day_upper': 0,
        'Half Day_lower': this.options.column_width * 2 / 2,
        'Half Day_upper': 0,
        Day_lower: this.options.column_width / 2,
        Day_upper: this.options.column_width * 30 / 2,
        Week_lower: 0,
        Week_upper: this.options.column_width * 4 / 2,
        Month_lower: this.options.column_width / 2,
        Month_upper: this.options.column_width * 12 / 2,
        Year_lower: this.options.column_width / 2,
        Year_upper: this.options.column_width * 30 / 2
      };
      return {
        upper_text: date_text["".concat(this.options.view_mode, "_upper")],
        lower_text: date_text["".concat(this.options.view_mode, "_lower")],
        upper_x: base_pos.x + x_pos["".concat(this.options.view_mode, "_upper")],
        upper_y: base_pos.upper_y,
        lower_x: base_pos.x + x_pos["".concat(this.options.view_mode, "_lower")],
        lower_y: base_pos.lower_y
      };
    }
  }, {
    key: "make_bars",
    value: function make_bars() {
      var _this2 = this;

      this.bars = this.tasks.map(function (task) {
        var bar = new _bar["default"](_this2, task);

        _this2.layers.bar.appendChild(bar.group);

        return bar;
      });
    }
  }, {
    key: "make_arrows",
    value: function make_arrows() {
      var _this3 = this;

      this.arrows = [];
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        var _loop = function _loop() {
          var task = _step7.value;
          var arrows = [];
          arrows = task.dependencies.map(function (task_id) {
            var dependency = _this3.get_task(task_id);

            if (!dependency) return;
            var arrow = new _arrow["default"](_this3, _this3.bars[dependency._index], // from_task
            _this3.bars[task._index] // to_task
            );

            _this3.layers.arrow.appendChild(arrow.element);

            return arrow;
          }).filter(Boolean); // filter falsy values

          _this3.arrows = _this3.arrows.concat(arrows);
        };

        for (var _iterator7 = this.tasks[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          _loop();
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7["return"] != null) {
            _iterator7["return"]();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }
    }
  }, {
    key: "map_arrows_on_bars",
    value: function map_arrows_on_bars() {
      var _this4 = this;

      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        var _loop2 = function _loop2() {
          var bar = _step8.value;
          bar.arrows = _this4.arrows.filter(function (arrow) {
            return arrow.from_task.task.id === bar.task.id || arrow.to_task.task.id === bar.task.id;
          });
        };

        for (var _iterator8 = this.bars[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          _loop2();
        }
      } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion8 && _iterator8["return"] != null) {
            _iterator8["return"]();
          }
        } finally {
          if (_didIteratorError8) {
            throw _iteratorError8;
          }
        }
      }
    }
  }, {
    key: "set_width",
    value: function set_width() {
      var cur_width = this.$svg.getBoundingClientRect().width;
      var actual_width = this.$svg.querySelector('.grid .grid-row').getAttribute('width');

      if (cur_width < actual_width) {
        this.$svg.setAttribute('width', actual_width);
      }
    }
  }, {
    key: "set_scroll_position",
    value: function set_scroll_position() {
      var parent_element = this.$svg.parentElement;
      if (!parent_element) return;

      var hours_before_first_task = _date_utils["default"].diff(this.get_oldest_starting_date(), this.gantt_start, 'hour');

      var scroll_pos = hours_before_first_task / this.options.step * this.options.column_width - this.options.column_width;
      parent_element.scrollLeft = scroll_pos;
    }
  }, {
    key: "bind_grid_click",
    value: function bind_grid_click() {
      var _this5 = this;

      _svg_utils.$.on(this.$svg, this.options.popup_trigger, '.grid-row, .grid-header', function () {
        _this5.unselect_all();

        _this5.hide_popup();
      });
    }
  }, {
    key: "bind_bar_events",
    value: function bind_bar_events() {
      var _this6 = this;

      var is_dragging = false;
      var x_on_start = 0;
      var y_on_start = 0;
      var is_resizing_left = false;
      var is_resizing_right = false;
      var parent_bar_id = null;
      var bars = []; // instanceof Bar

      this.bar_being_dragged = null;

      function action_in_progress() {
        return is_dragging || is_resizing_left || is_resizing_right;
      }

      _svg_utils.$.on(this.$svg, 'mousedown', '.bar-wrapper, .handle', function (e, element) {
        var bar_wrapper = _svg_utils.$.closest('.bar-wrapper', element);

        if (element.classList.contains('left')) {
          is_resizing_left = true;
        } else if (element.classList.contains('right')) {
          is_resizing_right = true;
        } else if (element.classList.contains('bar-wrapper')) {
          is_dragging = true;
        }

        bar_wrapper.classList.add('active');
        x_on_start = e.offsetX;
        y_on_start = e.offsetY;
        parent_bar_id = bar_wrapper.getAttribute('data-id');
        var ids = [parent_bar_id].concat(_toConsumableArray(_this6.get_all_dependent_tasks(parent_bar_id)));
        bars = ids.map(function (id) {
          return _this6.get_bar(id);
        });
        _this6.bar_being_dragged = parent_bar_id;
        bars.forEach(function (bar) {
          var $bar = bar.$bar;
          $bar.ox = $bar.getX();
          $bar.oy = $bar.getY();
          $bar.owidth = $bar.getWidth();
          $bar.finaldx = 0;
        });
      });

      _svg_utils.$.on(this.$svg, 'mousemove', function (e) {
        if (!action_in_progress()) return;
        var dx = e.offsetX - x_on_start;
        var dy = e.offsetY - y_on_start;
        bars.forEach(function (bar) {
          var $bar = bar.$bar;
          $bar.finaldx = _this6.get_snap_position(dx);

          if (is_resizing_left) {
            if (parent_bar_id === bar.task.id) {
              bar.update_bar_position({
                x: $bar.ox + $bar.finaldx,
                width: $bar.owidth - $bar.finaldx
              });
            } else {
              bar.update_bar_position({
                x: $bar.ox + $bar.finaldx
              });
            }
          } else if (is_resizing_right) {
            if (parent_bar_id === bar.task.id) {
              bar.update_bar_position({
                width: $bar.owidth + $bar.finaldx
              });
            }
          } else if (is_dragging) {
            bar.update_bar_position({
              x: $bar.ox + $bar.finaldx
            });
          }
        });
      });

      document.addEventListener('mouseup', function (e) {
        if (is_dragging || is_resizing_left || is_resizing_right) {
          bars.forEach(function (bar) {
            return bar.group.classList.remove('active');
          });
        }

        is_dragging = false;
        is_resizing_left = false;
        is_resizing_right = false;
      });

      _svg_utils.$.on(this.$svg, 'mouseup', function (e) {
        _this6.bar_being_dragged = null;
        bars.forEach(function (bar) {
          var $bar = bar.$bar;
          if (!$bar.finaldx) return;
          bar.date_changed();
          bar.set_action_completed();
        });
      });

      this.bind_bar_progress();
    }
  }, {
    key: "bind_bar_progress",
    value: function bind_bar_progress() {
      var _this7 = this;

      var x_on_start = 0;
      var y_on_start = 0;
      var is_resizing = null;
      var bar = null;
      var $bar_progress = null;
      var $bar = null;

      _svg_utils.$.on(this.$svg, 'mousedown', '.handle.progress', function (e, handle) {
        is_resizing = true;
        x_on_start = e.offsetX;
        y_on_start = e.offsetY;

        var $bar_wrapper = _svg_utils.$.closest('.bar-wrapper', handle);

        var id = $bar_wrapper.getAttribute('data-id');
        bar = _this7.get_bar(id);
        $bar_progress = bar.$bar_progress;
        $bar = bar.$bar;
        $bar_progress.finaldx = 0;
        $bar_progress.owidth = $bar_progress.getWidth();
        $bar_progress.min_dx = -$bar_progress.getWidth();
        $bar_progress.max_dx = $bar.getWidth() - $bar_progress.getWidth();
      });

      _svg_utils.$.on(this.$svg, 'mousemove', function (e) {
        if (!is_resizing) return;
        var dx = e.offsetX - x_on_start;
        var dy = e.offsetY - y_on_start;

        if (dx > $bar_progress.max_dx) {
          dx = $bar_progress.max_dx;
        }

        if (dx < $bar_progress.min_dx) {
          dx = $bar_progress.min_dx;
        }

        var $handle = bar.$handle_progress;

        _svg_utils.$.attr($bar_progress, 'width', $bar_progress.owidth + dx);

        _svg_utils.$.attr($handle, 'points', bar.get_progress_polygon_points());

        $bar_progress.finaldx = dx;
      });

      _svg_utils.$.on(this.$svg, 'mouseup', function () {
        is_resizing = false;
        if (!($bar_progress && $bar_progress.finaldx)) return;
        bar.progress_changed();
        bar.set_action_completed();
      });
    }
  }, {
    key: "get_all_dependent_tasks",
    value: function get_all_dependent_tasks(task_id) {
      var _this8 = this;

      var out = [];
      var to_process = [task_id];

      while (to_process.length) {
        var deps = to_process.reduce(function (acc, curr) {
          acc = acc.concat(_this8.dependency_map[curr]);
          return acc;
        }, []);
        out = out.concat(deps);
        to_process = deps.filter(function (d) {
          return !to_process.includes(d);
        });
      }

      return out.filter(Boolean);
    }
  }, {
    key: "get_snap_position",
    value: function get_snap_position(dx) {
      var odx = dx,
          rem,
          position;

      if (this.view_is('Week')) {
        rem = dx % (this.options.column_width / 7);
        position = odx - rem + (rem < this.options.column_width / 14 ? 0 : this.options.column_width / 7);
      } else if (this.view_is('Month')) {
        rem = dx % (this.options.column_width / 30);
        position = odx - rem + (rem < this.options.column_width / 60 ? 0 : this.options.column_width / 30);
      } else {
        rem = dx % this.options.column_width;
        position = odx - rem + (rem < this.options.column_width / 2 ? 0 : this.options.column_width);
      }

      return position;
    }
  }, {
    key: "unselect_all",
    value: function unselect_all() {
      _toConsumableArray(this.$svg.querySelectorAll('.bar-wrapper')).forEach(function (el) {
        el.classList.remove('active');
      });
    }
  }, {
    key: "view_is",
    value: function view_is(modes) {
      var _this9 = this;

      if (typeof modes === 'string') {
        return this.options.view_mode === modes;
      }

      if (Array.isArray(modes)) {
        return modes.some(function (mode) {
          return _this9.options.view_mode === mode;
        });
      }

      return false;
    }
  }, {
    key: "get_task",
    value: function get_task(id) {
      return this.tasks.find(function (task) {
        return task.id === id;
      });
    }
  }, {
    key: "get_bar",
    value: function get_bar(id) {
      return this.bars.find(function (bar) {
        return bar.task.id === id;
      });
    }
  }, {
    key: "show_popup",
    value: function show_popup(options) {
      if (!this.popup) {
        this.popup = new _popup["default"](this.popup_wrapper, this.options.custom_popup_html);
      }

      this.popup.show(options);
    }
  }, {
    key: "hide_popup",
    value: function hide_popup() {
      this.popup && this.popup.hide();
    }
  }, {
    key: "trigger_event",
    value: function trigger_event(event, args) {
      if (this.options['on_' + event]) {
        this.options['on_' + event].apply(null, args);
      }
    }
    /**
     * Gets the oldest starting date from the list of tasks
     *
     * @returns Date
     * @memberof Gantt
     */

  }, {
    key: "get_oldest_starting_date",
    value: function get_oldest_starting_date() {
      return this.tasks.map(function (task) {
        return task._start;
      }).reduce(function (prev_date, cur_date) {
        return cur_date <= prev_date ? cur_date : prev_date;
      });
    }
    /**
     * Clear all elements from the parent svg element
     *
     * @memberof Gantt
     */

  }, {
    key: "clear",
    value: function clear() {
      this.$svg.innerHTML = '';
    }
  }]);

  return Gantt;
}();

exports["default"] = Gantt;

function generate_id(task) {
  return task.name + '_' + Math.random().toString(36).slice(2, 12);
}