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
      contentSelector: '.sub',

      // initialOpenItem (String|bool)
      // Determines if the accordion starts with an item initially open. Use
      // 'first' to have the first item open or a CSS selector to select the
      // initially open item.
      initialOpenItem: false
    }, options || {});
    $super(el, this.options);
  },
  /**
   *  Shodan.UI.Accordion.build()
   **/
  build: function() {
    // when the component is initialised, add the click handler
    this.el.observe('component:ready', function() {
      this.el.on('click', this.options.toggleSelector, this.onClick.bind(this));
    }.bind(this));

    this.callback = function() {
      if (typeof this.options.callback === 'function') {
        this.options.callback();
      }
    }.bind(this);

    this.el.select('ul.root>li>'+this.options.contentSelector).each(function(el) {
      this.resetContentCSS(el);
      el.setStyle('height: 0');
    }, this);

    if (this.options.initialOpenItem) {
      var initialItem, cb;

      if (this.options.initialOpenItem === 'first') {
        initialItem = this.el.down('li');
      } else {
        initialItem = this.el.down(this.options.initialOpenItem);
      }

      cb = function() {
        initialItem.addClassName(this.options.openClass);
        this.callback();
        this.el.fire('component:ready');
      }.bind(this);

      this.revealContent(initialItem.down(this.options.contentSelector), cb);
    } else {
      this.el.fire('component:ready');
    }
  },
  /**
   *  Shodan.UI.Accordion.onClick(event, el)
   *  - event (Event): native event instance
   *  - el (DOMElement): target DOM element
   **/
  onClick: function(e, el) {
    if (!this.animating) {

      var content = $(el).next(this.options.contentSelector),
          clickedLi = el.up('li'),
          open;

      if (clickedLi.hasClassName(this.options.openClass)) {

        // user toggles an open item
        this.hideContent(clickedLi.down(this.options.contentSelector), function() {
          clickedLi.removeClassName(this.options.openClass);
          this.callback();
        }.bind(this));

      } else {

        // user toggles a closed item. Are we allowing multiple open items?
        // If not, close the current open item
        if ((open = this.el.down('.'+this.options.openClass)) && !this.options.allowMultiOpen) {
          this.hideContent(open.down(this.options.contentSelector), function() {
            open.removeClassName(this.options.openClass);
            this.callback();
          }.bind(this));
        }

        // Now open the item the user clicked on
        this.revealContent(content, function() {
          content.up('li').addClassName(this.options.openClass);
          this.callback();
        }.bind(this));

      }
    }
  }
});