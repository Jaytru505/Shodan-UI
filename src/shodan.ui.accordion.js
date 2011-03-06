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

    this.callback = function() {
      if (typeof this.options.callback === 'function') {
        this.options.callback();
      }
    }.bind(this);

    this.el.select('ul.root>li>'+this.options.contentSelector).each(function(el) {
      this.resetContentCSS(el);
      this.hideContent(el, this.callback);
    }, this);

    this.revealContent(firstItem.down(this.options.contentSelector), function() {
      firstItem.addClassName(this.options.openClass);
      this.callback();
    }.bind(this));

    this.el.on('click', this.options.toggleSelector, this.onClick.bind(this));
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