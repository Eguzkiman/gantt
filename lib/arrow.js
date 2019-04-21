"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _svg_utils = require("./svg_utils");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Arrow =
/*#__PURE__*/
function () {
  function Arrow(gantt, from_task, to_task) {
    _classCallCheck(this, Arrow);

    this.gantt = gantt;
    this.from_task = from_task;
    this.to_task = to_task;
    this.calculate_path();
    this.draw();
  }

  _createClass(Arrow, [{
    key: "calculate_path",
    value: function calculate_path() {
      var _this = this;

      var start_x = this.from_task.$bar.getX() + this.from_task.$bar.getWidth() / 2;

      var condition = function condition() {
        return _this.to_task.$bar.getX() < start_x + _this.gantt.options.padding && start_x > _this.from_task.$bar.getX() + _this.gantt.options.padding;
      };

      while (condition()) {
        start_x -= 10;
      }

      var start_y = this.gantt.options.header_height + this.gantt.options.bar_height + (this.gantt.options.padding + this.gantt.options.bar_height) * this.from_task.task._index + this.gantt.options.padding;
      var end_x = this.to_task.$bar.getX() - this.gantt.options.padding / 2;
      var end_y = this.gantt.options.header_height + this.gantt.options.bar_height / 2 + (this.gantt.options.padding + this.gantt.options.bar_height) * this.to_task.task._index + this.gantt.options.padding;
      var from_is_below_to = this.from_task.task._index > this.to_task.task._index;
      var curve = this.gantt.options.arrow_curve;
      var clockwise = from_is_below_to ? 1 : 0;
      var curve_y = from_is_below_to ? -curve : curve;
      var offset = from_is_below_to ? end_y + this.gantt.options.arrow_curve : end_y - this.gantt.options.arrow_curve;
      this.path = "\n            M ".concat(start_x, " ").concat(start_y, "\n            V ").concat(offset, "\n            a ").concat(curve, " ").concat(curve, " 0 0 ").concat(clockwise, " ").concat(curve, " ").concat(curve_y, "\n            L ").concat(end_x, " ").concat(end_y, "\n            m -5 -5\n            l 5 5\n            l -5 5");

      if (this.to_task.$bar.getX() < this.from_task.$bar.getX() + this.gantt.options.padding) {
        var down_1 = this.gantt.options.padding / 2 - curve;
        var down_2 = this.to_task.$bar.getY() + this.to_task.$bar.getHeight() / 2 - curve_y;
        var left = this.to_task.$bar.getX() - this.gantt.options.padding;
        this.path = "\n                M ".concat(start_x, " ").concat(start_y, "\n                v ").concat(down_1, "\n                a ").concat(curve, " ").concat(curve, " 0 0 1 -").concat(curve, " ").concat(curve, "\n                H ").concat(left, "\n                a ").concat(curve, " ").concat(curve, " 0 0 ").concat(clockwise, " -").concat(curve, " ").concat(curve_y, "\n                V ").concat(down_2, "\n                a ").concat(curve, " ").concat(curve, " 0 0 ").concat(clockwise, " ").concat(curve, " ").concat(curve_y, "\n                L ").concat(end_x, " ").concat(end_y, "\n                m -5 -5\n                l 5 5\n                l -5 5");
      }
    }
  }, {
    key: "draw",
    value: function draw() {
      this.element = (0, _svg_utils.createSVG)('path', {
        d: this.path,
        'data-from': this.from_task.task.id,
        'data-to': this.to_task.task.id
      });
    }
  }, {
    key: "update",
    value: function update() {
      this.calculate_path();
      this.element.setAttribute('d', this.path);
    }
  }]);

  return Arrow;
}();

exports["default"] = Arrow;