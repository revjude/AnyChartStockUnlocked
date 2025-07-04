goog.provide('anychart.core.axisMarkers.PathBase');
goog.require('acgraph');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.reporting');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.enums');



/**
 * Markers base.
 * @constructor
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.IStandaloneBackend}
 */
anychart.core.axisMarkers.PathBase = function() {
  anychart.core.axisMarkers.PathBase.base(this, 'constructor');

  /**
   * Current value.
   * @type {*}
   * @protected
   */
  this.val;

  /**
   * Current scale.
   * @type {anychart.scales.Base|anychart.scales.GanttDateTime}
   * @private
   */
  this.scale_;

  /**
   * Auto scale.
   * @type {anychart.scales.Base|anychart.scales.GanttDateTime}
   * @private
   */
  this.autoScale_ = null;

  /**
   * Assigned axis.
   * @type {anychart.core.Axis|anychart.stockModule.Axis}
   * @private
   */
  this.axis_ = null;

  /**
   * Parent chart instance.
   * @type {anychart.core.SeparateChart|anychart.stockModule.Plot}
   * @private
   */
  this.chart_ = null;

  /**
   * Marker element.
   * @type {acgraph.vector.Path} - Marker line element.
   * @private
   */
  this.markerElement_;

  /**
   * Flag to allow drawing with any ratio.
   * @type {boolean}
   * @private
   */
  this.drawAtAnyRatio_ = false;

  this.bindHandlersToComponent(this);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['scaleRangeMode', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_RECALCULATION]
  ]);
};
goog.inherits(anychart.core.axisMarkers.PathBase, anychart.core.VisualBase);


/**
 * @typedef {{
 *  from: (anychart.enums.GanttDateTimeMarkers|number),
 *  to: (anychart.enums.GanttDateTimeMarkers|number)
 * }}
 */
anychart.core.axisMarkers.PathBase.Range;


//----------------------------------------------------------------------------------------------------------------------
// Events
//----------------------------------------------------------------------------------------------------------------------
/**
 * @param {anychart.core.MouseEvent} event
 */
anychart.core.axisMarkers.PathBase.prototype.handleMouseEvent = function(event) {
  var evt = this.createAxisMarkerEvent_(event);
  if (evt)
    this.dispatchEvent(evt);
};


/**
 * @param {anychart.core.MouseEvent} event
 * @return {Object}
 * @private
 */
anychart.core.axisMarkers.PathBase.prototype.createAxisMarkerEvent_ = function(event) {
  var type = event['type'];
  switch (type) {
    case acgraph.events.EventType.MOUSEOUT:
      type = anychart.enums.EventType.AXIS_MARKER_OUT;
      break;
    case acgraph.events.EventType.MOUSEOVER:
      type = anychart.enums.EventType.AXIS_MARKER_OVER;
      break;
    case acgraph.events.EventType.MOUSEMOVE:
      type = anychart.enums.EventType.AXIS_MARKER_MOVE;
      break;
    default:
      return null;
  }
  return {
    'type': type,
    'target': this,
    'originalEvent': event,
    'rawValue': this.valueInternal(),
    'formattedValue': this.getFormattedValue(),
    'offsetX': event.offsetX,
    'offsetY': event.offsetY
  };
};


/**
 * Retruns formatted value to use with createAxisMarkerEvent_
 * @return {string}
 * @protected
 */
anychart.core.axisMarkers.PathBase.prototype.getFormattedValue = function() {
  return 'Value: ' + this.valueInternal();
};


//----------------------------------------------------------------------------------------------------------------------
//  States and signals.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.axisMarkers.PathBase.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.NEEDS_RECALCULATION;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.axisMarkers.PathBase.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.BOUNDS |
    anychart.ConsistencyState.APPEARANCE;

/**
 * Getter for supported signals.
 * @return {Object}
 */
