//region --- Requiring and Providing
goog.provide('anychart.core.ui.LegendItem');
goog.require('acgraph');
goog.require('acgraph.vector.Text.TextOverflow');
goog.require('anychart.core.Text');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');
//endregion



/**
 * Inner class for representing legend item.
 * @extends {anychart.core.Text}
 * @constructor
 */
anychart.core.ui.LegendItem = function() {
  anychart.core.ui.LegendItem.base(this, 'constructor');

  this.addThemes(anychart.themes.DefaultThemes['legendItem']);

  /**
   * LegendItem element.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.layer_ = acgraph.layer();

  /**
   * Legend icon text element.
   * @type {acgraph.vector.Text}
   * @private
   */
  this.textElement_ = this.layer_.text();
  this.textElement_.attr('aria-hidden', 'true');

  /**
   *
   * @type {?Element}
   * @private
   */
  this.predefinedEl_ = null;

  /**
   *
   * @type {goog.math.Rect}
   * @private
   */
  this.predefinedBounds_ = null;

  /**
   * Ratio value to apply font fade gradient.
   * If is NaN - no fade gradient is applied.
   * @type {number}
   * @private
   */
  this.applyFontGradient_ = NaN;

  /**
   * Object with default stroke for icon type that should always be with stroke.
   * @type {Object}
   * @private
   */
  this.nonNullableStrokes_ = {
    'line': 'black',
    'spline': 'black',
    'step-line': 'black',
    'ohlc': 'black',
    'candlestick': 'black',
    'hollowcandles': 'black'
  };

  /**
   * Icon types that should not have fill.
   * @type {Object}
   * @private
   */
  this.shouldBeNullFills_ = {
    'line': true,
    'spline': true,
    'step-line': true,
    'ohlc': true
  };

  /**
   * Appearance settings for disabled state
   * @type {Object}
   * @private
   */
  this.disabledState_ = {
    'iconStroke': '#999',
    'iconFill': '#999',
    'iconHatchFill': 'none',
    'iconMarkerStroke': '#999',
    'iconMarkerFill': '#999',
    'fontColor': '#999'
  };


  var dropPixelBoundsBeforeInvalidationHook = function() {
    this.dropPixelBounds();
  };

  var setRedrawIconBeforeInvalidationHook = function() {
    this.redrawIcon_ = true;
  };

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['text', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['x', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED, 0, dropPixelBoundsBeforeInvalidationHook],
    ['y', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED, 0, dropPixelBoundsBeforeInvalidationHook],
    ['iconType', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW, 0, setRedrawIconBeforeInvalidationHook],
    ['iconTextSpacing', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED, 0, dropPixelBoundsBeforeInvalidationHook],
    ['maxWidth', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED, 0, dropPixelBoundsBeforeInvalidationHook],
    ['maxHeight', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED, 0, dropPixelBoundsBeforeInvalidationHook],
    ['iconFill', anychart.ConsistencyState.APPEARANCE | anychart.Signal.NEEDS_REDRAW, 0, setRedrawIconBeforeInvalidationHook],
    ['iconStroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW, 0, setRedrawIconBeforeInvalidationHook],
    ['iconHatchFill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW, 0, setRedrawIconBeforeInvalidationHook]
  ]);

  this.applyDefaults();
};
goog.inherits(anychart.core.ui.LegendItem, anychart.core.Text);


/**
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.LegendItem.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  var iconTextSpacingNormalizer = function(val) {
    var normalized = anychart.core.settings.numberNormalizer(val); // iconTextSpacing needs numberNormalizer
    return goog.isNull(val) ? this.getThemeOption('iconTextSpacing') :
        (isNaN(normalized) ? this.getOption('iconTextSpacing') : normalized);
  };

  var iconTypeNormalizer = function(val) {
    if (goog.isString(val))
      return anychart.enums.normalizeLegendItemIconType(val);
    else
      return val;
  };

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'x', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'y', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'iconType', iconTypeNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'iconTextSpacing', iconTextSpacingNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'maxWidth', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'maxHeight', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'iconFill', anychart.core.settings.fillNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'iconStroke', anychart.core.settings.strokeNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'iconHatchFill', anychart.core.settings.hatchFillNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.core.ui.LegendItem, anychart.core.Text.TEXT_DESCRIPTORS);
anychart.core.settings.populate(anychart.core.ui.LegendItem, anychart.core.ui.LegendItem.PROPERTY_DESCRIPTORS);


//region --- Class definitions
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.ui.LegendItem.prototype.SUPPORTED_SIGNALS = anychart.core.Text.prototype.SUPPORTED_SIGNALS | // NEEDS_REDRAW BOUNDS_CHANGED
    anychart.Signal.NEEDS_REAPPLICATION;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.LegendItem.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Text.prototype.SUPPORTED_CONSISTENCY_STATES; //ENABLED CONTAINER Z_INDEX APPEARANCE BOUNDS

/**
 * Getter for supported signals.
 * @return {Object}
 */
anychart.core.ui.LegendItem.prototype.supported = function() {
  return {
    "sigs": [
      "NEEDS_REDRAW",
      "BOUNDS_CHANGED",
      "ENABLED_STATE_CHANGED",
      "Z_INDEX_STATE_CHANGED",
      "BOUNDS_CHANGED",
      "NEEDS_REAPPLICATION"
    ],
    "cs": [
      "ENABLED",
      "CONTAINER",
      "BOUNDS",
      "Z_INDEX",
      "APPEARANCE"
    ]
  };
};

/**
 * Returns this type.
 * @return {string}
 */
anychart.core.ui.LegendItem.prototype.getThisType = function() {
  return 'anychart.core.ui.LegendItem';
};


/**
 * Getter/setter for iconEnabled setting
 * @param {boolean=} opt_value Whether to show item icon or not.
 * @return {(boolean|anychart.core.ui.LegendItem)} iconEnabled setting or self for method chaining.
 */
anychart.core.ui.LegendItem.prototype.iconEnabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (this.iconEnabled_ != opt_value) {
      this.iconEnabled_ = opt_value;
      this.redrawIcon_ = true;
      this.dropPixelBounds();
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.iconEnabled_;
};


/**
 * Getter/setter for disabled setting.
 * @param {boolean=} opt_value Is this item disabled.
 * @return {(boolean|anychart.core.ui.LegendItem)} Disabled setting or self for chaining.
 */
anychart.core.ui.LegendItem.prototype.disabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.disabled_ != opt_value) {
      this.disabled_ = opt_value;
      this.redrawIcon_ = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE);
      this.draw();
    }
    return this;
  }
  return this.disabled_;
};


