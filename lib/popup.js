"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Popup =
/*#__PURE__*/
function () {
  function Popup(parent, custom_html) {
    _classCallCheck(this, Popup);

    this.parent = parent;
    this.custom_html = custom_html;
    this.make();
  }

  _createClass(Popup, [{
    key: "make",
    value: function make() {
      this.parent.innerHTML = "\n            <div class=\"title\"></div>\n            <div class=\"subtitle\"></div>\n            <div class=\"pointer\"></div>\n        ";
      this.hide();
      this.title = this.parent.querySelector('.title');
      this.subtitle = this.parent.querySelector('.subtitle');
      this.pointer = this.parent.querySelector('.pointer');
    }
  }, {
    key: "show",
    value: function show(options) {
      if (!options.target_element) {
        throw new Error('target_element is required to show popup');
      }

      if (!options.position) {
        options.position = 'left';
      }

      var target_element = options.target_element;

      if (this.custom_html) {
        var html = this.custom_html(options.task);
        html += '<div class="pointer"></div>';
        this.parent.innerHTML = html;
        this.pointer = this.parent.querySelector('.pointer');
      } else {
        // set data
        this.title.innerHTML = options.title;
        this.subtitle.innerHTML = options.subtitle;
        this.parent.style.width = this.parent.clientWidth + 'px';
      } // set position


      var position_meta;

      if (target_element instanceof HTMLElement) {
        position_meta = target_element.getBoundingClientRect();
      } else if (target_element instanceof SVGElement) {
        position_meta = options.target_element.getBBox();
      }

      if (options.position === 'left') {
        this.parent.style.left = position_meta.x + (position_meta.width + 10) + 'px';
        this.parent.style.top = position_meta.y + 'px';
        this.pointer.style.transform = 'rotateZ(90deg)';
        this.pointer.style.left = '-7px';
        this.pointer.style.top = '2px';
      } // show


      this.parent.style.opacity = 1;
    }
  }, {
    key: "hide",
    value: function hide() {
      this.parent.style.opacity = 0;
    }
  }]);

  return Popup;
}();

exports["default"] = Popup;