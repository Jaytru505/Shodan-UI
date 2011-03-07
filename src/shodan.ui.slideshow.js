/** section: Shodan UI
 *  class Shodan.UI.Slideshow < Shodan.UI.Base
 *
 *  A simple image slideshow
 **/
Shodan.UI.Slideshow = Class.create(Shodan.UI.Base, {
  initialize: function($super, el, options) {
    this.options = Object.extend({
      // delay (Integer)
      // Thye delay between slide transitions
      delay: 3,

      // displayTitle (Bool)
      // Set to false to hide the slide title
      displayTitle: true,

      // height (Integer)
      // The height of the slideshow
      height: 350,

      // slideSelector (String)
      // CSS selector for the slides
      slideSelector: '.sh-ui-slideshow-slide',

      // transitionDuration (Int)
      // The duration of the transition effect
      transitionDuration: 0.5,

      // width (Integer)
      // The width of the slideshow
      width: 500
    }, options || {});
    $super(el, this.options);
    this.index = 0;
    this.slides = [];
    this.build();
    this.play();
  },
  build: function() {
    this.el.setStyle({
      height: this.options.height+'px',
      overflow: 'hidden',
      position: 'relative',
      width: this.options.width+'px'
    });

    if (this.options.displayTitle) {
      this.slideTitle = new Element('div').addClassName('sh-ui-slideshow-title');
      this.el.insert(this.slideTitle);
    }
    this.el.select(this.options.slideSelector).each(function(el, idx) {
      el.writeAttribute('id', 'sh-ui-slide-'+idx);
      el.setStyle({
        display: 'block',
        height: '100%',
        left: 0,
        position: 'absolute',
        top: 0,
        width: '100%'
      });
      this.slides.push(el);
    }, this);
    // bring the first slide to the top of the stack
    this.slides[0].setStyle({zIndex: 10});
    if (this.options.displayTitle) {
      this.slideTitle.update(this.slides[0].readAttribute('alt'));
    }
    this.size = this.slides.length;
  },
  next: function(){
    if (this.index === this.size-1) {
      this.transition(0, function() { this.index = 0; }.bind(this));
    } else {
      this.transition(this.index+1, function() { this.index++; }.bind(this));
    }
  },
  pause: function(){
    this.p.stop();
  },
  play: function() {
    this.p = new PeriodicalExecuter(this.next.bind(this), this.options.delay);
  },
  previous : function() {
    if (this.index === 0) {
      this.transition(this.size-1, function() { this.index = this.size-1; }.bind(this));
    } else {
      this.transition(this.index-1, function() { this.index--; }.bind(this));
    }
  },
  transition: function(idx, after) {
    if (idx != this.index) {
      var currentSlide = this.slides[this.index],
          nextSlide = this.slides[idx];

      if (this.slideAnimating) {
        this.slideFx.cancel();
      }

      if (this.options.displayTitle) {
        this.updateTitle(this.slides[idx].readAttribute('alt'));
      }

      this.slideFx = new S2.FX.Morph(nextSlide, {
        after: function() {
          this.slideAnimating = false;
          if (typeof after === 'function') {
            after();
          }
        }.bind(this),
        before: function() {
          currentSlide.setStyle({ zIndex: 10 });
          nextSlide.
            setStyle({ zIndex: 20 }).
            setOpacity(0);
          this.slideAnimating = true;
        }.bind(this),
        duration: this.options.transitionDuration,
        engine: "javascript",
        style: "opacity: 1"
      }).play();
    }
  },
  updateTitle: function(text) {
    this.slideTitle.morph('opacity: 0', {
      after: function() {
        this.slideTitle.morph('opacity: 1', {
          before: function() {
            this.slideTitle.
              setOpacity(0).
              update(text);
          }.bind(this),
          duration: (this.options.transitionDuration / 2)
        });
      }.bind(this),
      duration: (this.options.transitionDuration / 2)
    });
  }
});