/**
 * Getter/setter for marker type.
 * @param {(null|string|anychart.enums.MarkerType|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path)=} opt_value .
 * @return {!anychart.core.ui.LegendItem|null|anychart.enums.MarkerType|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path|string} .
 */
anychart.core.ui.LegendItem.prototype.iconMarkerType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!goog.isFunction(opt_value))
      opt_value = goog.isNull(opt_value) ? null : anychart.enums.normalizeMarkerType(opt_value);
    if (this.iconMarkerType_ != opt_value) {
      this.iconMarkerType_ = opt_value;
      this.redrawIcon_ = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.iconMarkerType_;
};


/**
 * Getter/setter for icon marker fill setting.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.LegendItem} .
 */
anychart.core.ui.LegendItem.prototype.iconMarkerFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var color = acgraph.vector.normalizeFill.apply(null, arguments);
    if (this.iconMarkerFill_ != color) {
      this.iconMarkerFill_ = color;
      this.redrawIcon_ = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.iconMarkerFill_;
  }
};


/**
 * Getter/setter for icon marker stroke setting.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Stroke settings,
 *    if used as a setter.
 * @param {number=} opt_thickness Line thickness. If empty - set to 1.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 *    Dash array contains a list of comma and/or white space separated lengths and percentages that specify the
 *    lengths of alternating dashes and gaps. If an odd number of values is provided, then the list of values is
 *    repeated to yield an even number of values. Thus, stroke dashpattern: 5,3,2 is equivalent to dashpattern: 5,3,2,5,3,2.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {acgraph.vector.Stroke|anychart.core.ui.LegendItem} .
 */
anychart.core.ui.LegendItem.prototype.iconMarkerStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var color = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (this.iconMarkerStroke_ != color) {
      this.iconMarkerStroke_ = color;
      this.redrawIcon_ = true;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.iconMarkerStroke_;
  }
};


/**
 * Getter/setter for legend item source uid.
 * @param {number=} opt_value source uid.
 * @return {(number|anychart.core.ui.LegendItem)} Source uid or self for chaining.
 */
anychart.core.ui.LegendItem.prototype.sourceUid = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.sourceUid_ = anychart.utils.toNumber(opt_value);
    return this;
  }
  return this.sourceUid_;
};


/**
 * Getter/setter for legend item source key.
 * @param {*=} opt_value source key.
 * @return {(*|anychart.core.ui.LegendItem)} Source key or self for chaining.
 */
anychart.core.ui.LegendItem.prototype.sourceKey = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.sourceKey_ = opt_value;
    return this;
  }
  return this.sourceKey_;
};


/**
 * Getter/setter for legend item meta data.
 * @param {*=} opt_value Meta data.
 * @return {(*|anychart.core.ui.LegendItem)} Meta data or self for chaining.
 */
anychart.core.ui.LegendItem.prototype.meta = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.meta_ = opt_value;
    return this;
  }
  return this.meta_;
};


/**
 * Getter/Setter for hover cursor setting.
 * @param {anychart.enums.Cursor=} opt_value Hover cursor setting.
 * @return {(anychart.enums.Cursor|anychart.core.ui.LegendItem)} Hover cursor setting or self for chaining.
 */
anychart.core.ui.LegendItem.prototype.hoverCursor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hoverCursor_ = opt_value;
    return this;
  }
  return this.hoverCursor_;
};


/**
 * Getter/setter for icon size of legend item.
 * @param {(number|string)=} opt_value Icon size setting.
 * @return {(number|anychart.core.ui.LegendItem)} Icon size or self for method chaining.
 */
anychart.core.ui.LegendItem.prototype.iconSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value);
    if (this.iconSize_ != opt_value) {
      this.iconSize_ = /** @type {number} */ (opt_value);
      this.dropPixelBounds();
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.iconSize_;
};


