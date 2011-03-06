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
  animate: function(content, _style, after) {
    this.animation = new S2.FX.Morph(content, {
      after: function() {
        this.animating = false;
        if (typeof after === 'function') {
          after();
        }
      }.bind(this),
      before: function() {
        this.animating = true;
      }.bind(this),
      style: _style,
      duration: this.options.duration,
      transition: this.options.transition
    }).play();
  },
  /**
   *  Shodan.UI.SlideyPanel.build()
   **/
  build: function() {
    var content = this.el.down(this.options.contentSelector);

    // Curried functions. Use these two with the pre baked arguments
    this._hide = this.hideContent.curry(content, function() {
      this.el.removeClassName(this.options.openClass);
      // if one has been, set execute the callback function
      if (typeof this.options.callback === 'function') {
        this.options.callback();
      }
    }.bind(this));
    this._reveal = this.revealContent.curry(content, function() {
      this.el.addClassName(this.options.openClass);
      // if one has been, set execute the callback function
      if (typeof this.options.callback === 'function') {
        this.options.callback();
      }
    }.bind(this));

    // santitize the CSS of the content element
    this.resetContentCSS(content);

    // if autohide is set, auto... hide...
    if (this.options.autoHide) {
      this._hide();
    }
    this.el.on('click', this.options.toggleSelector, this.onClick.bind(this));
  },
  /**
   *  Shodan.UI.SlideyPanel.hideContent(after, content)
   *  - after (Function): Callback function to run after hiding the content
   *  - content (DOMElement): target DOM element
   **/
  hideContent: function(content, after) {
    // grab the height of the content and store it on the
    // element for later. We do this every time on the off
    // chance that the content height might change.
    var h = content.measure('margin-box-height');
    content.store('openHeight', h);
    this.animate(content, 'height: 0', after);
  },
  /**
   *  Shodan.UI.SlideyPanel.onClick(event, el)
   *  - event (Event): native event instance
   *  - el (DOMElement): target DOM element
   **/
  onClick: function(e, el) {
    e.stop();
    (this.el.hasClassName(this.options.openClass)) ? this._hide() : this._reveal();
  },
  /**
   *  Shodan.UI.SlideyPanel.resetContentCSS(content)
   *  - content (DOMElement): target DOM element
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
    content.store('openHeight', content.measure('margin-box-height'));
  },
  /**
   *  Shodan.UI.SlideyPanel.revealContent(after, content)
   *  - after (Function): Callback function to run after hiding the content
   *  - content (DOMElement): target DOM element
   **/
  revealContent: function(content, after) {
    // grab the content height from the elements data store
    var h = content.retrieve('openHeight');
    this.animate(content, 'height: '+h+'px', after);
  }
});