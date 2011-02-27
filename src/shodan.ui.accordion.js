/**
 *  Shodan.UI
 **/

var Shodan = window.Shodan || {};

/** section: Shodan UI
 *  class Shodan.UI.SlideyPanel < Shodan.UI.Base
 *
 *  A mechanism for hiding and showing content with a nice, sliding animation. Pretty common
 *  around teh Interwebs although I've never really found a proper name for them. Unless informed
 *  otherwise, I hereby name them "Slidey Panels".
 **/
Shodan.UI.SlideyPanel = Class.create(Shodan.UI.Base, {
  /**
   *  new Shodan.UI.SlideyPanel(element[, options])
   *  - element (String): DOM Element or ID of the slidey panel container
   *  - options (Object): Object containing various configuration options
   *
   **/
  initialize: function($super, el, options) {
    this.options = Object.extend({
      // autoHide (Bool)
      // set to true if content should be hidden initially
      autoHide: true,

      // callback (Function)
      // Callback function to be executed after show / hide animation
      callback: null,

      // contentSelector (String)
      // CSS selector for the content to be toggled. Should be unique.
      contentSelector: '.content',

      // duration (Int)
      // Duration in seconds, defaults to 0.5 (a fifth of a second).
      duration: '0.5',

      // openClass (String)
      // CSS class to be applied to container when content is showing.
      openClass: 'open',

      // toggleSelector (String)
      // CSS selector for the toggle. Should be unique.
      toggleSelector: '.hd',

      // transition (String)
      // Scripty2 animation transition preset.
      // See http://scripty2.com/doc/scripty2%20fx/s2/fx/transitions.html
      transition: 'sinusoidal'
    }, options || {});
    $super(el, this.options);
    this.build();
  },
  /**
   *  Shodan.UI.SlideyPanel.build()
   **/
  build: function() {
    this.content = this.el.down(this.options.contentSelector);

    this._hide = this.hideContent.curry(function() {
      this.el.removeClassName(this.options.openClass);
      // if one has been, set execute the callback function
      if (typeof this.options.callback === 'function') {
        this.options.callback();
      }
    }.bind(this), this.content);

    this.reveal = this.revealContent.curry(function() {
      this.el.addClassName(this.options.openClass);
      // if one has been, set execute the callback function
      if (typeof this.options.callback === 'function') {
        this.options.callback();
      }
    }.bind(this), this.content);

    this.resetContentCSS(this.content);
    // if autohide is set, auto... hide...
    if (this.options.autoHide) {
      this._hide();
    }
    this.el.on('click', this.options.toggleSelector, this.onClick.bind(this));
  },
  /**
   *  Shodan.UI.SlideyPanel.resetContentCSS()
   *
   *  Sanitize the CSS on the content container
   **/
  resetContentCSS: function(content) {
    content.setStyle({
      border: 'none',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    });
  },
  /**
   *  Shodan.UI.SlideyPanel.revealContent()
   **/
  revealContent: function(after, content) {
    // grab the content height from the elements data store
    var h = content.retrieve('openHeight');
    content.morph('height:'+h+'px', {
      after: after,
      duration: this.options.duration,
      transition: this.options.transition
    });
  },
  /**
   *  Shodan.UI.SlideyPanel.hideContent()
   **/
  hideContent: function(after, content) {
    // grab the height of the content and store it on the
    // element for later. We do this every time on the off
    // chance that the content height might change.
    var h = content.measure('margin-box-height');
    content.store('openHeight', h);
    content.morph('height:0', {
      after: after,
      duration: this.options.duration,
      transition: this.options.transition
    });
  },
  /**
   *  Shodan.UI.SlideyPanel.onClick(event, el)
   *  - event (Event): native event instance
   *  - el (DOMElement): target DOM element
   **/
  onClick: function(e, el) {
    e.stop();
    (this.el.hasClassName(this.options.openClass)) ? this._hide() : this.reveal();
  }
});


/** section: Shodan UI
 *  class Shodan.UI.Accordion < Shodan.UI.SlideyPanel
 *
 *  An extension of the slidey panel.
 **/
Shodan.UI.Accordion = Class.create(Shodan.UI.SlideyPanel, {
  /**
   *  new Shodan.UI.Accordion(element[, options])
   *  - element (String): DOM Element or ID of the slidey panel container
   *  - options (Object): Object containing various configuration options
   *
   **/
  initialize: function($super, el, options) {
    this.options = Object.extend({
      // allowMultiOpen (String)
      // Set to true if more than one item can be open at once.
      allowMultiOpen: false,

      // contentSelector (String)
      // CSS selector for the sub menu to be toggled.
      contentSelector: '.sub'
    }, options || {});
    $super(el, this.options);
  },
  /**
   *  Shodan.UI.Accordion.build()
   **/
  build: function() {
    var firstItem = this.el.down('li');
    this.el.select(this.options.contentSelector).each(function(el) {
      this.resetContentCSS(el);
    }, this);
    this.closeAll();
    this.revealContent(function() {
      firstItem.addClassName(this.options.openClass);
      // if one has been, set execute the callback function
      if (typeof this.options.callback === 'function') {
        this.options.callback();
      }
    }.bind(this), firstItem.down(this.options.contentSelector));
    this.el.on('click', this.options.toggleSelector, this.onClick.bind(this));
  },
  /**
   *  Shodan.UI.Accordion.closeAll()
   **/
  closeAll: function() {
    this.el.select(this.options.contentSelector).each(function(el) {
      this.hideContent(function() {
        el.previous(this.options.toggleSelector).removeClassName(this.options.openClass);
        // if one has been, set execute the callback function
        if (typeof this.options.callback === 'function') {
          this.options.callback();
        }
      }.bind(this), el);
    }.bind(this));
  },
  /**
   *  Shodan.UI.Accordion.onClick(event, el)
   *  - event (Event): native event instance
   *  - el (DOMElement): target DOM element
   **/
  onClick: function(e, el) {
    var content = $(el).next(this.options.contentSelector),
        clickedLi = el.up('li'), open;

    if (clickedLi.hasClassName(this.options.openClass)) {
      this.hideContent(function() {
        clickedLi.removeClassName(this.options.openClass);
        // if one has been, set execute the callback function
        if (typeof this.options.callback === 'function') {
          this.options.callback();
        }
      }.bind(this), clickedLi.down(this.options.contentSelector));
    } else {
      if ((open = this.el.down('.'+this.options.openClass)) && !this.options.allowMultiOpen) {
        this.hideContent(function() {
          open.removeClassName(this.options.openClass);
          // if one has been, set execute the callback function
          if (typeof this.options.callback === 'function') {
            this.options.callback();
          }
        }.bind(this), open.down(this.options.contentSelector));
      }
      this.revealContent(function() {
        content.up('li').addClassName(this.options.openClass);
        // if one has been, set execute the callback function
        if (typeof this.options.callback === 'function') {
          this.options.callback();
        }
      }.bind(this), content);
    }
  }
});