//endregion
//region --- Drawing
/**
 * @inheritDoc
 */
anychart.core.ui.LegendItem.prototype.remove = function() {
  if (this.layer_) this.layer_.parent(null);
};


/**
 * Draws icon marker.
 * @param {acgraph.vector.Path} path Path of icon.
 * @param {number} size Size.
 * @private
 */
anychart.core.ui.LegendItem.prototype.drawIconMarker_ = function(path, size) {
  if (!this.marker_) {
    this.marker_ = path.parent().path();
  } else
    this.marker_.clear();
  if (this.iconMarkerType_) {
    this.applyMarkerFillAndStroke_(this.hovered_);
    var type = (/** @type {anychart.core.ui.LegendItem} */(this)).iconMarkerType_;
    var markerDrawer = goog.isString(type) ? anychart.utils.getMarkerDrawer(type) : type;
    markerDrawer.call(this, this.marker_, size / 2, size / 2, size / 6);
  }
};


/**
 * Method to get icon drawer
 * @param {(anychart.enums.LegendItemIconType|string)=} opt_iconType Type of an icon.
 * @return {function(this: anychart.core.ui.LegendItem, acgraph.vector.Path, number)} Drawer function.
 */
anychart.core.ui.LegendItem.prototype.getIconDrawer = function(opt_iconType) {
  var drawer, mDrawer;
  switch (opt_iconType) {
    case anychart.enums.LegendItemIconType.STEP_AREA:
      drawer = function(path, size) {
        path.moveTo(0, size * 0.6)
            .lineTo(size * 0.5, size * 0.6)
            .lineTo(size * 0.5, size * 0.1)
            .lineTo(size, size * 0.1)
            .lineTo(size, size)
            .lineTo(0, size)
            .lineTo(0, size * 0.6)
            .close();
      };
      break;

    case anychart.enums.LegendItemIconType.AREA:
      drawer = function(path, size) {
        path.moveTo(0, size * 0.7)
            .lineTo(size * 0.35, size * 0.3)
            .lineTo(size * 0.5, size * 0.5)
            .lineTo(size, 0)
            .lineTo(size, size)
            .lineTo(0, size)
            .lineTo(0, size * 0.7)
            .close();
      };
      break;

    case anychart.enums.LegendItemIconType.RANGE_STEP_AREA:
    case anychart.enums.LegendItemIconType.RANGE_SPLINE_AREA:
    case anychart.enums.LegendItemIconType.RANGE_AREA:
      drawer = function(path, size) {
        path.moveTo(0, size * 0.2)
            .lineTo(size * 0.5, size * 0.4)
            .lineTo(size, size * 0.2)
            .lineTo(size, size * 0.8)
            .lineTo(size * 0.5, size * 0.6)
            .lineTo(0, size * 0.8)
            .close();
      };
      break;

    case anychart.enums.LegendItemIconType.SPLINE_AREA:
      drawer = function(path, size) {
        var r = size / 2;
        path.moveTo(size, 0.6 * r)
            .lineTo(size, size)
            .lineTo(0, size)
            .lineTo(0, 1.3 * r)
            .circularArc(0, r, r, r * 0.3, 90, -90)
            .circularArc(size, r, r, r * 0.4, 180, 90)
            .moveTo(0, 0)
            .close();
      };
      break;

    case anychart.enums.LegendItemIconType.RANGE_BAR:
      drawer = function(path, size) {
        path.moveTo(size * 0.35, 0)
            .lineTo(size * 0.65, 0)
            .lineTo(size * 0.65, size * 0.15)
            .lineTo(size * 0.35, size * 0.15)
            .close()
            .moveTo(size * 0.1, size * 0.4)
            .lineTo(size * 0.9, size * 0.4)
            .lineTo(size * 0.9, size * 0.55)
            .lineTo(size * 0.1, size * 0.55)
            .close()
            .moveTo(size * 0.25, size * 0.8)
            .lineTo(size * 0.75, size * 0.8)
            .lineTo(size * 0.75, size * 0.95)
            .lineTo(size * 0.25, size * 0.95)
            .close();
      };
      break;
    case anychart.enums.LegendItemIconType.RANGE_COLUMN:
      drawer = function(path, size) {
        path.moveTo(0, size * 0.6)
            .lineTo(0, size * 0.4)
            .lineTo(size * 0.15, size * 0.4)
            .lineTo(size * 0.15, size * 0.6)
            .lineTo(0, size * 0.6)
            .close()
            .moveTo(size * 0.4, size * 0.9)
            .lineTo(size * 0.4, size * 0.1)
            .lineTo(size * 0.55, size * 0.1)
            .lineTo(size * 0.55, size * 0.9)
            .lineTo(size * 0.4, size * 0.9)
            .close()
            .moveTo(size * 0.8, size * 0.7)
            .lineTo(size * 0.8, size * 0.3)
            .lineTo(size * 0.95, size * 0.3)
            .lineTo(size * 0.95, size * 0.7)
            .lineTo(size * 0.8, size * 0.7)
            .close();
      };
      break;

    case anychart.enums.LegendItemIconType.BAR:
      drawer = function(path, size) {
        path.moveTo(0, 0)
            .lineTo(size * 0.6, 0)
            .lineTo(size * 0.6, size * 0.15)
            .lineTo(0, size * 0.15)
            .close()
            .moveTo(0, size * 0.4)
            .lineTo(size, size * 0.4)
            .lineTo(size, size * 0.55)
            .lineTo(0, size * 0.55)
            .close()
            .moveTo(0, size * 0.8)
            .lineTo(size * 0.8, size * 0.8)
            .lineTo(size * 0.8, size * 0.95)
            .lineTo(0, size * 0.95)
            .close();
      };
      break;
    case anychart.enums.LegendItemIconType.COLUMN:
      drawer = function(path, size) {
        path.moveTo(0, size)
            .lineTo(0, size * 0.4)
            .lineTo(size * 0.15, size * 0.4)
            .lineTo(size * 0.15, size)
            .close()
            .moveTo(size * 0.4, size)
            .lineTo(size * 0.4, 0)
            .lineTo(size * 0.55, 0)
            .lineTo(size * 0.55, size)
            .close()
            .moveTo(size * 0.8, size)
            .lineTo(size * 0.8, size * 0.2)
            .lineTo(size * 0.95, size * 0.2)
            .lineTo(size * 0.95, size)
            .close();
      };
      break;

    case anychart.enums.LegendItemIconType.STEP_LINE:
      drawer = function(path, size) {
        path.moveTo(0, size * 0.8)
            .lineTo(size * 0.5, size * 0.8)
            .lineTo(size * 0.5, size * 0.2)
            .lineTo(size, size * 0.2)
            .moveTo(0, 0)
            .close();

        this.drawIconMarker_(path, size);
      };
      break;

    case anychart.enums.LegendItemIconType.LINE:
      drawer = function(path, size) {
        path.moveTo(0, 0.5 * size)
            .lineTo(size, 0.5 * size)
            .close();

        this.drawIconMarker_(path, size);
      };
      break;

    case anychart.enums.LegendItemIconType.SPLINE:
      drawer = function(path, size) {
        var r = size / 2;
        path.circularArc(0, r, r, r * 0.8, 90, -90)
            .circularArc(size, r, r, r * 0.6, 180, 90)
            .moveTo(0, 0)
            .close();

        this.drawIconMarker_(path, size);
      };
      break;

    case anychart.enums.LegendItemIconType.BUBBLE:
    case anychart.enums.LegendItemIconType.CIRCLE:
      drawer = function(path, size) {
        var r = size / 2;
        path.circularArc(r, r, r, r, 0, 360)
            .close();
      };
      break;

    case anychart.enums.LegendItemIconType.CANDLESTICK:
      drawer = function(path, size) {
        path.moveTo(size * 0.5, 0)
            .lineTo(size * 0.5, size)
            .moveTo(0, size * 0.3)
            .lineTo(size, size * 0.3)
            .lineTo(size, size * 0.7)
            .lineTo(0, size * 0.7)
            .lineTo(0, size * 0.3)
            .close();
      };
      break;

      case anychart.enums.LegendItemIconType.HOLLOWCANDLES:
        drawer = function(path, size) {
          path.moveTo(size * 0.5, 0)
              .lineTo(size * 0.5, size)
              .moveTo(0, size * 0.3)
              .lineTo(size, size * 0.3)
              .lineTo(size, size * 0.7)
              .lineTo(0, size * 0.7)
              .lineTo(0, size * 0.3)
              .close();
        };
        break;

    case anychart.enums.LegendItemIconType.OHLC:
      drawer = function(path, size) {
        path.moveTo(0, size * 0.2)
            .lineTo(size * 0.5, size * 0.2)
            .moveTo(size * 0.5, 0)
            .lineTo(size * 0.5, size)
            .moveTo(size * 0.5, size * 0.8)
            .lineTo(size, size * 0.8)
            .close();
      };
      break;

    case anychart.enums.LegendItemIconType.TRIANGLE_UP:
    case anychart.enums.LegendItemIconType.TRIANGLE_DOWN:
    case anychart.enums.LegendItemIconType.TRIANGLE_RIGHT:
    case anychart.enums.LegendItemIconType.TRIANGLE_LEFT:
    case anychart.enums.LegendItemIconType.DIAMOND:
    case anychart.enums.LegendItemIconType.CROSS:
    case anychart.enums.LegendItemIconType.DIAGONAL_CROSS:
    case anychart.enums.LegendItemIconType.STAR4:
    case anychart.enums.LegendItemIconType.STAR5:
    case anychart.enums.LegendItemIconType.STAR6:
    case anychart.enums.LegendItemIconType.STAR7:
    case anychart.enums.LegendItemIconType.STAR10:
    case anychart.enums.LegendItemIconType.PENTAGON:
    case anychart.enums.LegendItemIconType.TRAPEZIUM:
    case anychart.enums.LegendItemIconType.ARROWHEAD:
    case anychart.enums.LegendItemIconType.V_LINE:
      opt_iconType = anychart.enums.normalizeMarkerType(opt_iconType);
      mDrawer = anychart.utils.getMarkerDrawer(opt_iconType);
      drawer = function(path, size) {
        return mDrawer(path, size / 2, size / 2, size / 2);
      };
      break;

    case anychart.enums.LegendItemIconType.SQUARE:
    default:
      //default drawer is a square
      drawer = function(path, size) {
        path.moveTo(0, 0)
            .lineTo(size, 0)
            .lineTo(size, size)
            .lineTo(0, size)
            .close();
      };
  }

  return drawer;
};