anychart.core.axisMarkers.PathBase.prototype.supported = function() {
  return {
    "sigs": [
      "NEEDS_REDRAW",
      "BOUNDS_CHANGED",
      "ENABLED_STATE_CHANGED",
      "Z_INDEX_STATE_CHANGED",
      "NEEDS_RECALCULATION"
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
anychart.core.axisMarkers.PathBase.prototype.getThisType = function() {
  return 'anychart.core.axisMarkers.PathBase';
};


/**
 * Sets the chart axisMarkers belongs to.
 * @param {(anychart.core.SeparateChart|anychart.stockModule.Plot)} chart - Chart or plot instance.
 */
anychart.core.axisMarkers.PathBase.prototype.setChart = function(chart) {
  this.chart_ = chart;
};


/**
 * Get the chart axisMarkers belongs to.
 * @return {(anychart.core.SeparateChart|anychart.stockModule.Plot)}
 */
anychart.core.axisMarkers.PathBase.prototype.getChart = function() {
  return this.chart_;
};


//----------------------------------------------------------------------------------------------------------------------
//  Layout.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Get/set line marker layout.
 * @param {anychart.enums.Layout=} opt_value - Layout.
 * @return {anychart.enums.Layout|anychart.core.axisMarkers.PathBase} - Layout or this.
 */
anychart.core.axisMarkers.PathBase.prototype.layout = goog.abstractMethod;


/**
 * Getter/setter for auto scale.
 * Works with instances of anychart.scales.Base only.
 * @param {(anychart.scales.Base|anychart.scales.GanttDateTime|Object|anychart.enums.ScaleTypes)=} opt_value - Scale.
 * @return {anychart.scales.Base|anychart.scales.GanttDateTime|!anychart.core.axisMarkers.PathBase} - Axis scale or
 * itself for method chaining.
 */
anychart.core.axisMarkers.PathBase.prototype.autoScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var scType = opt_value && goog.isFunction(opt_value.getType) && opt_value.getType();
    var ganttScale = scType == anychart.enums.ScaleTypes.GANTT;
    var val = ganttScale ?
        (opt_value == this.autoScale_ ? null : opt_value) :
        anychart.scales.Base.setupScale(/** @type {anychart.scales.Base} */(this.autoScale_), opt_value, null, anychart.scales.Base.ScaleTypes.ALL_DEFAULT, null, this.scaleInvalidated, this);
    if (val) {
      var dispatch = this.autoScale_ == val;
      this.autoScale_ = /** @type {anychart.scales.Base|anychart.scales.GanttDateTime} */(val);
      var scaleIsSet = this.scale_ || (this.axis_ && /** @type {?anychart.scales.Base} */ (this.axis_.scale()));
      if (scaleIsSet) {
        val.resumeSignalsDispatching(false);
      } else if (!ganttScale)
        val.resumeSignalsDispatching(dispatch);
      if (!dispatch && !scaleIsSet)
        this.invalidate(anychart.ConsistencyState.BOUNDS,
            anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  } else {
    return this.autoScale_;
  }
};


/**
 * Getter/setter for default scale.
 * Works with instances of anychart.scales.Base only.
 * @param {(anychart.scales.Base|anychart.scales.GanttDateTime|Object|anychart.enums.ScaleTypes)=} opt_value - Scale.
 * @return {anychart.scales.Base|anychart.scales.GanttDateTime|!anychart.core.axisMarkers.PathBase} - Axis scale or
 *  itself for method chaining.
 */
anychart.core.axisMarkers.PathBase.prototype.scaleInternal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var scType = opt_value && goog.isFunction(opt_value.getType) && opt_value.getType();
    var ganttScale = scType == anychart.enums.ScaleTypes.GANTT;
    var val = ganttScale ?
        (opt_value == this.scale_ ? null : opt_value) :
        anychart.scales.Base.setupScale(/** @type {anychart.scales.Base} */(this.scale_), opt_value, null, anychart.scales.Base.ScaleTypes.ALL_DEFAULT, null, this.scaleInvalidated, this);
    if (val || (goog.isNull(opt_value) && this.scale_)) {
      var dispatch = this.scale_ == val;
      var listenForGantt = (ganttScale && !this.scale_);
      if (!val)
        this.scale_.unlistenSignals(this.scaleInvalidated, this);
      this.scale_ = /** @type {anychart.scales.GanttDateTime|anychart.scales.Base} */(val);
      if (listenForGantt)
        this.scale_.listenSignals(this.scaleInvalidated, this);
      if (val && !ganttScale)
        val.resumeSignalsDispatching(dispatch);
      if (!dispatch)
        this.invalidate(anychart.ConsistencyState.BOUNDS,
            anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  } else {
    return this.scale_ || (this.axis_ && /** @type {?anychart.scales.Base} */ (this.axis_.scale())) || this.autoScale_;
  }
};


/**
 * Whether scale is set for marker.
 * @return {boolean}
 */
anychart.core.axisMarkers.PathBase.prototype.isScaleSet = function() {
  return !!this.scale_;
};


/**
 * Scale invalidation handler.
 * @param {anychart.SignalEvent} event - Event object.
 * @protected
 */
anychart.core.axisMarkers.PathBase.prototype.scaleInvalidated = function(event) {
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    signal |= anychart.Signal.NEEDS_REDRAW;

  signal |= anychart.Signal.BOUNDS_CHANGED;

  this.invalidate(anychart.ConsistencyState.BOUNDS, signal);
};


//----------------------------------------------------------------------------------------------------------------------
//  Scale.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for value.
 * @param {*=} opt_value - Value to be set.
 * @return {*} - Current value or itself for method chaining.
 */
anychart.core.axisMarkers.PathBase.prototype.valueInternal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.getOption('value') !== opt_value) {
      this['value'](opt_value);
    }
    return this;
  }
  return this.getOption('value');
};


