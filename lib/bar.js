"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _date_utils = _interopRequireDefault(require("./date_utils"));

var _svg_utils = require("./svg_utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Bar =
/*#__PURE__*/
function () {
  function Bar(gantt, task) {
    _classCallCheck(this, Bar);

    this.set_defaults(gantt, task);
    this.prepare();
    this.draw();
    this.bind();
  }

  _createClass(Bar, [{
    key: "set_defaults",
    value: function set_defaults(gantt, task) {
      this.action_completed = false;
      this.gantt = gantt;
      this.task = task;
    }
  }, {
    key: "prepare",
    value: function prepare() {
      this.prepare_values();
      this.prepare_helpers();
    }
  }, {
    key: "prepare_values",
    value: function prepare_values() {
      this.invalid = this.task.invalid;
      this.height = this.gantt.options.bar_height;
      this.x = this.compute_x();
      this.y = this.compute_y();
      this.corner_radius = this.gantt.options.bar_corner_radius;
      this.duration = _date_utils["default"].diff(this.task._end, this.task._start, 'hour') / this.gantt.options.step;
      this.width = this.gantt.options.column_width * this.duration;
      this.progress_width = this.gantt.options.column_width * this.duration * (this.task.progress / 100) || 0;
      this.group = (0, _svg_utils.createSVG)('g', {
        "class": 'bar-wrapper ' + (this.task.custom_class || ''),
        'data-id': this.task.id
      });
      this.bar_group = (0, _svg_utils.createSVG)('g', {
        "class": 'bar-group',
        append_to: this.group
      });
      this.handle_group = (0, _svg_utils.createSVG)('g', {
        "class": 'handle-group',
        append_to: this.group
      });
    }
  }, {
    key: "prepare_helpers",
    value: function prepare_helpers() {
      SVGElement.prototype.getX = function () {
        return +this.getAttribute('x');
      };

      SVGElement.prototype.getY = function () {
        return +this.getAttribute('y');
      };

      SVGElement.prototype.getWidth = function () {
        return +this.getAttribute('width');
      };

      SVGElement.prototype.getHeight = function () {
        return +this.getAttribute('height');
      };

      SVGElement.prototype.getEndX = function () {
        return this.getX() + this.getWidth();
      };
    }
  }, {
    key: "draw",
    value: function draw() {
      this.draw_bar();
      this.draw_progress_bar();
      this.draw_label();
      this.draw_resize_handles();
    }
  }, {
    key: "draw_bar",
    value: function draw_bar() {
      this.$bar = (0, _svg_utils.createSVG)('rect', {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        rx: this.corner_radius,
        ry: this.corner_radius,
        "class": 'bar',
        append_to: this.bar_group
      });
      (0, _svg_utils.animateSVG)(this.$bar, 'width', 0, this.width);

      if (this.invalid) {
        this.$bar.classList.add('bar-invalid');
      }
    }
  }, {
    key: "draw_progress_bar",
    value: function draw_progress_bar() {
      if (this.invalid) return;
      this.$bar_progress = (0, _svg_utils.createSVG)('rect', {
        x: this.x,
        y: this.y,
        width: this.progress_width,
        height: this.height,
        rx: this.corner_radius,
        ry: this.corner_radius,
        "class": 'bar-progress',
        append_to: this.bar_group
      });
      (0, _svg_utils.animateSVG)(this.$bar_progress, 'width', 0, this.progress_width);
    }
  }, {
    key: "draw_label",
    value: function draw_label() {
      var _this = this;

      (0, _svg_utils.createSVG)('text', {
        x: this.x + this.width / 2,
        y: this.y + this.height / 2,
        innerHTML: this.task.name,
        "class": 'bar-label',
        append_to: this.bar_group
      }); // labels get BBox in the next tick

      requestAnimationFrame(function () {
        return _this.update_label_position();
      });
    }
  }, {
    key: "draw_resize_handles",
    value: function draw_resize_handles() {
      if (this.invalid) return;
      var bar = this.$bar;
      var handle_width = 8;
      (0, _svg_utils.createSVG)('rect', {
        x: bar.getX() + bar.getWidth() - 9,
        y: bar.getY() + 1,
        width: handle_width,
        height: this.height - 2,
        rx: this.corner_radius,
        ry: this.corner_radius,
        "class": 'handle right',
        append_to: this.handle_group
      });
      (0, _svg_utils.createSVG)('rect', {
        x: bar.getX() + 1,
        y: bar.getY() + 1,
        width: handle_width,
        height: this.height - 2,
        rx: this.corner_radius,
        ry: this.corner_radius,
        "class": 'handle left',
        append_to: this.handle_group
      });

      if (this.task.progress && this.task.progress < 100) {
        this.$handle_progress = (0, _svg_utils.createSVG)('polygon', {
          points: this.get_progress_polygon_points().join(','),
          "class": 'handle progress',
          append_to: this.handle_group
        });
      }
    }
  }, {
    key: "get_progress_polygon_points",
    value: function get_progress_polygon_points() {
      var bar_progress = this.$bar_progress;
      return [bar_progress.getEndX() - 5, bar_progress.getY() + bar_progress.getHeight(), bar_progress.getEndX() + 5, bar_progress.getY() + bar_progress.getHeight(), bar_progress.getEndX(), bar_progress.getY() + bar_progress.getHeight() - 8.66];
    }
  }, {
    key: "bind",
    value: function bind() {
      if (this.invalid) return;
      this.setup_click_event();
    }
  }, {
    key: "setup_click_event",
    value: function setup_click_event() {
      var _this2 = this;

      _svg_utils.$.on(this.group, 'focus ' + this.gantt.options.popup_trigger, function (e) {
        if (_this2.action_completed) {
          // just finished a move action, wait for a few seconds
          return;
        }

        if (e.type === 'click') {
          _this2.gantt.trigger_event('click', [_this2.task]);
        }

        _this2.gantt.unselect_all();

        _this2.group.classList.toggle('active');

        _this2.show_popup();
      });
    }
  }, {
    key: "show_popup",
    value: function show_popup() {
      if (this.gantt.bar_being_dragged) return;

      var start_date = _date_utils["default"].format(this.task._start, 'MMM D');

      var end_date = _date_utils["default"].format(_date_utils["default"].add(this.task._end, -1, 'second'), 'MMM D');

      var subtitle = start_date + ' - ' + end_date;
      this.gantt.show_popup({
        target_element: this.$bar,
        title: this.task.name,
        subtitle: subtitle,
        task: this.task
      });
    }
  }, {
    key: "update_bar_position",
    value: function update_bar_position(_ref) {
      var _this3 = this;

      var _ref$x = _ref.x,
          x = _ref$x === void 0 ? null : _ref$x,
          _ref$width = _ref.width,
          width = _ref$width === void 0 ? null : _ref$width;
      var bar = this.$bar;

      if (x) {
        // get all x values of parent task
        var xs = this.task.dependencies.map(function (dep) {
          return _this3.gantt.get_bar(dep).$bar.getX();
        }); // child task must not go before parent

        var valid_x = xs.reduce(function (prev, curr) {
          return x >= curr;
        }, x);

        if (!valid_x) {
          width = null;
          return;
        }

        this.update_attr(bar, 'x', x);
      }

      if (width && width >= this.gantt.options.column_width) {
        this.update_attr(bar, 'width', width);
      }

      this.update_label_position();
      this.update_handle_position();
      this.update_progressbar_position();
      this.update_arrow_position();
    }
  }, {
    key: "date_changed",
    value: function date_changed() {
      var changed = false;

      var _this$compute_start_e = this.compute_start_end_date(),
          new_start_date = _this$compute_start_e.new_start_date,
          new_end_date = _this$compute_start_e.new_end_date;

      if (Number(this.task._start) !== Number(new_start_date)) {
        changed = true;
        this.task._start = new_start_date;
      }

      if (Number(this.task._end) !== Number(new_end_date)) {
        changed = true;
        this.task._end = new_end_date;
      }

      if (!changed) return;
      this.gantt.trigger_event('date_change', [this.task, new_start_date, _date_utils["default"].add(new_end_date, -1, 'second')]);
    }
  }, {
    key: "progress_changed",
    value: function progress_changed() {
      var new_progress = this.compute_progress();
      this.task.progress = new_progress;
      this.gantt.trigger_event('progress_change', [this.task, new_progress]);
    }
  }, {
    key: "set_action_completed",
    value: function set_action_completed() {
      var _this4 = this;

      this.action_completed = true;
      setTimeout(function () {
        return _this4.action_completed = false;
      }, 1000);
    }
  }, {
    key: "compute_start_end_date",
    value: function compute_start_end_date() {
      var bar = this.$bar;
      var x_in_units = bar.getX() / this.gantt.options.column_width;

      var new_start_date = _date_utils["default"].add(this.gantt.gantt_start, x_in_units * this.gantt.options.step, 'hour');

      var width_in_units = bar.getWidth() / this.gantt.options.column_width;

      var new_end_date = _date_utils["default"].add(new_start_date, width_in_units * this.gantt.options.step, 'hour');

      return {
        new_start_date: new_start_date,
        new_end_date: new_end_date
      };
    }
  }, {
    key: "compute_progress",
    value: function compute_progress() {
      var progress = this.$bar_progress.getWidth() / this.$bar.getWidth() * 100;
      return parseInt(progress, 10);
    }
  }, {
    key: "compute_x",
    value: function compute_x() {
      var _this$gantt$options = this.gantt.options,
          step = _this$gantt$options.step,
          column_width = _this$gantt$options.column_width;
      var task_start = this.task._start;
      var gantt_start = this.gantt.gantt_start;

      var diff = _date_utils["default"].diff(task_start, gantt_start, 'hour');

      var x = diff / step * column_width;

      if (this.gantt.view_is('Month')) {
        var _diff = _date_utils["default"].diff(task_start, gantt_start, 'day');

        x = _diff * column_width / 30;
      }

      return x;
    }
  }, {
    key: "compute_y",
    value: function compute_y() {
      return this.gantt.options.header_height + this.gantt.options.padding + this.task._index * (this.height + this.gantt.options.padding);
    }
  }, {
    key: "get_snap_position",
    value: function get_snap_position(dx) {
      var odx = dx,
          rem,
          position;

      if (this.gantt.view_is('Week')) {
        rem = dx % (this.gantt.options.column_width / 7);
        position = odx - rem + (rem < this.gantt.options.column_width / 14 ? 0 : this.gantt.options.column_width / 7);
      } else if (this.gantt.view_is('Month')) {
        rem = dx % (this.gantt.options.column_width / 30);
        position = odx - rem + (rem < this.gantt.options.column_width / 60 ? 0 : this.gantt.options.column_width / 30);
      } else {
        rem = dx % this.gantt.options.column_width;
        position = odx - rem + (rem < this.gantt.options.column_width / 2 ? 0 : this.gantt.options.column_width);
      }

      return position;
    }
  }, {
    key: "update_attr",
    value: function update_attr(element, attr, value) {
      value = +value;

      if (!isNaN(value)) {
        element.setAttribute(attr, value);
      }

      return element;
    }
  }, {
    key: "update_progressbar_position",
    value: function update_progressbar_position() {
      this.$bar_progress.setAttribute('x', this.$bar.getX());
      this.$bar_progress.setAttribute('width', this.$bar.getWidth() * (this.task.progress / 100));
    }
  }, {
    key: "update_label_position",
    value: function update_label_position() {
      var bar = this.$bar,
          label = this.group.querySelector('.bar-label');

      if (label.getBBox().width > bar.getWidth()) {
        label.classList.add('big');
        label.setAttribute('x', bar.getX() + bar.getWidth() + 5);
      } else {
        label.classList.remove('big');
        label.setAttribute('x', bar.getX() + bar.getWidth() / 2);
      }
    }
  }, {
    key: "update_handle_position",
    value: function update_handle_position() {
      var bar = this.$bar;
      this.handle_group.querySelector('.handle.left').setAttribute('x', bar.getX() + 1);
      this.handle_group.querySelector('.handle.right').setAttribute('x', bar.getEndX() - 9);
      var handle = this.group.querySelector('.handle.progress');
      handle && handle.setAttribute('points', this.get_progress_polygon_points());
    }
  }, {
    key: "update_arrow_position",
    value: function update_arrow_position() {
      this.arrows = this.arrows || [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.arrows[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var arrow = _step.value;
          arrow.update();
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
  }]);

  return Bar;
}();

exports["default"] = Bar;

function isFunction(functionToCheck) {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}