/**
 * Draws an icon.
 * @param {Function} drawer Icon drawer.
 * @private
 */
anychart.core.ui.LegendItem.prototype.drawIcon_ = function(drawer) {
  if (this.marker_)
    this.marker_.clear();
  if (this.iconEnabled_) {
    drawer.call(this, this.icon_.clear(), this.iconSize_);
    if (this.hatch_)
      drawer.call(this, this.hatch_.clear(), this.iconSize_);
  } else {
    this.icon_.clear();
    if (this.hatch_)
      this.hatch_.clear();
  }
};


/**
 * Draws legend item.
 * @return {anychart.core.ui.LegendItem} An instance of {@link anychart.core.ui.LegendItem} class for method chaining.
 */
anychart.core.ui.LegendItem.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  var isInitial;
  if (isInitial = !this.icon_) {
    /**
     * Legend icon path.
     * @type {acgraph.vector.Path}
     * @private
     */
    this.icon_ = this.layer_.path();
    this.icon_.setTransformationMatrix(1, 0, 0, 1, 0, 0);
  }

  if (!this.rectTheListener_) {
    this.rectTheListener_ = this.layer_
        .rect()
        .zIndex(5)
        .stroke(null)
        .fill('#FFFFFF 0.00001');
  }

  // if it is not changed - nothing will happen
  this.layer_.cursor(/** @type {acgraph.vector.Cursor} */(this.hoverCursor()));

  var needHatch = goog.isDef(this.getOption('iconHatchFill')) && (!anychart.utils.isNone(this.getOption('iconHatchFill')) && !this.hatch_);
  if (needHatch) {
    /**
     * Legend icon hatchFill path.
     * @type {acgraph.vector.Path}
     * @private
     */
    this.hatch_ = this.layer_.path();
    this.hatch_.setTransformationMatrix(1, 0, 0, 1, 0, 0);
    this.hatch_.stroke('none');
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */ (this.zIndex());
    this.layer_.zIndex(zIndex);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    this.layer_.parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }
  var iconType = /** @type {(string|function(acgraph.vector.Path, number))} */(this.getOption('iconType'));
  var drawer = goog.isString(iconType) ?
      this.getIconDrawer(iconType) :
      iconType;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.applyFontColor_(this.hovered_, isInitial);
    if (this.redrawIcon_ && !isInitial) {
      this.drawIcon_(drawer);
      this.redrawIcon_ = false;
    }
    this.applyFillAndStroke_(this.hovered_);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.getContentBounds();
    this.drawIcon_(drawer);
    this.rectTheListener_.setBounds(anychart.math.rect(0, 0, this.pixelBounds_.width, this.pixelBounds_.height));
    this.redrawIcon_ = false;

    var textLines = this.textElement_.getLines();
    var textY, horizontalAxis;
    var iconSize = /** @type {number} */(this.iconEnabled_ ? this.iconSize_ + this.getOption('iconTextSpacing') : 0);
    this.textElement_.x(iconSize);

    if (textLines.length > 1) {
      var strokeThickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(this.getOption('iconStroke')));
      var maxTextSegmentHeight = 0;
      var firstTextLine = textLines[0];
      for (var i = 0, len = firstTextLine.length; i < len; i++) {
        maxTextSegmentHeight = Math.max(maxTextSegmentHeight, firstTextLine[i].height);
      }

      horizontalAxis = Math.max(maxTextSegmentHeight, this.iconSize_ + strokeThickness) / 2;
      textY = horizontalAxis - maxTextSegmentHeight / 2;
    } else {
      horizontalAxis = this.pixelBounds_.height / 2;
      textY = horizontalAxis - this.predefinedBounds_.height / 2;
    }
    this.textElement_.y(textY);
    this.icon_.setTransformationMatrix(1, 0, 0, 1, 0, horizontalAxis - this.iconSize_ / 2);
    this.layer_.setTransformationMatrix(1, 0, 0, 1, this.pixelBounds_.left, this.pixelBounds_.top);

    this.applyFontColor_(this.hovered_, isInitial);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  return this;
};


