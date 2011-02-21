var Shodan = window.Shodan || {};

Shodan.UI = {};

Shodan.UI.Base = Class.create({
  initialize: function(el, options) {
    this.el = $(el);
  }
});