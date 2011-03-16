/**
 *  Shodan
 **/
var Shodan = window.Shodan || {};

/**
 *  Shodan.UI
 **/
Shodan.UI = {};

/** section: Shodan UI
 *  class Shodan.UI.Base
 *
 *  Base class that all Shodan.UI components are based on.
 **/
Shodan.UI.Base = Class.create({
  initialize: function(el, options) {
    this.el = $(el);
  }
});