//endregion
//region --- Aplying appearance
/**
 * Applies hover settings to item. Used by the Legend.
 * @param {boolean} hover Whether item is hovered.
 */
anychart.core.ui.LegendItem.prototype.applyHover = function(hover) {
  /**
   * If item is hovered.
   * @type {boolean}
   * @private
   */
  this.hovered_ = hover;
  this.applyFillAndStroke_(hover);
  this.applyMarkerFillAndStroke_(hover);
  this.applyFontColor_(hover);
};


/**
 * Applies color to font depends on hover and disable settings.
 * @param {boolean} hover Whether item is hovered.
 * @param {boolean=} opt_isInitial [false] Whether settings applied first time.
 * @private
 */
anychart.core.ui.LegendItem.prototype.applyFontColor_ = function(hover, opt_isInitial) {
  this.applyTextSettings(/** @type {!acgraph.vector.Text} */(this.textElement_), !!opt_isInitial);
  var colorOption = /** @type {(acgraph.vector.Fill|acgraph.vector.Stroke)} */ (this.getOption('fontColor'));
  var fontColor = this.disabled_ ? this.disabledState_['fontColor'] : hover ? anychart.color.lighten(colorOption) : colorOption;
  if (isNaN(this.applyFontGradient_)) {
    this.textElement_.color(fontColor);
    this.textElement_.fill(fontColor);
  } else {
    var fo = this.getOption('fontOpacity');
    fo = /** @type {number} */ (goog.isDef(fo) ? fo : 1);
    var grad = anychart.utils.getFadeGradient(this.applyFontGradient_, fo, fontColor);
    this.getTextElement().fill(grad);
  }
};