/**
 * Signals dispatched on value change.
 * @return {number}
 */
anychart.core.axisMarkers.PathBase.prototype.getValueChangeSignals = function() {
  var signals = anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED;
  if (this.getOption('scaleRangeMode') == anychart.enums.ScaleRangeMode.CONSIDER)
    signals |= anychart.Signal.NEEDS_RECALCULATION;
  return signals;
};


/** @inheritDoc */
anychart.core.axisMarkers.PathBase.prototype.getEnableChangeSignals = function() {
  var signals = anychart.core.axisMarkers.PathBase.base(this, 'getEnableChangeSignals');
  return signals | anychart.Signal.NEEDS_RECALCULATION;
};


/**
 * Values for scale extending.
 * @return {Array}
 */
anychart.core.axisMarkers.PathBase.prototype.getReferenceValues = function() {
  return [this.valueInternal()];
};


//----------------------------------------------------------------------------------------------------------------------
//  Axis.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Axis invalidation handler.
 * @param {anychart.SignalEvent} event - Event object.
 * @private
 */
anychart.core.axisMarkers.PathBase.prototype.axisInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


/**
 * Sets axis for marker.
 * @param {(anychart.core.Axis|anychart.stockModule.Axis)=} opt_value - Value to be set.
 * @return {(anychart.core.Axis|anychart.stockModule.Axis|anychart.core.axisMarkers.PathBase)} - Current value or itself for method chaining.
 */
anychart.core.axisMarkers.PathBase.prototype.axis = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.axis_ != opt_value) {
      if (this.axis_)
        this.axis_.unlistenSignals(this.axisInvalidated_, this);
      this.axis_ = opt_value;
      this.axis_.listenSignals(this.axisInvalidated_, this);

      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  }
  return this.axis_;
};


/**
 * If set to true - allows drawing marker using any ratio, even (-Infinity, 0) and (1, Infinity).
 * Default value is false.
 * Should not be in the public API.
 * @param {boolean=} opt_value
 * @return {anychart.core.axisMarkers.PathBase|boolean}
 */
anychart.core.axisMarkers.PathBase.prototype.drawAtAnyRatio = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.drawAtAnyRatio_ = opt_value;
    return this;
  }

  return this.drawAtAnyRatio_;
};


//----------------------------------------------------------------------------------------------------------------------
//  Bounds.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Axes lines space.
 * @param {(string|number|anychart.core.utils.Space)=} opt_spaceOrTopOrTopAndBottom - Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft - Right or right and left space.
 * @param {(string|number)=} opt_bottom - Bottom space.
 * @param {(string|number)=} opt_left - Left space.
 * @return {!(anychart.core.axisMarkers.PathBase|anychart.core.utils.Padding)} .
 */
anychart.core.axisMarkers.PathBase.prototype.axesLinesSpace = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.axesLinesSpace_) {
    this.axesLinesSpace_ = new anychart.core.utils.Padding();
  }

  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.axesLinesSpace_.setup.apply(this.axesLinesSpace_, arguments);
    return this;
  } else {
    return this.axesLinesSpace_;
  }
};


/**
 * Whether marker is horizontal.
 * @return {boolean} - If the marker is horizontal.
 */
