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
      toggleSelector: 'h3',

      // transition (String)
      // Scripty2 animation transition preset.
      // See http://scripty2.com/doc/scripty2%20fx/s2/fx/transitions.html
      transition: 'sinusoidal'
    }, options || {});
    $super(el, this.options);
    this.content = this.el.down(this.options.contentSelector);
    this.build();
  },
  /**
   *  Shodan.UI.SlideyPanel.build()
   **/
  build: function() {
    // sanitize the CSS on the content container
    this.content.setStyle({
      border: 'none',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    });
    // if autohide is set, auto... hide... um
    if (this.options.autoHide) {
      this.hideContent();
    }
    this.el.on('click', this.options.toggleSelector, this.onClick.bind(this));
  },
  /**
   *  Shodan.UI.SlideyPanel.revealContent()
   **/
  revealContent: function() {
    // grab the content height from the elements data store
    var h = this.content.retrieve('openHeight');
    this.content.morph('height:'+h+'px', {
      after: function() {
        this.el.addClassName(this.options.openClass);
        // if one has been, set execute the callback function
        if (typeof this.options.callback === 'function') {
          this.options.callback();
        }
      }.bind(this),
      duration: this.options.duration,
      transition: this.options.transition
    });
  },
  /**
   *  Shodan.UI.SlideyPanel.hideContent()
   **/
  hideContent: function() {
    // grab the height of the content and store it on the
    // element for later. We do this every time on the off
    // chance that the content height might change.
    var h = this.content.measure('margin-box-height');
    this.content.store('openHeight', h);
    this.content.morph('height:0', {
      after: function() {
        this.el.removeClassName(this.options.openClass);
        // if one has been, set execute the callback function
        if (typeof this.options.callback === 'function') {
          this.options.callback();
        }
      }.bind(this),
      duration: this.options.duration,
      transition: this.options.transition
    });
  },
  /**
   *  Shodan.UI.SlideyPanel.onClick(event)
   *  - event (Event): native event instance
   **/
  onClick: function(e) {
    e.stop();
    (this.el.hasClassName(this.options.openClass)) ? this.hideContent() : this.revealContent();
  }
});


/** section: Shodan UI
 *  class Shodan.UI.Accordion < Shodan.UI.SlideyPanel
 *
 *  An extension of the slidey panel.
 **/
Shodan.UI.Accordion = Class.create(Shodan.UI.SlideyPanel, {
  initialize: function($super, el, options) {
    this.options = Object.extend({

    }, options || {});
    $super(el, this.options);
  },
  build: function() {
    this.closeAll();
    this.slideDown(this.el.down(this.options.toggleSelector));
    this.el.on('click', this.options.toggleSelector, this.onClick.bind(this));
  },
  closeAll: function() {
    this.el.select(this.options.triggerSelector).each(function(el) {
      this.slideUp(el);
    }.bind(this));
  },
  onClick: function(e, el) {
    if ($(el).next('.'+this.options.contentClass).hasClassName(this.options.openClass)) {
      this.slideUp(el);
    } else {
      this.slideUp(this.el.down('.'+this.options.openClass));
      this.slideDown(el);
    }
  }
});