/**
 * Public implementation for external access.
 * @param {boolean=} opt_isInitial - Whether settings applied first time.
 */
anychart.core.ui.LegendItem.prototype.applyFontColor = function(opt_isInitial) {
  this.applyFontColor_(this.hovered_, opt_isInitial);
};


/**
 * Applies fill and stroke to icon.
 * @param {boolean} hover Whether item hovered.
 * @private
 */
anychart.core.ui.LegendItem.prototype.applyFillAndStroke_ = function(hover) {
  this.icon_.stroke(this.getIconStroke_(hover));
  this.icon_.fill(this.getIconFill_(hover));

  if (this.hatch_)
    this.hatch_.fill(this.getIconHatchFill_(hover));
};


/**
 * Applies fill and stroke to icon marker
 * @param {boolean} hover Whether item hovered.
 * @private
 */
anychart.core.ui.LegendItem.prototype.applyMarkerFillAndStroke_ = function(hover) {
  if (this.marker_) {
    this.marker_.fill(this.getMarkerFill_(hover));
    this.marker_.stroke(this.getMarkerStroke_(hover));
  }
};


//endregion
//region --- Bounds
/**
 * Return legend item content bounds.
 * @return {anychart.math.Rect} Content bounds.
 */
anychart.core.ui.LegendItem.prototype.getContentBounds = function() {
  if (!this.enabled())
    return new anychart.math.Rect(0, 0, 0, 0);
  if (!this.pixelBounds_)
    this.calculateBounds_();
  return this.pixelBounds_;
};


/**
 * Return legend item pixel bounds.
 * @return {anychart.math.Rect} Content bounds.
 */
anychart.core.ui.LegendItem.prototype.getPixelBounds = function() {
  if (!this.pixelBounds_)
    this.calculateBounds_();
  return this.pixelBounds_;
};


/**
 * Drop pixel bounds.
 */
anychart.core.ui.LegendItem.prototype.dropPixelBounds = function() {
  this.pixelBounds_ = null;
};


/** @inheritDoc */
anychart.core.ui.LegendItem.prototype.invalidateParentBounds = function() {
  this.dropPixelBounds();
  anychart.core.ui.LegendItem.base(this, 'invalidateParentBounds');
};


/**
 * Calculate bounds of legend item
 * @private
 * @return {anychart.math.Rect} pixelBounds of legend item.
 */
anychart.core.ui.LegendItem.prototype.calculateBounds_ = function() {
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());
  var parentWidth, parentHeight;
  var t = this.text();
  /** @type {anychart.math.Rect} */
  var textBounds = (goog.isNull(t) || (t.indexOf('\n') < 0)) && !this.getOption('useHtml') ? this.predefinedBounds_ : this.textElement_.getBounds();
  var width = textBounds.width;
  var height = textBounds.height;

  var strokeThickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(this.getOption('iconStroke')));
  var iconSize = this.iconSize_ + strokeThickness;

  if (parentBounds) {
    parentWidth = parentBounds.width;
    parentHeight = parentBounds.height;
  } else {
    parentWidth = parentHeight = undefined;
  }

  var legendItemMaxWidth = anychart.utils.normalizeSize(/** @type {number|string} */(this.getOption('maxWidth')), parentWidth);

  var x = parentWidth ? anychart.utils.normalizeSize(/** @type {number|string} */(this.getOption('x')), parentWidth) : 0;
  var y = parentHeight ? anychart.utils.normalizeSize(/** @type {number|string} */(this.getOption('y')), parentHeight) : 0;

  var enabledIconSize = (this.iconEnabled_ ? iconSize + this.getOption('iconTextSpacing') : 0);

  this.applyFontGradient_ = NaN;
  if (legendItemMaxWidth) {
    var widthWithoutIcon = legendItemMaxWidth - enabledIconSize;
    if (width && width > widthWithoutIcon && this.textElement_.textOverflow() == acgraph.vector.Text.TextOverflow.ELLIPSIS) {
      this.applyFontGradient_ = widthWithoutIcon / width;
    } else {
      this.textElement_.width(widthWithoutIcon);
      textBounds = this.textElement_.getBounds();
    }
    width = legendItemMaxWidth;
  } else {
    var overflowWidth = parentWidth ? Math.min(parentWidth - enabledIconSize, width) : width;
    overflowWidth = Math.max(overflowWidth, 0.00001);

    if (this.textElement_.textOverflow() == acgraph.vector.Text.TextOverflow.ELLIPSIS) {
      if (width && width > overflowWidth)
        this.applyFontGradient_ = overflowWidth / width;
    }

    width = overflowWidth + enabledIconSize;
  }


  var textLines = this.textElement_.getLines();
  if (textLines.length > 1) {
    var maxTextSegmentHeight = 0;
    var firstTextLine = textLines[0];
    for (var i = 0, len = firstTextLine.length; i < len; i++) {
      maxTextSegmentHeight = Math.max(maxTextSegmentHeight, firstTextLine[i].height);
    }

    var h2 = textBounds.height - maxTextSegmentHeight / 2;
    height = Math.max(maxTextSegmentHeight / 2, this.iconSize_ / 2) + Math.max(h2, this.iconSize_ / 2);
  } else {
    height = Math.max((this.iconEnabled_ ? iconSize : 0), height);
  }

  if (parentBounds) {
    this.pixelBounds_ = new anychart.math.Rect(
        parentBounds.getLeft() + x,
        parentBounds.getTop() + y,
        width, height);
  } else {
    this.pixelBounds_ = new anychart.math.Rect(x, y, width, height);
  }

  return this.pixelBounds_;
};