anychart.core.axisMarkers.PathBase.prototype.isHorizontal = function() {
  return this.layout() == anychart.enums.Layout.HORIZONTAL;
};


//----------------------------------------------------------------------------------------------------------------------
//  Drawing.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Additional action on bounds invalidation.
 * @protected
 */
anychart.core.axisMarkers.PathBase.prototype.boundsInvalidated = goog.nullFunction();


/**
 * Additional action on appearance invalidation.
 * @protected
 */
anychart.core.axisMarkers.PathBase.prototype.appearanceInvalidated = goog.nullFunction();


/**
 * Drawing.
 * @return {anychart.core.axisMarkers.PathBase} - Itself for method chaining.
 */
anychart.core.axisMarkers.PathBase.prototype.draw = function() {
  if (!this.scale()) {
    anychart.core.reporting.error(anychart.enums.ErrorCode.SCALE_NOT_SET);
    return this;
  }

  if (!this.checkDrawingNeeded())
    return this;

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */(this.zIndex());
    this.markerElement().zIndex(zIndex);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    this.markerElement().parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.appearanceInvalidated();
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.boundsInvalidated();
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  return this;
};


/**
 * For case of line marker.
 * @protected
 * @return {anychart.core.axisMarkers.PathBase} - Itself for method chaining.
 */
anychart.core.axisMarkers.PathBase.prototype.drawLine = function() {
  var scale = /** @type {anychart.scales.Base|anychart.scales.GanttDateTime} */ (this.scale());

  if (!scale) { //Here we can get null.
    anychart.core.reporting.error(anychart.enums.ErrorCode.SCALE_NOT_SET);
    return this;
  }

  var el = /** @type {acgraph.vector.Path} */ (this.markerElement());

  var ratio = scale.transform(this.getOption('value'), 0.5);
  el.clear();
  if (isNaN(ratio)) return this;

  if ((ratio >= 0 && ratio <= 1) || this.drawAtAnyRatio_) {
    var bounds = this.parentBounds();
    var axesLinesSpace = this.axesLinesSpace();
    var strokeThickness = /** @type {number} */(el.strokeThickness());

    if (this.isHorizontal()) {
      var y = bounds.getTop() + bounds.height - ratio * bounds.height;
      y = anychart.utils.applyPixelShift(y, strokeThickness);
      el.moveTo(bounds.getLeft(), y);
      el.lineTo(bounds.getRight(), y);
    } else {
      var x = bounds.getLeft() + ratio * bounds.width;
      x = anychart.utils.applyPixelShift(x, strokeThickness);
      el.moveTo(x, bounds.getTop());
      el.lineTo(x, bounds.getBottom());
    }
    if (!this.drawAtAnyRatio_)//sacrifice clipping, to draw marker out of bounds
      el.clip(axesLinesSpace.tightenBounds(/** @type {!anychart.math.Rect} */(bounds)));
  }
  return this;
};


/**
 * For case of range marker.
 * @return {anychart.core.axisMarkers.PathBase} - Itself for method chaining.
 */