/**
 * Calculating actual width of legend item independently of enabled state.
 * @return {number} Width.
 */
anychart.core.ui.LegendItem.prototype.getWidth = function() {
  return this.getPixelBounds().width;
};


/**
 * Calculating actual height of legend item independently of enabled state.
 * @return {number} Height.
 */
anychart.core.ui.LegendItem.prototype.getHeight = function() {
  return this.getPixelBounds().height;
};


//endregion
//region --- Utilities
/**
 * Applying defaults.
 */
anychart.core.ui.LegendItem.prototype.applyDefaults = function() {
  /**
   * Legend item x coordinate.
   * @type {(number|string)}
   * @private
   */
  this.x_ = 0;

  /**
   * Legend item y cordinate.
   * @type {(number|string)}
   * @private
   */
  this.y_ = 0;

  /**
   * Whether icon enabled or not.
   * @type {boolean}
   * @private
   */
  this.iconEnabled_ = true;

  /**
   * Shows whether legend item in disabled state.
   * @type {boolean}
   * @private
   */
  this.disabled_ = false;

  this['iconType'](anychart.enums.LegendItemIconType.SQUARE);

  this['iconFill']('black');
  this['iconStroke']('none');
  this['iconHatchFill'](null);

  /**
   * Legend item icon marker type
   * @type {?(string|anychart.enums.MarkerType|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path)}
   * @private
   */
  this.iconMarkerType_ = null;

  /**
   * Legend item icon marker fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.iconMarkerFill_ = 'none';

  /**
   * Legend item icon marker stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.iconMarkerStroke_ = 'none';

  this['iconTextSpacing'](5);

};


/**
 * Clearing item.
 * @return {anychart.core.ui.LegendItem} .
 */
anychart.core.ui.LegendItem.prototype.clear = function() {
  this.suspendSignalsDispatching();
  this.dropPixelBounds();
  this.ownSettings = {};
  this.applyDefaults();
  this.resolutionChainCache(null);
  this.prevSourceKey = this.sourceKey();
  this.prevSourceUid = this.sourceUid();
  this.sourceUid(NaN);
  this.sourceKey(NaN);
  this.meta(null);
  this.setOption('maxWidth', null);
  this.setOption('maxHeight', null);
  this.remove();
  this.invalidate(anychart.ConsistencyState.ALL);
  this.resumeSignalsDispatching(false);

  return this;
};


/**
 * Gets final stroke for icon.
 * @param {boolean} hover Whether item hovered.
 * @return {acgraph.vector.Stroke}
 * @private
 */
anychart.core.ui.LegendItem.prototype.getIconStroke_ = function(hover) {
  if (this.disabled_)
    return this.disabledState_['iconStroke'];
  else {
    var iconType = this.getOption('iconType');
    if (anychart.utils.isNone(this.getOption('iconStroke')) && (iconType in this.nonNullableStrokes_))
      return this.nonNullableStrokes_[iconType];
    return /** @type {acgraph.vector.Stroke} */ (hover ? anychart.color.lighten(/** @type {acgraph.vector.Stroke} */(this.getOption('iconStroke'))) : this.getOption('iconStroke'));
  }
};


/**
 * Gets final fill for icon.
 * @param {boolean} hover Whether item hovered.
 * @return {?acgraph.vector.Fill}
 * @private
 */
anychart.core.ui.LegendItem.prototype.getIconFill_ = function(hover) {
  if (this.getOption('iconType') in this.shouldBeNullFills_)
    return null;
  else if (this.disabled_)
    return this.disabledState_['iconFill'];
  else
    return /** @type {acgraph.vector.Fill} */(hover ? anychart.color.lighten(/** @type {acgraph.vector.Fill} */(this.getOption('iconFill'))) : this.getOption('iconFill'));
};


/**
 * Gets final hatch fill for icon.
 * @param {boolean} hover Whether item hovered.
 * @return {?(acgraph.vector.PatternFill|string)}
 * @private
 */
anychart.core.ui.LegendItem.prototype.getIconHatchFill_ = function(hover) {
  if (this.disabled_)
    return this.disabledState_['iconHatchFill'];
  else
    return /** @type {acgraph.vector.PatternFill} */(this.getOption('iconHatchFill'));
};


/**
 * Gets final stroke for icon marker.
 * @param {boolean} hover Whether item hovered.
 * @return {!acgraph.vector.Stroke}
 * @private
 */
anychart.core.ui.LegendItem.prototype.getMarkerStroke_ = function(hover) {
  if (this.disabled_)
    return this.disabledState_['iconMarkerStroke'];
  else
    return /** @type {acgraph.vector.Stroke} */ (hover ? anychart.color.lighten(this.iconMarkerStroke_) : this.iconMarkerStroke_);
};


/**
 * Gets final fill for icon marker.
 * @param {boolean} hover Whether item hovered.
 * @return {!acgraph.vector.Fill}
 * @private
 */
anychart.core.ui.LegendItem.prototype.getMarkerFill_ = function(hover) {
  if (this.disabled_)
    return this.disabledState_['iconMarkerFill'];
  else {
    return (hover ? anychart.color.lighten(this.iconMarkerFill_) : this.iconMarkerFill_);
  }
};


/**
 * Legend item text element.
 * @return {!acgraph.vector.Text} Text element.
 */
anychart.core.ui.LegendItem.prototype.getTextElement = function() {
  return /** @type {!acgraph.vector.Text} */(this.textElement_);
};


/**
 * Sets item index to root layer tag.
 * @param {number} index
 */
anychart.core.ui.LegendItem.prototype.setItemIndexToLayer = function(index) {
  this.layer_.tag = {index: index};
};


/**
 *
 * @param {Element=} opt_value
 * @return {anychart.core.ui.LegendItem|Element|null}
 */
anychart.core.ui.LegendItem.prototype.predefinedElement = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.predefinedEl_ = opt_value;
    return this;
  }
  return this.predefinedEl_;
};


/**
 *
 * @param {goog.math.Rect=} opt_value - .
 * @return {goog.math.Rect|anychart.core.ui.LegendItem}
 */
anychart.core.ui.LegendItem.prototype.predefinedBounds = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.predefinedBounds_ = opt_value;
    return this;
  }
  return this.predefinedBounds_;
};


//endregion
//region --- Setup and Dispose
/** @inheritDoc */
anychart.core.ui.LegendItem.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.LegendItem.base(this, 'setupByJSON', config, opt_default);

  anychart.core.settings.deserialize(this, anychart.core.ui.LegendItem.PROPERTY_DESCRIPTORS, config, opt_default);
  anychart.core.settings.deserialize(this, anychart.core.Text.TEXT_DESCRIPTORS, config, opt_default);
  this.iconEnabled(config['iconEnabled']);
  this.iconMarkerType(config['iconMarkerType']);
  this.iconMarkerFill(config['iconMarkerFill']);
  this.iconMarkerStroke(config['iconMarkerStroke']);
  this.disabled(config['disabled']);
  this.sourceUid(config['sourceUid']);
  this.sourceKey(config['sourceKey']);
  this.meta(config['meta']);
  this.hoverCursor(config['hoverCursor']);
  this.iconSize(config['iconSize']);
};


/** @inheritDoc */
anychart.core.ui.LegendItem.prototype.disposeInternal = function() {
  anychart.core.ui.LegendItem.base(this, 'disposeInternal');

  this.predefinedEl_ = null;

  goog.disposeAll(
      this.layer_,
      this.textElement_,
      this.marker_,
      this.icon_,
      this.rectTheListener_,
      this.hatch_);

  this.layer_ = null;
  this.textElement_ = null;
  this.marker_ = null;
  this.icon_ = null;
  this.rectTheListener_ = null;
  this.hatch_ = null;
};


//endregion
//region --- Exports
//exports
(function() {
  // Used only in a standalone
  var proto = anychart.core.ui.LegendItem.prototype;
  proto['ul_type'] = proto.getThisType;//jb
  // auto generated
  proto['ul_x'] = proto.x;//jb
  proto['ul_y'] = proto.y;//jb
  //proto['ul_iconType'] = proto.iconType;
  //proto['ul_iconTextSpacing'] = proto.iconTextSpacing;
  //proto['ul_maxWidth'] = proto.maxWidth;
  proto['ul_maxHeight'] = proto.maxHeight;//jb
  //proto['ul_iconFill'] = proto.iconFill;
  //proto['ul_iconStroke'] = proto.iconStroke;
  //proto['ul_iconHatchFill'] = proto.iconHatchFill;
  proto['getTextElement'] = proto.getTextElement;
  proto['getContentBounds'] = proto.getContentBounds;
  proto['getWidth'] = proto.getWidth;
  proto['getHeight'] = proto.getHeight;
  proto['draw'] = proto.draw;
  // auto from anychart.core.Text
  proto['ul_text'] = proto.text;//jb
  //proto['ul_supported'] = proto.supported;//jb
})();
//endregion