anychart.core.axisMarkers.PathBase.prototype.drawRange = function() {
  var scale = /** @type {anychart.scales.Base|anychart.scales.GanttDateTime} */ (this.scale());

  if (!scale) { //Here we can get null.
    anychart.core.reporting.error(anychart.enums.ErrorCode.SCALE_NOT_SET);
    return this;
  }

  var el = /** @type {acgraph.vector.Path} */ (this.markerElement());
  el.clear();

  var to = this.getOption('to');
  var from = this.getOption('from');

  //Safe transformation to ratio.
  var fromScaleRatio = scale.transform(from);
  var toScaleRatio = scale.transform(to);

  //Safe comparison - comparing numbers.
  if (fromScaleRatio > toScaleRatio) {
    to = this.getOption('from');
    from = this.getOption('to');
  }

  var fromRatio = scale.transform(from, 0);
  var toRatio = scale.transform(to, 1);

  var ratioMinValue = Math.min(toRatio, fromRatio);
  var ratioMaxValue = Math.max(toRatio, fromRatio);

  if (isNaN(ratioMinValue) || isNaN(ratioMaxValue)) return this;

  if ((ratioMaxValue >= 0 && ratioMinValue <= 1) || this.drawAtAnyRatio_) { //range or part of it is visible.
    if (!this.drawAtAnyRatio_) {//clamp only if we restrict ratio to [0, 1] range.
      // clamping to prevent range marker go out from the bounds. Ratio should be between 0 and 1.
      ratioMinValue = goog.math.clamp(ratioMinValue, 0, 1);
      ratioMaxValue = goog.math.clamp(ratioMaxValue, 0, 1);
    }

    var bounds = this.parentBounds();
    var axesLinesSpace = this.axesLinesSpace();

    if (this.isHorizontal()) {
      var y_max = Math.floor(bounds.getBottom() - bounds.height * ratioMaxValue);
      var y_min = Math.ceil(bounds.getBottom() - bounds.height * ratioMinValue);
      var x_start = bounds.getLeft();
      var x_end = bounds.getRight();
      el.moveTo(x_start, y_max)
          .lineTo(x_end, y_max)
          .lineTo(x_end, y_min)
          .lineTo(x_start, y_min)
          .close();
    } else {
      var y_start = bounds.getBottom();
      var y_end = bounds.getTop();
      var x_min = Math.floor(bounds.getLeft() + (bounds.width * ratioMinValue));
      var x_max = Math.ceil(bounds.getLeft() + (bounds.width * ratioMaxValue));
      el.moveTo(x_min, y_start)
          .lineTo(x_min, y_end)
          .lineTo(x_max, y_end)
          .lineTo(x_max, y_start)
          .close();
    }
    if (!this.drawAtAnyRatio_)//sacrifice clipping, to draw marker out of bounds
      el.clip(axesLinesSpace.tightenBounds(/** @type {!anychart.math.Rect} */(bounds)));
  }
  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//  Disabling & enabling.
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.axisMarkers.PathBase.prototype.remove = function() {
  this.markerElement().parent(null);
};


//----------------------------------------------------------------------------------------------------------------------
//  Elements creation.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Create marker element.
 * @return {!acgraph.vector.Path} - Marker line element.
 * @protected
 */
anychart.core.axisMarkers.PathBase.prototype.markerElement = function() {
  if (!this.markerElement_) {
    this.markerElement_ = /** @type {!acgraph.vector.Path} */(acgraph.path());
    this.bindHandlersToGraphics(this.markerElement_);
  }
  return this.markerElement_;
};


/**
 * Properties that should be defined in class prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.axisMarkers.PathBase.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'scaleRangeMode', anychart.enums.normalizeScaleRangeMode]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.core.axisMarkers.PathBase, anychart.core.axisMarkers.PathBase.OWN_DESCRIPTORS);


/** @inheritDoc */
anychart.core.axisMarkers.PathBase.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.axisMarkers.PathBase.base(this, 'setupByJSON', config, opt_default);
  if ('layout' in config && config['layout']) this.layout(config['layout']);
  if ('axis' in config) {
    var ax = config['axis'];
    if (goog.isNumber(ax)) {
      if (this.chart_) {
        this.axis((/** @type {anychart.core.CartesianBase} */(this.chart_)).getAxisByIndex(ax));
      }
    } else if (ax.isAxisMarkerProvider && ax.isAxisMarkerProvider()) {
      this.axis(ax);
    }
  }
  anychart.core.settings.deserialize(this, anychart.core.axisMarkers.PathBase.OWN_DESCRIPTORS, config, opt_default);
};


/** @inheritDoc */
anychart.core.axisMarkers.PathBase.prototype.serialize = function() {
  var json = anychart.core.axisMarkers.PathBase.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.core.axisMarkers.PathBase.OWN_DESCRIPTORS, json);
  return json;
};


/** @inheritDoc */
anychart.core.axisMarkers.PathBase.prototype.disposeInternal = function() {
  this.axis_ = null;
  this.chart_ = null;
  goog.disposeAll(this.markerElement_, this.axesLinesSpace_);
  this.markerElement_ = null;
  this.axesLinesSpace_ = null;
  anychart.core.axisMarkers.PathBase.base(this, 'disposeInternal');
};

(function() {
  var proto = anychart.core.axisMarkers.PathBase.prototype;
  proto['ul_type'] = proto.getThisType;//jb
  //proto['ul_supported'] = proto.supported;//jb
  proto['ul_draw'] = proto.draw;//jb
})();