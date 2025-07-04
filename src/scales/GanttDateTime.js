goog.provide('anychart.scales.GanttDateTime');

//region -- Requirements.
goog.require('anychart.core.Base');
goog.require('anychart.enums');
goog.require('anychart.format');
goog.require('anychart.ganttModule.Calendar');

goog.require('goog.array');
goog.require('goog.date.Interval');
goog.require('goog.date.UtcDateTime');
goog.require('goog.string.format');


//endregion
//region -- Constructor.
/**
 * Gantt date time scale implementation.
 *
 * This scale is created totally separated from the other scales and does not extend common scale
 * classes (anychart.scales.Base or anychart.scales.ScatterBase or anychart.scales.DateTime) because here are
 * some critical differences in inherited methods usage.
 *
 * For example, gantt date time scale can't be inverted, transformed ticks can be out of [0..1] range etc.
 * Nevertheless, some method names are similar to methods of another scales and can be used in the same way.
 *
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.scales.GanttDateTime = function() {
  anychart.scales.GanttDateTime.base(this, 'constructor');

  /**
   * Currently visible min value.
   * @type {number}
   * @private
   */
  this.min_ = NaN;

  /**
   * Currently visible max value.;
   * @type {number}
   * @private
   */
  this.max_ = NaN;

  /**
   * Absolute minimum of scale.
   * @type {number}
   * @private
   */
  this.totalMin_ = NaN;

  /**
   * Absolute maximum of scale.
   * @type {number}
   * @private
   */
  this.totalMax_ = NaN;

  /**
   * Data minimum of scale.
   * @type {number}
   * @private
   */
  this.dataMin_ = NaN;

  /**
   * Data maximum of scale.
   * @type {number}
   * @private
   */
  this.dataMax_ = NaN;

  /**
   * Contains total min date without a timeline's gap value.
   * @type {number}
   */
  this.trackedDataMin = NaN;

  /**
   * Contains total max date without a timeline's gap value.
   * @type {number}
   */
  this.trackedDataMax = NaN;

  /**
   * Manually set scale's min.
   * Is more important than totalMin.
   * @type {number}
   * @private
   */
  this.manualMin_ = NaN;

  /**
   * Manually set scale's max.
   * Is more important than totalMax.
   * @type {number}
   * @private
   */
  this.manualMax_ = NaN;

  /**
   * Manually set scale's soft min.
   * Is more important than totalMin.
   * @type {number}
   * @private
   */
  this.softMin_ = NaN;

  /**
   * Manually set scale's soft max.
   * Is more important than totalMax.
   * @type {number}
   * @private
   */
  this.softMax_ = NaN;

  /**
   * Minimum gap.
   *
   * @type {anychart.scales.GanttDateTime.Gap}
   * @private
   */
  this.minimumGap_ = {
    'value': .01,
    'isPixels': false
  };

  /**
   * Maximum gap.
   *
   * @type {anychart.scales.GanttDateTime.Gap}
   * @private
   */
  this.maximumGap_ = {
    'value': .01,
    'isPixels': false
  };

  /**
   * Current date. Used for this.timestampToRatio('current') to make this method return the same on different calls.
   * @type {number}
   */
  this.currentDate = NaN;

  /**
   * Whether recalculation is required.
   * @type {boolean}
   */
  this.consistent = false;

  /**
   * Min for empty data.
   * @type {number}
   * @private
   */
  this.emptyMin_ = NaN;

  /**
   * Max for empty data.
   * @type {number}
   * @private
   */
  this.emptyMax_ = NaN;

  /**
   * @type {anychart.scales.GanttDateTime.ZoomLevelsSettingsRep}
   * @private
   */
  this.ranges_ = this.normalizeLevels_(anychart.scales.GanttDateTime.DEFAULT_LEVELS);

  /**
   * Fiscal year start month (1-12).
   *
   * @type {number}
   * @private
   */
  this.fiscalYearStartMonth_ = 1;

  /**
   * Fiscal year offset for DVF-4399.
   *
   * @type {number}
   * @private
   */
  this.fiscalYearOffset_ = 0;

  /**
   * Maximum number of ticks.
   * @type {number}
   * @private
   */
  this.maxTicksCount_ = anychart.scales.GanttDateTime.DEFAULT_MAX_TICKS_COUNT;

  /**
   * Calendar.
   *
   * @type {anychart.ganttModule.Calendar}
   * @private
   */
  this.calendar_ = null;

  /**
   * Entity that provides an ability to ask provider.getPixelBounds().width
   * for pixel-gapping purposes.
   *
   * @type {?anychart.core.VisualBaseWithBounds}
   * @private
   */
  this.boundsProvider_ = null;
};
goog.inherits(anychart.scales.GanttDateTime, anychart.core.Base);


//endregion
//region -- Supported signals.
/**
 * Supported signals mask.
 * @type {number}
 */
anychart.scales.GanttDateTime.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_RECALCULATION | // Any scale changes, except calendar.
    anychart.Signal.NEEDS_REAPPLICATION;  // Calendar-specific signal.

/**
 * Getter for supported signals.
 * @return {Object}
 */
anychart.scales.GanttDateTime.prototype.supported = function() {
  return {
    "sigs": ["NEEDS_RECALCULATION","NEEDS_REAPPLICATION"],
    "cs": []
  };
};

/**
 * Returns this type.
 * @return {string}
 */
anychart.scales.GanttDateTime.prototype.getThisType = function() {
  return 'anychart.scales.GanttDateTime';
};


//endregion
//region -- Type Definitions.
/**
 * @typedef {Array.<Array.<(anychart.enums.Interval|{unit:anychart.enums.Interval,count:number})>>}
 */
anychart.scales.GanttDateTime.ZoomLevelsSettings;


/**
 * @typedef {Array<{range:number,levels:Array.<{unit:anychart.enums.Interval,count:number}>}>}
 */
anychart.scales.GanttDateTime.ZoomLevelsSettingsRep;


/**
 * @typedef {{
 *  unit: anychart.enums.Interval,
 *  count: number
 * }}
 */
anychart.scales.GanttDateTime.LevelData;


/**
 * @typedef {{
 *  start: number,
 *  end: number,
 *  holiday: (boolean|undefined)
 * }}
 */
anychart.scales.GanttDateTime.Tick;


/**
 * @typedef {{
 *  value: number,
 *  isPixels: boolean
 * }}
 */
anychart.scales.GanttDateTime.Gap;


//endregion
//region -- Constants.
/**
 * Amount of milliseconds in second.
 * @type {number}
 */
anychart.scales.GanttDateTime.MILLISECONDS_IN_SECOND = 1000;


/**
 * Amount of milliseconds in minute.
 * @type {number}
 */
anychart.scales.GanttDateTime.MILLISECONDS_IN_MINUTE = anychart.scales.GanttDateTime.MILLISECONDS_IN_SECOND * 60;


/**
 * Amount of milliseconds in hour.
 * @type {number}
 */
anychart.scales.GanttDateTime.MILLISECONDS_IN_HOUR = anychart.scales.GanttDateTime.MILLISECONDS_IN_MINUTE * 60;


/**
 * Amount of milliseconds in day.
 * @type {number}
 */
anychart.scales.GanttDateTime.MILLISECONDS_IN_DAY = anychart.scales.GanttDateTime.MILLISECONDS_IN_HOUR * 24;


/**
 * Default zoom factor.
 * @type {number}
 */
anychart.scales.GanttDateTime.DEFAULT_ZOOM_FACTOR = 1.25;

/**
 * Hardcoded default value of maximum ticks count.
 * @type {number}
 */
anychart.scales.GanttDateTime.DEFAULT_MAX_TICKS_COUNT = 200;


/**
 *
 * @type {anychart.scales.GanttDateTime.ZoomLevelsSettings}
 */
anychart.scales.GanttDateTime.DEFAULT_LEVELS = [
  [{'unit': anychart.enums.Interval.MINUTE, 'count': 10}, {'unit': anychart.enums.Interval.HOUR, 'count': 1}, {'unit': anychart.enums.Interval.DAY, 'count': 1}],
  [{'unit': anychart.enums.Interval.HOUR, 'count': 2}, {'unit': anychart.enums.Interval.DAY, 'count': 1}, {'unit': anychart.enums.Interval.MONTH, 'count': 1}],
  [{'unit': anychart.enums.Interval.DAY, 'count': 1}, {'unit': anychart.enums.Interval.WEEK, 'count': 1}, {'unit': anychart.enums.Interval.MONTH, 'count': 1}],
  [{'unit': anychart.enums.Interval.MONTH, 'count': 1}, {'unit': anychart.enums.Interval.QUARTER, 'count': 1}, {'unit': anychart.enums.Interval.YEAR, 'count': 1}],
  [{'unit': anychart.enums.Interval.QUARTER, 'count': 1}, {'unit': anychart.enums.Interval.YEAR, 'count': 1}, {'unit': anychart.enums.Interval.YEAR, 'count': 10}]
];


//endregion
//region -- Developer's API.
/**
 * @return {anychart.enums.ScaleTypes}
 */
anychart.scales.GanttDateTime.prototype.getType = function() {
  return anychart.enums.ScaleTypes.GANTT;
};

/**
 * Gets/sets this.boundsProvider_. @see this.boundsProvider_ description.
 * Must be set anyway and set before any scale calculations.
 *
 * @param {?anychart.core.VisualBaseWithBounds=} opt_value - Provider to be set.
 * @return {?anychart.core.VisualBaseWithBounds|anychart.scales.GanttDateTime} - Current provider
 *  or itself for chaining.
 */
anychart.scales.GanttDateTime.prototype.boundsProvider = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.boundsProvider_ !== opt_value) {
      if (goog.isNull(opt_value)) { // this.boundsProvider_ is not null here.
        this.boundsProvider_.unlistenSignals(this.boundsProviderInvalidated_, this);
        this.boundsProvider_ = null;
      } else {
        if (this.boundsProvider_) {
          this.boundsProvider_.unlistenSignals(this.boundsProviderInvalidated_, this);
        }
        this.boundsProvider_ = opt_value;
        this.boundsProvider_.listenSignals(this.boundsProviderInvalidated_, this);
      }
    }
    return this;
  }
  return this.boundsProvider_;
};


/**
 * Handler of bounds changed.
 *
 * @param {anychart.SignalEvent} e - .
 * @private
 */
anychart.scales.GanttDateTime.prototype.boundsProviderInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.BOUNDS_CHANGED) && !this.isEmpty() && this.hasPixelGaps_()) {
    var isMinReached = this.minReached_();
    var isMaxReached = this.maxReached_();
    var isPixelMinGap = this.minimumGap_['isPixels'];
    var isPixelMaxGap = this.maximumGap_['isPixels'];
    var width = this.boundsProvider_.getPixelBounds().width;

    var newMsGap;
    var limitedGap;

    // @see detailed math description in DVF-4444.
    if (isMinReached && isMaxReached) {
      this.fitAll();
    } else if (isMinReached && isPixelMinGap) {
      limitedGap = this.limitPixelGap_(this.minimumGap_['value'], width);
      newMsGap = (limitedGap * (this.max_ - this.dataMin_) / (width - limitedGap)) || 0;
      this.min_ = this.dataMin_ - newMsGap;
      this.totalMin_ = this.min_;
      if (isPixelMaxGap) {
        var limitedMaxGap = this.getMsGap_(this.max_ - this.min_, this.maximumGap_);
        this.totalMax_ = this.dataMax_ + limitedMaxGap;
      }
      this.consistent = true;
    } else if (isMaxReached && isPixelMaxGap) {
      limitedGap = this.limitPixelGap_(this.maximumGap_['value'], width);
      newMsGap = (limitedGap * (this.dataMax_ - this.min_) / (width - limitedGap)) || 0;
      this.max_ = this.dataMax_ + newMsGap;
      this.totalMax_ = this.max_;
      if (isPixelMinGap) {
        var limitedMinGap = this.getMsGap_(this.max_ - this.min_, this.minimumGap_);
        this.totalMin_ = this.dataMin_ - limitedMinGap;
      }
      this.consistent = true;
    } else {
      this.resetLimitsByGaps_();
    }

    this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
  }
};


/**
 * Whether scale is not configured.
 * Used for serialization purposes.
 * @return {boolean} - Whether scale is not configured.
 */
anychart.scales.GanttDateTime.prototype.isEmpty = function() {
  return isNaN(this.min_) && isNaN(this.max_) &&
      isNaN(this.dataMin_) && isNaN(this.dataMax_);
};


/**
 * Resets values.
 */
anychart.scales.GanttDateTime.prototype.reset = function() {
  this.min_ = NaN;
  this.max_ = NaN;
  this.totalMin_ = NaN;
  this.totalMax_ = NaN;
  this.dataMin_ = NaN;
  this.dataMax_ = NaN;
  this.consistent = false;
};


/**
 * Gets data range for empty data.
 * @return {{min: number, max: number}}
 */
anychart.scales.GanttDateTime.prototype.getEmptyRange = function() {
  var now = new Date();
  if (isNaN(this.emptyMin_))
    this.emptyMin_ = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  if (isNaN(this.emptyMax_))
    this.emptyMax_ = this.emptyMin_ + anychart.scales.GanttDateTime.MILLISECONDS_IN_DAY;
  return {'min': this.emptyMin_, 'max': this.emptyMax_};
};


/**
 * Sets a minimum and maximum dates for the scale.
 * TODO (A.Kudryavtsev): Describe how min and max values are limited by total min and total max.
 * @param {*} min - Minimum value.
 * @param {*} max - Maximum value.
 * @return {anychart.scales.GanttDateTime} - Itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.setRange = function(min, max) {
  min = anychart.utils.normalizeTimestamp(min);
  max = anychart.utils.normalizeTimestamp(max);
  if ((this.min_ != min || this.max_ != max) && !isNaN(max) && !isNaN(min)) {
    this.resetLimitsByGaps_();
    this.min_ = min;
    this.max_ = max;
    this.consistent = false;
    this.calculate();
    this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
  }
  return this;
};


/**
 * Sets a data minimum and maximum dates for the scale.
 * TODO (A.Kudryavtsev): Describe how min and max values are limited by total min and total max.
 * @param {*} min - Minimum value.
 * @param {*} max - Maximum value.
 * @return {anychart.scales.GanttDateTime} - Itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.setDataRange = function(min, max) {
  min = anychart.utils.normalizeTimestamp(min);
  max = anychart.utils.normalizeTimestamp(max);
  if (this.dataMin_ != min || this.dataMax_ != max) {
    this.dataMin_ = min;
    this.dataMax_ = max;
    this.totalMin_ = NaN;
    this.totalMax_ = NaN;
    this.consistent = false;
    this.calculate();
    this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
  }
  return this;
};


/**
 * Calculates total min/max on both pixel gaps for fitAll() case.
 *
 * A mathematical explanation:
 *
 *
 *    .<------------------ timeline pixel width ------------------>.
 *    .                                                            .
 *    .<-min pixel gap ->.                       .<-max pixel gap->.
 *    .                  .                       .                 .
 *    .                  .                       .                 .
 *    +----------------------timenline area------------------------+
 *    |                  .                       .                 |
 *    |                  .                       .                 |
 *    |                  +-----------------------+                 |
 *    |<---min ms gap--->| total data range (ms) |<---max ms gap-->|
 *    |                  +-----------------------+                 |
 *    |                                                            |
 *    +------------------------------------------------------------|
 *
 *    Let's put
 *      g1 = min pixel gap (pixels)
 *      g2 = max pixel gap (pixels)
 *      w = timeline width (pixels)
 *      r = total data range (milliseconds)
 *
 *    Needs to find:
 *      m1 = min ms gap (milliseconds)
 *      m2 = max ms gap (milliseconds)
 *
 *    First correct system of proportions:
 *
 *      w - g1 - g2         r
 *      -----------  =  -----------
 *           w          r + m1 + m2
 *
 *      w - g2       r + m1
 *      ------  =  -----------
 *        w        r + m1 + m2
 *
 *     Solving this we can get
 *
 *      +---------------------------------------+
 *      | m1 = r * g1 / (w - g1 - g2)           | (1)
 *      +---------------------------------------+
 *
 *
 *     Second correct system of proportions:
 *
 *      w - g1 - g2         r
 *      -----------  =  -----------
 *           w          r + m1 + m2
 *
 *      w - g2       r + m2
 *      ------  =  -----------
 *        w        r + m1 + m2
 *
 *     Solving this we can get
 *
 *      +---------------------------------------+
 *      | m2 = r * g2 / (w - g1 - g2)           | (2)
 *      +---------------------------------------+
 *
 *
 * DEV NOTE: This method is named by existing name 'getTotalRange'.
 *
 * @private
 */
anychart.scales.GanttDateTime.prototype.getBothPixelGapsTotals_ = function() {
  var w = this.boundsProvider_.getPixelBounds().width;
  var g1 = this.limitPixelGap_(this.minimumGap_['value'], w);
  var g2 = this.limitPixelGap_(this.maximumGap_['value'], w);
  var r = this.dataMax_ - this.dataMin_;

  if (isNaN(this.manualMin_)) {
    if (isNaN(this.softMin_)) {
      var m1 = r * g1 / (w - g1 - g2); // (1) Left as is to look like math in description.

      /*
         This code prevents the following cases:
           - if width is zero and gap is normalized to zero, 0/0 gives NaN.
           - for some cases totalMin_ can be more than totalMax_. It is basically unacceptable.
        */
      m1 = Math.max(m1, 0) || 0;
      this.totalMin_ = Math.round(this.dataMin_ - m1);
    } else {
      this.totalMin_ = Math.min(this.softMin_, this.dataMin_);
    }
  } else {
    this.totalMin_ = this.manualMin_;
  }

  if (isNaN(this.manualMax_)) {
    if (isNaN(this.softMax_)) {
      var m2 = r * g2 / (w - g1 - g2); // (2) Left as is to look like math in description.
      /*
        This code prevents the following cases:
        - if width is zero and gap is normalized to zero, 0/0 gives NaN.
        - for some cases totalMin_ can be more than totalMax_. It is basically unacceptable.
      */
      m2 = Math.max(m2, 0) || 0;
      this.totalMax_ = Math.round(this.dataMax_ + m2);
    } else {
      this.totalMax_ = Math.max(this.softMax_, this.dataMax_);
    }
  } else {
    this.totalMax_ = this.manualMax_;
  }
};


/**
 * Calculates new total min/max for fitAll() case.
 * Used for case when one gap is 'pixels', another one is 'percents'.
 *
 * DEV NOTE: This method is named by existing name 'getTotalRange'.
 * DEV NOTE 2: Must be used for fitAll() only.
 *
 * @param {boolean} isMin - Whether to deal with case when pixels gap is minimum gap. Maximum gap otherwise.
 * @private
 */
anychart.scales.GanttDateTime.prototype.getPartialGapsTotals_ = function(isMin) {
  var pixelsGap = isMin ? this.minimumGap_ : this.maximumGap_;
  var percentsGap = isMin ? this.maximumGap_ : this.minimumGap_;
  var width = this.boundsProvider_.getPixelBounds().width;

  var range = this.dataMax_ - this.dataMin_;
  var percentsGapMs = range * percentsGap['value'];
  var pixelsGapValue = this.limitPixelGap_(pixelsGap['value'], width);

  // This calculates correct ms value and prevents case when timeline zero width gives NaN on division.
  var pixelsGapMs = (pixelsGapValue * (range + percentsGapMs) / (width - pixelsGapValue)) || 0;

  if (isNaN(this.manualMin_)) {
    if (isNaN(this.softMin_)) {
      this.totalMin_ = isMin ? this.dataMin_ - pixelsGapMs : this.dataMin_ - percentsGapMs;
    } else {
      this.totalMin_ = Math.min(this.softMin_, this.dataMin_);
    }
  } else {
    this.totalMin_ = this.manualMin_;
  }

  if (isNaN(this.manualMax_)) {
    if (isNaN(this.softMax_)) {
      this.totalMax_ = isMin ? this.dataMax_ + percentsGapMs : this.dataMax_ + pixelsGapMs;
    } else {
      this.totalMax_ = Math.max(this.softMax_, this.dataMax_);
    }
  } else {
    this.totalMax_ = this.manualMax_;
  }
};


/**
 * Fits scale to its total range.
 *
 * @return {anychart.scales.GanttDateTime} - Itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.fitAll = function() {
  if (this.isEmpty()) {
    /*
     * We save our intention to fit scale until scale is initialized.
     * See anychart.ganttModule.TimeLine.prototype.initScale.
     */
    this.needsFitAll = true;
  } else {
    this.needsFitAll = false;

    var isPixelMinGap = this.minimumGap_['isPixels'];
    var isPixelMaxGap = this.maximumGap_['isPixels'];

    if (isPixelMinGap && isPixelMaxGap) {
      this.getBothPixelGapsTotals_();
    } else if (isPixelMinGap) {
      this.getPartialGapsTotals_(true);
    } else if (isPixelMaxGap) {
      this.getPartialGapsTotals_(false);
    } else {
      this.getTotalRange();
    }

    // Code below skips this.calculate() and used instead of this.setRange();
    this.min_ = this.totalMin_;
    this.max_ = this.totalMax_;
    this.consistent = true;
    this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);

    return this;
  }
  return this;
};


/**
 * Zooms scale in.
 * @param {number=} opt_zoomFactor - Zoom in factor value. "opt_zoomFactor = 5" means 5 times closer.
 * @param {number=} opt_ratio - Ratio by x we need to zoom in.
 * @return {anychart.scales.GanttDateTime} - Itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.zoomIn = function(opt_zoomFactor, opt_ratio) {
  var factor = 1 / (opt_zoomFactor || anychart.scales.GanttDateTime.DEFAULT_ZOOM_FACTOR);
  var ratio = goog.isDef(opt_ratio) ? opt_ratio : 0.5;

  this.resetLimitsByGaps_();

  if (!this.isEmpty()) {
    var range = this.max_ - this.min_;

    /*
      Determinate how many milliseconds we must cut or add to each side of range to do zoom with correct ratio.
     */
    var msIntervalLeft = Math.round(range * (factor - 1) * ratio);
    var msIntervalRight = Math.round(range * (factor - 1) * (1 - ratio));

    var newMin = this.min_ - msIntervalLeft;
    var newMax = this.max_ + msIntervalRight;

    if (Math.abs(newMin - newMax) <= anychart.scales.GanttDateTime.MILLISECONDS_IN_MINUTE) {
      var middle = (this.min_ + this.max_) / 2;
      newMin = middle - anychart.scales.GanttDateTime.MILLISECONDS_IN_MINUTE / 2;
      newMax = middle + anychart.scales.GanttDateTime.MILLISECONDS_IN_MINUTE / 2;
    }
    this.setRange(newMin, newMax);
  }

  return this;
};


/**
 * Zooms scale out.
 * @param {number=} opt_zoomFactor - Zoom out factor value. "opt_zoomFactor = 5" means 5 times further.
 * @param {number=} opt_ratio - Ratio by x we need to zoom out.
 * @return {anychart.scales.GanttDateTime} - Itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.zoomOut = function(opt_zoomFactor, opt_ratio) {
  var factor = opt_zoomFactor || anychart.scales.GanttDateTime.DEFAULT_ZOOM_FACTOR;
  var ratio = goog.isDef(opt_ratio) ? opt_ratio : 0.5;

  this.resetLimitsByGaps_();

  if (!this.minReached_() || !this.maxReached_()) {
    /*
      Determinate how many milliseconds we must cut or add to each side of range to do zoom with correct ratio.
    */
    var msIntervalLeft = Math.round((this.max_ - this.min_) * (factor - 1) * ratio);
    var msIntervalRight = Math.round((this.max_ - this.min_) * (factor - 1) * (1 - ratio));

    var newMin = this.min_ - msIntervalLeft;
    var newMax = this.max_ + msIntervalRight;

    this.getTotalRange();

    if (this.hasPixelGaps_()) {
      var widthPx = this.boundsProvider_.getPixelBounds().width;

      var limitedGapPx;
      var pixelGapRatio;

      if (this.minimumGap_['isPixels']) {
        limitedGapPx = this.limitPixelGap_(this.minimumGap_['value'], widthPx);
        pixelGapRatio = limitedGapPx / widthPx || 0; // Prevents 0/0 = NaN.
        var newMinGap = Math.round(pixelGapRatio * (newMax - newMin));
        this.totalMin_ = this.dataMin_ - newMinGap;
      }

      if (this.maximumGap_['isPixels']) {
        limitedGapPx = this.limitPixelGap_(this.maximumGap_['value'], widthPx);
        pixelGapRatio = limitedGapPx / widthPx || 0;  // Prevents 0/0 = NaN.
        var newMaxGap = Math.round(pixelGapRatio * (newMax - newMin));
        this.totalMax_ = this.dataMax_ + newMaxGap;
      }
    }

    if (newMin < this.totalMin_ || newMax > this.totalMax_) {
      if (newMin < this.totalMin_ && newMax > this.totalMax_) { // Total range overflow.
        this.fitAll();
        return this;
      }

      if (newMin < this.totalMin_) {
        var minDiff = this.totalMin_ - newMin;
        this.setRange(this.totalMin_, newMax + minDiff); //This will extend range with total min anchor.
      }

      if (newMax > this.totalMax_) {
        var maxDiff = newMax - this.totalMax_;
        this.setRange(newMin - maxDiff, this.totalMax_); //This will extend range with total max anchor.
      }
    } else {
      this.setRange(newMin, newMax);
    }
  }
  return this;
};


/**
 * Regular zoomTo without pixel gaps.
 *
 * @param {number|anychart.enums.Interval} startOrUnit - Start date timestamp or interval unit.
 * @param {number=} opt_endOrCount - End date timestamp or interval units count.
 * @param {anychart.enums.GanttRangeAnchor=} opt_anchor - Anchor to zoom from.
 * @return {anychart.scales.GanttDateTime} - Itself for method chaining.
 * @private
 */
anychart.scales.GanttDateTime.prototype.regularZoomTo_ = function(startOrUnit, opt_endOrCount, opt_anchor) {
  var range;
  var start, end;

  this.calculate();
  if (goog.isString(startOrUnit)) {
    if (opt_endOrCount === 0) {
      return this;
    } else {
      var anchor = anychart.enums.normalizeGanttRangeAnchor(opt_anchor);
      var unit = /** @type {anychart.enums.Interval} */ (anychart.enums.normalizeInterval(startOrUnit, anychart.enums.Interval.DAY));
      var interval = anychart.utils.getIntervalFromInfo(unit, opt_endOrCount || 1);

      var startDate;
      var anchorDate;

      switch (anchor) {
        case anychart.enums.GanttRangeAnchor.FIRST_DATE:
          anchorDate = this.dataMin_;
          break;
        case anychart.enums.GanttRangeAnchor.LAST_DATE:
          anchorDate = this.dataMax_;
          interval = interval.getInverse();
          break;
        case anychart.enums.GanttRangeAnchor.LAST_VISIBLE_DATE:
          anchorDate = this.max_;
          interval = interval.getInverse();
          break;
        case anychart.enums.GanttRangeAnchor.FIRST_VISIBLE_DATE:
          anchorDate = this.min_;
      }
      startDate = new goog.date.UtcDateTime(anychart.format.parseDateTime(anchorDate));
      var startMs = anychart.utils.normalizeTimestamp(startDate);
      startDate.add(interval);
      var endMs = anychart.utils.normalizeTimestamp(startDate);
      start = Math.min(startMs, endMs);
      end = Math.max(startMs, endMs);
      range = end - start;
    }
  } else {
    start = startOrUnit;
    end = opt_endOrCount;
    if (goog.isDef(opt_endOrCount)) {
      range = opt_endOrCount - startOrUnit;
    } else {
      range = this.max_ - this.min_;
      end = startOrUnit + range;
    }
  }

  var totalRange = this.getTotalRange();

  var totalDiff = totalRange['max'] - totalRange['min'];
  range = Math.min(totalDiff, range);

  if (end > totalRange['max']) {
    end = totalRange['max'];
    start = end - range;
  }

  if (start < totalRange['min']) {
    start = totalRange['min'];
    end = start + range;
  }

  if (this.isEmpty()) {
    /*
     * We save our intention to zoom, until scale is initialized.
     * See anychart.ganttModule.TimeLine.prototype.initScale.
     */
    this.needsZoomTo = true;
    this.neededZoomToArgs = [startOrUnit, opt_endOrCount, opt_anchor];
  }

  return this.setRange(start, end);
};


/**
 * Regular zoomTo with pixel gaps.
 *
 * @param {number} start - Start date timestamp.
 * @param {number} end - End date timestamp.
 * @return {anychart.scales.GanttDateTime} - Itself for method chaining.
 * @private
 */
anychart.scales.GanttDateTime.prototype.gapsZoomTo_ = function(start, end) {
  var isPixelMinGap = this.minimumGap_['isPixels'];
  var isPixelMaxGap = this.maximumGap_['isPixels'];

  // Defining totalMin and totalMax for fitAll() case.
  if (isPixelMinGap && isPixelMaxGap) {
    this.getBothPixelGapsTotals_();
  } else if (isPixelMinGap) {
    this.getPartialGapsTotals_(true);
  } else if (isPixelMaxGap) {
    this.getPartialGapsTotals_(false);
  }

  // Dummy is because totalMin and totalMax will be probably redefined.
  var dummyTotalRange = this.totalMax_ - this.totalMin_;

  var dataRange = this.dataMax_ - this.dataMin_;

  var range = end - start;

  if (range >= dummyTotalRange) {
    // Code below skips this.calculate() and used instead of this.setRange();
    this.min_ = this.totalMin_;
    this.max_ = this.totalMax_;
  } else {
    // This record is dummy as well because this.min_ and this.max_ will be probably redefined.
    this.min_ = Math.min(start, end);
    this.max_ = Math.max(start, end);
    var minMsGap = this.getMsGap_(dataRange, this.minimumGap_);
    var maxMsGap = this.getMsGap_(dataRange, this.maximumGap_);

    var predictedTotalMin;
    var predictedTotalMax;

    if (isNaN(this.manualMin_)) {
      if (isNaN(this.softMin_)) {
        predictedTotalMin = this.dataMin_ - minMsGap;
      } else {
        predictedTotalMin = Math.min(this.softMin_, this.dataMin_);
      }
    } else {
      predictedTotalMin = this.manualMin_;
    }

    if (isNaN(this.manualMax_)) {
      if (isNaN(this.softMax_)) {
        predictedTotalMax = this.dataMax_ + maxMsGap;
      } else {
        predictedTotalMax = Math.max(this.softMax_, this.dataMax_);
      }
    } else {
      predictedTotalMax = this.manualMax_;
    }

    if (start < predictedTotalMin) {
      this.min_ = predictedTotalMin;
      this.max_ = this.min_ + range;
    } else if (end > predictedTotalMax) { // else-condition can be used here because range < dummyTotalRange.
      this.max_ = predictedTotalMax;
      this.min_ = this.max_ - range;
    } else {
      // this.min_ and this.max_ here are already correct.
    }

  }

  this.totalMin_ = /** @type {number} */ (predictedTotalMin);
  this.totalMax_ = /** @type {number} */ (predictedTotalMax);
  this.consistent = true;

  if (this.isEmpty()) {
    /*
     * We save our intention to zoom, until scale is initialized.
     * See anychart.ganttModule.TimeLine.prototype.initScale.
     */
    this.needsZoomTo = true;
    this.neededZoomToArgs = [start, end];
  }

  this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
  return this;
};


/**
 * Zooms to the dates set.
 * Note:
 *  1) Start can't be set less than total start date, as well as end date can't be set more than total max.
 *  2) If end date is not set, current visible range will be used to calculate end.
 *  3) If start is less than total start, total min will be used as start, the range will be saved.
 *  4) If end is set more than total end, total max will be used as end, that range will be saved.
 *  5) In all this cases, this method can be used as safe scroller and zoomer.
 *  TODO (A.Kudryavtsev): Pretty bad english, fix this.
 *
 * @param {number|anychart.enums.Interval} startOrUnit - Start date timestamp or interval unit.
 * @param {number=} opt_endOrCount - End date timestamp or interval units count.
 * @param {anychart.enums.GanttRangeAnchor=} opt_anchor - Anchor to zoom from.
 * @return {anychart.scales.GanttDateTime} - Itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.zoomTo = function(startOrUnit, opt_endOrCount, opt_anchor) {
  /*
     TODO (A.Kudryavtsev):
     - Does not support pixel gap with anchoring feature for a while.
     - Also does not support case with undefined end for a while.
   */
  if (this.hasPixelGaps_() && goog.isNumber(startOrUnit) && goog.isNumber(opt_endOrCount)) {
    return this.gapsZoomTo_(/** @type {number} */ (startOrUnit), /** @type {number} */ (opt_endOrCount));
  } else {
    return this.regularZoomTo_(startOrUnit, opt_endOrCount, opt_anchor);
  }
};


/**
 * Quick hack to make anychart.core.drawers.Base work with gantt scale.
 * @param {*=} opt_value
 * @return {boolean}
 */
anychart.scales.GanttDateTime.prototype.checkWeights = function(opt_value) {
  return false;
};


//endregion
//region -- Private methods.
/**
 * Creates function that returns formatted string by pattern.
 * @param {string} pattern - Pattern.
 * @param {string=} opt_template - Template to create a resulting string.
 *  Note: Template must be used to express date ranges, so it MUST contain two '%s' expressions. First one means
 *  formatted start date, second one means formatted end date.
 * @return {Function} - Formatter function.
 * @private
 */
anychart.scales.GanttDateTime.createFormat_ = function(pattern, opt_template) {
  if (opt_template) {
    return function(startDate, endDate) {
      return goog.string.format(
          /** @type {string} */ (opt_template),
          anychart.format.dateTime(startDate, pattern),
          anychart.format.dateTime(endDate, pattern)
      );
    };
  } else {
    return function(startDate) {
      return anychart.format.dateTime(startDate, pattern);
    };
  }
};


/**
 * Normalize interval value, depends on 'maxTicksCount',
 *  to prevent ticks draw overhead when user pass wrong zoomLevels config.
 *
 * This method exists because user can pass bad zoomLevels config - {unit: 'millisecond', count: 1} on wide time range.
 *  And it will be cause of browser tab crash.
 * @see https://anychart.atlassian.net/browse/DVF-4357
 *
 * @param {anychart.enums.Interval} unit - Interval unit.
 * @param {number} count - Interval unit count.
 * @return {{unit: anychart.enums.Interval, count: number}} - Normalized values.
 */
anychart.scales.GanttDateTime.prototype.getNormalizedIntervalValues_ = function(unit, count) {
  var range = this.getRange();
  var start = range['min'];
  var end = range['max'];
  var initialDate = new goog.date.UtcDateTime(new Date(start));

  var timeRange = end - start;

  var ticksCount;

  do {
    // Get interval in milliseconds
    var interval = anychart.utils.getIntervalFromInfo(unit, count);
    var temp = initialDate.clone();
    initialDate.add(interval);
    var timeWithInterval = initialDate.getTime();
    var timeWithoutInterval = temp.getTime();
    var intervalInMs = timeWithInterval - timeWithoutInterval;

    // Ticks count with current interval settings.
    ticksCount = Math.ceil(timeRange / intervalInMs);

    if (ticksCount > this.maxTicksCount_) {
      var increasedVal = anychart.utils.getIncreasedIntervalValue(unit, count);
      unit = increasedVal.unit;
      count = increasedVal.count;
    }
  } while (ticksCount > this.maxTicksCount_);

  return {
    unit: unit,
    count: count
  };
};


/**
 * If total min is visually reached.
 * @return {boolean}
 * @private
 */
anychart.scales.GanttDateTime.prototype.minReached_ = function() {
  if (this.isEmpty())
    return true;
  else {
    var totalRange = this.getTotalRange();
    return this.min_ <= totalRange['min'];
  }
};


/**
 * If total max is visually reached.
 * @return {boolean}
 * @private
 */
anychart.scales.GanttDateTime.prototype.maxReached_ = function() {
  if (this.isEmpty())
    return true;
  else {
    var totalRange = this.getTotalRange();
    return this.max_ >= totalRange['max'];
  }
};


/**
 * Normalizes anychart.scales.GanttDateTime.ZoomLevelsSettings-like representation to anychart.scales.GanttDateTime.ZoomLevelsSettingsRep.
 * @param {*} value
 * @return {anychart.scales.GanttDateTime.ZoomLevelsSettingsRep}
 * @private
 */
anychart.scales.GanttDateTime.prototype.normalizeLevels_ = function(value) {
  var res = [];
  if (goog.isArray(value)) {
    for (var i = 0; i < value.length; i++) {
      var zoomLevel = value[i];
      if (goog.isArray(zoomLevel)) {
        var levels = [];
        for (var j = 0; j < zoomLevel.length; j++) {
          var val = zoomLevel[j];
          var unit = null,
              count;
          if (goog.isString(val)) {
            unit = anychart.enums.normalizeInterval(val, null);
            count = 1;
          } else if (goog.isObject(val)) {
            unit = anychart.enums.normalizeInterval(val['unit'], null);
            count = anychart.utils.normalizeToNaturalNumber(val['count']);
          }
          if (unit) {
            levels.push({
              'unit': unit,
              'count': count
            });
          }
        }
        if (levels.length) {
          res.push({
            'range': anychart.utils.getIntervalRange(/** @type {anychart.enums.Interval} */(levels[0]['unit']), /** @type {number} */(levels[0]['count'])),
            'levels': levels
          });
        }
      }
    }
    res.sort(function(a, b) {
      return a['range'] - b['range'];
    });
  }
  return res;
};


/**
 * Handles calendar signals.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.scales.GanttDateTime.prototype.handleCalendarSignal_ = function(e) {
  if (e.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
  }
};


//endregion
//region -- Public API.
/**
 * Gets minimum and maximum visible dates set for scale.
 * @return {{min: number, max: number}}
 */
anychart.scales.GanttDateTime.prototype.getRange = function() {
  this.calculate();
  return this.isEmpty() ? this.getEmptyRange() : {'min': this.min_, 'max': this.max_};
};

/**
 * Limits pixel gap in correct way:
 *  - Resulting gap can't be negative.
 *  - Width can be 0 or have another unacceptable value.
 *
 * @param {number} value - Pixel gap value.
 * @param {number} width - Timeline pixel width.
 * @return {number} - Limited gap pixel value.
 * @private
 */
anychart.scales.GanttDateTime.prototype.limitPixelGap_ = function(value, width) {
  if (width > 0) {
    var limitedGapPx = Math.min(Math.floor(width / 2) - 1, value);
    return Math.max(limitedGapPx, 0);
  }

  return 0;
};


/**
 * Turns any gap to milliseconds value.
 *
 * @param {number} range - Range to calculate from.
 * @param {anychart.scales.GanttDateTime.Gap} gap - Gap to calculate from.
 * @return {number} - Milliseconds gap from range and gap settings.
 * @private
 */
anychart.scales.GanttDateTime.prototype.getMsGap_ = function(range, gap) {
  var value = gap['value'];

  if (gap['isPixels']) {
    var visibleRangeMs = this.max_ - this.min_;

    if (isNaN(visibleRangeMs)) {
      // This is a before-draw case.
      this.needsReapplyGaps = true;
      return range * 0.01;
    }

    // this.boundsProvider_ must be already defined here.
    var widthPx = this.boundsProvider_.getPixelBounds().width;

    // Pixel gap can't be more than (width/2 - 1) px.
    var limitedGapPx = this.limitPixelGap_(value, widthPx);

    var rv =  Math.round((limitedGapPx * visibleRangeMs) / widthPx);
    return rv || 0;
  }

  return range * value;
};


/**
 * Before-draw pixel gaps handler.
 * Pixel gaps correct calculation needs timeline pixel bounds and visible min/max defined.
 * For before-draw case these values might be unavailable.
 * This method must be called when all necessary calculations are done.
 */
anychart.scales.GanttDateTime.prototype.reapplyGaps = function() {
  if (this.needsReapplyGaps) {
    this.needsReapplyGaps = false;
    this.resetLimitsByGaps_();
    this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
  }
};


/**
 * Gets total minimum and maximum dates set for scale.
 *
 * @return {{min: number, max: number}}
 */
anychart.scales.GanttDateTime.prototype.getTotalRange = function() {
  var range, gap;

  if (isNaN(this.totalMin_)) {
    if (isNaN(this.manualMin_)) {
      if (isNaN(this.softMin_)) {
        var max = (isNaN(this.manualMax_) ? (isNaN(this.softMax_) ? this.dataMax_ : Math.max(this.dataMax_, this.softMax_)) : this.manualMax_);
        range = max - this.dataMin_;
        gap = this.getMsGap_(range, this.minimumGap_);
        this.totalMin_ = this.dataMin_ - gap;
      } else {
        this.totalMin_ = Math.min(this.softMin_, this.dataMin_);
      }
    } else {
      this.totalMin_ = this.manualMin_;
    }
  }

  if (isNaN(this.totalMax_)) {
    if (isNaN(this.manualMax_)) {
      if (isNaN(this.softMax_)) {
        var min = (isNaN(this.manualMin_) ? (isNaN(this.softMin_) ? this.dataMin_ : Math.min(this.dataMin_, this.softMin_)) : this.manualMin_);
        range = this.dataMax_ - min;
        gap = this.getMsGap_(range, this.maximumGap_);
        this.totalMax_ = this.dataMax_ + gap;
      } else {
        this.totalMax_ = Math.max(this.softMax_, this.dataMax_);
      }
    } else {
      this.totalMax_ = this.manualMax_;
    }
  }

  // TODO (A.Kudryavtsev): DEBUGGING CODE!
  // if (this.minimumGap_['isPixels'] && this.maximumGap_['isPixels']) {
  //   var width = this.boundsProvider_.getPixelBounds().width;
  //   var limitedMin = this.limitPixelGap_(this.minimumGap_['value'], width);
  //   var limitedMax = this.limitPixelGap_(this.maximumGap_['value'], width);
  //   var pxRatio = (width - limitedMin - limitedMax) / width;
  //   var msRatio = (this.dataMax_ - this.dataMin_) / (this.totalMax_ - this.totalMin_);
  //   console.log('');
  //   console.log('width: ' + width + ', minGap: ' + limitedMin + ', maxGap: ' + limitedMax);
  //   console.log('MinGapMs: ' + (this.dataMin_ - this.totalMin_) + ', MaxGapMs: ' + (this.totalMax_ - this.dataMax_));
  //   console.log('pxRatio: ' + pxRatio + ' msRatio: ' + msRatio);
  //
  // }
  // if (this.totalMin_ > this.totalMax_) debugger;

  return this.isEmpty() ?
      this.getEmptyRange() :
      {'min': this.totalMin_, 'max': this.totalMax_};
};


/**
 * Manually sets scale's minimum.
 * @param {number=} opt_value - Value to set.
 * @return {number|anychart.scales.GanttDateTime} - Current value or itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.minimum = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.normalizeTimestamp(opt_value);
    if (this.manualMin_ != val) {
      this.manualMin_ = val;
      this.totalMin_ = NaN;
      this.consistent = false;
      this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
    }
  }
  return this.manualMin_;
};


/**
 * Manually sets scale's maximum.
 * @param {number=} opt_value - Value to set.
 * @return {number|anychart.scales.GanttDateTime} - Current value or itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.maximum = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.normalizeTimestamp(opt_value);
    if (this.manualMax_ != val) {
      this.manualMax_ = val;
      this.totalMax_ = NaN;
      this.consistent = false;
      this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
    }
  }
  return this.manualMax_;
};


/**
 * Manually sets scale's soft minimum.
 * @param {number=} opt_value - Value to set.
 * @return {number|anychart.scales.GanttDateTime} - Current value or itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.softMinimum = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.normalizeTimestamp(opt_value);
    if (this.softMin_ != val) {
      this.softMin_ = val;
      this.totalMin_ = NaN;
      this.consistent = false;
      this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
    }
  }
  return this.softMin_;
};


/**
 * Manually sets scale's soft maximum.
 * @param {number=} opt_value - Value to set.
 * @return {number|anychart.scales.GanttDateTime} - Current value or itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.softMaximum = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.normalizeTimestamp(opt_value);
    if (this.softMax_ != val) {
      this.softMax_ = val;
      this.totalMax_ = NaN;
      this.consistent = false;
      this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
    }
  }
  return this.softMax_;
};


/**
 * Start month of the fiscal year setter/getter.
 *
 * @param {number=} opt_value - Number of month (1 - 12).
 * @return {number|anychart.scales.GanttDateTime} - Current value or itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.fiscalYearStartMonth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.math.clamp(opt_value, 1, 12);
    if (this.fiscalYearStartMonth_ != opt_value) {
      this.fiscalYearStartMonth_ = opt_value;
      this.consistent = false;
      this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  }
  return this.fiscalYearStartMonth_;
};


/**
 * DVF-4399. Fiscal offset getter/setter.
 *
 * @param {number=} opt_value - How much years to shift.
 * @return {number|anychart.scales.GanttDateTime} - Current value or itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.fiscalYearOffset = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = +opt_value;
    if (!isNaN(opt_value) && this.fiscalYearOffset_ != opt_value) {
      this.fiscalYearOffset_ = opt_value;
      this.consistent = false;
      this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  }
  return this.fiscalYearOffset_;
};


/**
 * This method is added only for compatibility with line/range/text markers of gantt chart's timeline.
 * NOTE: Use timestampToRatio method instead.
 * @param {*} value - Value to transform.
 * @return {number} - Value transformed to ratio scope. Returns NaN if scale range is not set.
 */
anychart.scales.GanttDateTime.prototype.transform = function(value) {
  return this.timestampToRatio(value);
};


/**
 * This method is added only for compatibility with line/range/text markers of gantt chart's timeline.
 * @param {number} ratio - Ratio to transform.
 * @return {number} - Ratio transformed to datetime.
 */
anychart.scales.GanttDateTime.prototype.inverseTransform = function(ratio) {
  return this.ratioToTimestamp(ratio);
};

/**
 * Zoom levels settings.
 * @param {anychart.scales.GanttDateTime.ZoomLevelsSettings=} opt_value
 * @return {anychart.scales.GanttDateTime.ZoomLevelsSettings|anychart.scales.GanttDateTime}
 */
anychart.scales.GanttDateTime.prototype.zoomLevels = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var newZoomLevels = this.normalizeLevels_(opt_value);
    var same = newZoomLevels.length == this.ranges_.length &&
        goog.array.every(newZoomLevels, function(newZoomLevel, index) {
          var oldZoomLevelLevels = this.ranges_[index]['levels'];
          return newZoomLevel['levels'].length == oldZoomLevelLevels.length &&
              goog.array.every(newZoomLevel['levels'], function(item, index) {
                return item['unit'] == oldZoomLevelLevels[index]['unit'] &&
                    item['count'] == oldZoomLevelLevels[index]['count'];
              });
        }, this);
    if (!same) {
      this.ranges_ = newZoomLevels;
      this.consistent = false;
      this.dispatchSignal(anychart.Signal.NEED_UPDATE_TICK_DEPENDENT | anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  }
  return /** @type {anychart.scales.GanttDateTime.ZoomLevelsSettings} */(
      goog.array.map(this.ranges_, function(item) {
        return goog.array.map(item['levels'], function(level) {
          return {
            'unit': level['unit'],
            'count': level['count']
          };
        });
      }));
};


/**
 * Setup max ticks count.
 * It prevent long chart drawing with bad user zoomLevels config
 *
 * @param {number=} opt_value - Ticks count.
 * @return {number|anychart.scales.GanttDateTime} - Scale instance or max tick count.
 */
anychart.scales.GanttDateTime.prototype.maxTicksCount = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = anychart.utils.normalizeToNaturalNumber(opt_value, 1000, false);
    if (this.maxTicksCount_ != val) {
      this.maxTicksCount_ = val;
      this.consistent = false;
      this.dispatchSignal(anychart.Signal.NEED_UPDATE_TICK_DEPENDENT | anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  }
  return this.maxTicksCount_;
};


/**
 * Getter/setter for the scale calendar.
 *
 * @param {anychart.ganttModule.Calendar=} opt_value -
 * @return {anychart.ganttModule.Calendar|anychart.scales.GanttDateTime}
 */
anychart.scales.GanttDateTime.prototype.calendar = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.calendar_ != opt_value) {
      if (this.calendar_)
        this.calendar_.unlistenSignals(this.handleCalendarSignal_, this);
      this.calendar_ = opt_value;
      if (this.calendar_)
        this.calendar_.listenSignals(this.handleCalendarSignal_, this);
      this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  if (!this.calendar_) {
    this.calendar_ = new anychart.ganttModule.Calendar();
    this.calendar_.listenSignals(this.handleCalendarSignal_, this);

    /*
      This dispatching is required to redraw chart with default
      locale weekend range on calendar initialization.
     */
    this.dispatchSignal(anychart.Signal.NEEDS_REAPPLICATION);
  }
  return this.calendar_;
};


//endregion
//region -- Gaps.
/**
 * Normalizes gap to definitely typed value.
 *
 * @param {(number|anychart.scales.GanttDateTime.Gap)=} opt_value - Numeric value of gap or
 *  prepared normalized value.
 * @param {boolean=} opt_treatAsPixels - Whether to treat opt_value as pixels, not as percents.
 * @private
 * @return {anychart.scales.GanttDateTime.Gap} - Normalized gap object
 */
anychart.scales.GanttDateTime.prototype.normalizeGap_ = function(opt_value, opt_treatAsPixels) {
  /**
   * @type {anychart.scales.GanttDateTime.Gap}
   */
  var normalized = {
    'value': 0,
    'isPixels': Boolean(opt_treatAsPixels)
  };

  if (goog.isDef(opt_value)) {
    if (goog.typeOf(opt_value) === 'object') {
      normalized['value'] = +opt_value['value'] || 0;
      normalized['isPixels'] = Boolean(opt_value['isPixels']);
    } else {
      normalized['value'] = +opt_value || 0;
    }
  }

  return normalized;
};


/**
 * Compares normalized gaps.
 *
 * @param {anychart.scales.GanttDateTime.Gap} oldGap - Old gap normalized value.
 * @param {anychart.scales.GanttDateTime.Gap} newGap - New gap normalized value.
 * @return {boolean} - TRUE if gaps have totally the same values, FALSE otherwise.
 * @private
 */
anychart.scales.GanttDateTime.prototype.compareGaps_ = function(oldGap, newGap) {
  // TODO (A.Kudryavtsev): I could use goog.object.equals here, but it would be slower.
  return (oldGap['value'] === newGap['value'] && oldGap['isPixels'] === newGap['isPixels']);
};


/**
 * Gets/sets minimum gap.
 *
 * @param {(number|anychart.scales.GanttDateTime.Gap)=} opt_value - Numeric value of gap or
 *  prepared normalized value.
 * @param {boolean=} opt_treatAsPixels - Whether to treat opt_value as pixels, not as percents.
 * @return {number|anychart.scales.GanttDateTime|anychart.scales.GanttDateTime.Gap} - Current
 *  value or itself for method chaining.
 *  NOTE: for legacy purposes, if gap is percent, number will be returned.
 */
anychart.scales.GanttDateTime.prototype.minimumGap = function(opt_value, opt_treatAsPixels) {
  if (goog.isDef(opt_value)) {
    var newGap = this.normalizeGap_(opt_value, opt_treatAsPixels);
    if (!this.compareGaps_(this.minimumGap_, newGap)) {
      this.minimumGap_ = newGap;
      this.totalMin_ = NaN;
      this.consistent = false;
      this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  }

  // TODO (A.Kudryavtsev): This mess is for legacy. Actually is @deprecated since 8.8.0.
  return this.minimumGap_['isPixels'] ?
      this.minimumGap_ :
      this.minimumGap_['value'];
};


/**
 * Gets/sets maximum gap.
 *
 * @param {(number|anychart.scales.GanttDateTime.Gap)=} opt_value - Numeric value of gap or
 *  prepared normalized value.
 * @param {boolean=} opt_treatAsPixels - Whether to treat opt_value as pixels, not as percents.
 * @return {number|anychart.scales.GanttDateTime|anychart.scales.GanttDateTime.Gap} - Current
 *  value or itself for method chaining.
 *  NOTE: for legacy purposes, if gap is percent, number will be returned.
 */
anychart.scales.GanttDateTime.prototype.maximumGap = function(opt_value, opt_treatAsPixels) {
  if (goog.isDef(opt_value)) {
    var newGap = this.normalizeGap_(opt_value, opt_treatAsPixels);
    if (!this.compareGaps_(this.maximumGap_, newGap)) {
      this.maximumGap_ = newGap;
      this.totalMax_ = NaN;
      this.consistent = false;
      this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
    }
    return this;
  }

  // TODO (A.Kudryavtsev): This mess is for legacy. Actually is @deprecated since 8.8.0.
  return this.maximumGap_['isPixels'] ?
      this.maximumGap_ :
      this.maximumGap_['value'];
};


/**
 * See return description.
 *
 * @return {boolean} - Whether scale has pixel-gap set.
 * @private
 */
anychart.scales.GanttDateTime.prototype.hasPixelGaps_ = function() {
  return Boolean(this.minimumGap_['isPixels'] || this.maximumGap_['isPixels']);
};


/**
 * Actually resets total min and max and marks scale as inconsistent
 * to be recalculated.
 *
 * @private
 * @return {boolean} - Whether scale has been reset.
 */
anychart.scales.GanttDateTime.prototype.resetLimitsByGaps_ = function() {
  if (this.hasPixelGaps_() && !this.isEmpty()) {
    this.totalMin_ = NaN;
    this.totalMax_ = NaN;
    this.consistent = false;
    return true;
  }
  return false;
};


//endregion
//region -- Scale calculations.
/**
 * Calculates and fits values.
 */
anychart.scales.GanttDateTime.prototype.calculate = function() {
  if (!this.consistent && !this.isEmpty()) {
    this.consistent = true;
    var totalRange = this.getTotalRange();
    var tMin = totalRange['min'];
    var tMax = totalRange['max'];
    if (isNaN(tMin)) {
      if (!isNaN(this.min_)) {
        this.dataMin_ = this.min_;
      }
    } else {
      if (isNaN(this.min_)) {
        this.min_ = tMin;
      } else {
        this.min_ = Math.max(this.min_, tMin);
      }
    }

    if (isNaN(tMax)) {
      if (!isNaN(this.max_)) {
        this.dataMax_ = this.max_;
      }
    } else {
      if (isNaN(this.max_)) {
        this.max_ = tMax;
      } else {
        this.max_ = Math.min(this.max_, tMax);
      }
    }

    if (this.min_ > this.max_) {
      var range = this.min_ - this.max_;
      this.min_ = Math.max(this.max_, tMin);
      this.max_ = Math.min(this.min_ + range, tMax);
    }
  }
};


/**
 * @param {number} pixStart - TODO (A.Kudryavtsev): Unused parameter, from previous scale implementation.
 * @param {number} pixEnd - TODO (A.Kudryavtsev): Unused parameter, from previous scale implementation.
 * @param {anychart.enums.Interval} unit
 * @param {number} count
 * @param {{min: number, max: number}=} opt_range we want ticks from, visible range by default
 * @return {Array.<anychart.scales.GanttDateTime.Tick>}
 */
anychart.scales.GanttDateTime.prototype.getTicks = function(pixStart, pixEnd, unit, count, opt_range) {
  var range = opt_range || this.getRange();
  var normalizedValues = this.getNormalizedIntervalValues_(unit, count);

  unit = normalizedValues.unit;
  count = normalizedValues.count;

  var start = anychart.utils.alignDateLeftByUnit(range['min'], unit, count, 2000);
  var interval = anychart.utils.getIntervalFromInfo(unit, count);

  var end = range['max'];
  var res = [];

  var current, currentMs;

  /*
    This condition allows to perform additional calculations only when it's needed:
      - fiscal year start date value is not trivial (this.fiscalYearStartMonth_ > 1).
      - shifted value can be seen (unit is year, semester or quarter).
   */
  if (this.fiscalYearStartMonth_ > 1 &&
      (unit === anychart.enums.Interval.YEAR ||
      unit === anychart.enums.Interval.SEMESTER ||
      unit === anychart.enums.Interval.QUARTER)) {

    /*
      This calculations shifts start value:
        - let start be Date.UTC(2020, 2, 1), it is '2020-03-01' represented as milliseconds.
        - let fiscalYearStartMonth_ be 5 (May).
        - this method gets fiscalStart as Date.UTC(2020, 4, 1), it is exactly '2020-05-01'.
     */
    var fiscalStart = anychart.utils.shiftFiscalDate(start, this.fiscalYearStartMonth_);

    /*
      If fiscalYearStartMonth_ is set, getting the positive: yes, Date.UTC(2020, 4, 1) > Date.UTC(2020, 2, 1).
     */
    if (fiscalStart > start) {

      /*
        In this sample case let's deal with quarters to get timeline levels looking like this:

            Q4     | Q1
          ---------+-------------------
          | Apr    | May    | Jun    |

        Interval in this case is 3 months (1 quarter).
        Inverse is -3 months (-1 quarter).
       */
      var invertedInterval = interval.getInverse();
      current = new goog.date.UtcDateTime(new Date(fiscalStart));
      currentMs = current.getTime(); // This is Date.UTC(2020, 4, 1).
      do {
        /*
          Here we are subtracting these 3-month intervals
          until it becomes less than Date.UTC(2020, 5, 1).
         */
        current.add(invertedInterval);
        currentMs = current.getTime();
      } while (currentMs > start);
    }
  } else {
    current = new goog.date.UtcDateTime(new Date(start));
  }

  currentMs = current.getTime();
  while (currentMs < end) {
    var prev = currentMs;
    current.add(interval);
    currentMs = current.getTime();
    res.push({
      'start': prev,
      'end': currentMs
    });
  }
  return res;
};


/**
 * @param {anychart.enums.Interval} unit
 * @param {number} count
 * @return {Array.<number>}
 */
anychart.scales.GanttDateTime.prototype.getSimpleTicks = function(unit, count) {
  return goog.array.map(this.getTicks(NaN, NaN, unit, count), function(item) {
    return item['end'];
  });
};


/**
 * Transforms a passed value into a ratio depending on current scale date range.
 * <b>Example: </b>
 * If current range is 12.00 - 13.00 ([0..1] in ratio expression), then
 *  12.30 -> 0.5
 *  12.15 -> 0.25
 *  14.00 -> 2
 *  11.00 -> -1
 *  11.30 -> -0.5
 *
 * @param {*} value - Value to transform.
 * @return {number} - Value transformed to ratio scope. Returns NaN if scale range is not set.
 */
anychart.scales.GanttDateTime.prototype.timestampToRatio = function(value) {
  this.calculate();
  var val;
  if (goog.isString(value)) {
    switch (value.toLowerCase()) { //Got string like 'current'.
      case anychart.enums.GanttDateTimeMarkers.CURRENT:
        if (isNaN(this.currentDate))
          this.currentDate = goog.now();
        val = this.currentDate;
        break;
      case anychart.enums.GanttDateTimeMarkers.START:
        val = this.trackedDataMin;
        break;
      case anychart.enums.GanttDateTimeMarkers.END:
        val = this.trackedDataMax;
    }

    if (!goog.isDef(val)) { //Got string representation of date.
      val = anychart.format.parseDateTime(value);
    }
  }

  val = goog.isDefAndNotNull(val) ? val : anychart.utils.normalizeTimestamp(value);

  var range = this.getRange();
  var min = range['min'];
  var max = range['max'];

  //You will get this return expression if you draw a time axis and mark a values there.
  return (val - min) / (max - min);
};


/**
 * Transforms a passed ratio value into a timestamp depending on current scale date range.
 * @param {number} value - Ratio.
 * @return {number} - Timestamp.
 */
anychart.scales.GanttDateTime.prototype.ratioToTimestamp = function(value) {
  var range = this.getRange();
  var min = range['min'];
  var max = range['max'];

  //You will get this return expression if you draw a time axis and mark a values there.
  return Math.round(value * (max - min) + min);
};


/**
 * Gets level settings for current scale state.
 * @return {Array.<anychart.scales.GanttDateTime.LevelData>}
 */
anychart.scales.GanttDateTime.prototype.getLevelsData = function() {
  this.calculate();
  var r = this.getRange();
  var min = r['min'];
  var max = r['max'];

  var minorTickRange = (max - min) / 20;
  var last = this.ranges_.length - 1;
  var row;
  for (var i = 0; i < last; i++) {
    if (minorTickRange <= this.ranges_[i]['range']) {
      row = this.ranges_[i];
      break;
    }
  }
  if (!row) {
    row = this.ranges_[last];
  }

  return /** @type {Array.<anychart.scales.GanttDateTime.LevelData>} */(row['levels']);
};

/**
 * Whether scale has calendar initialized.
 *
 * @return {boolean}
 */
anychart.scales.GanttDateTime.prototype.hasCalendar = function() {
  return !!this.calendar_;
};


/**
 * Calculates working schedule.
 *
 * @return {Array.<anychart.ganttModule.Calendar.DailyScheduleData>} - Gets current working schedule
 *  defined by calendar settings.
 */
anychart.scales.GanttDateTime.prototype.getWorkingSchedule = function() {
  if (this.calendar_) {
    this.calculate();
    var r = this.getRange();
    return this.calendar_.getWorkingSchedule(r['min'], r['max']);
  }
  return [];
};


//endregion
//region -- Scrolling.
/**
 * Performs scroll by ratio passed.
 * @param {number} ratio - Ratio.
 * @return {anychart.scales.GanttDateTime} - Itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.ratioScroll = function(ratio) {
  if (ratio && !this.isEmpty()) {
    this.resetLimitsByGaps_();
    var totalRange = this.getTotalRange();
    var msInterval = Math.round((this.max_ - this.min_) * ratio);
    var interval = 0;
    if (msInterval >= 0) {
      interval = Math.min(totalRange['max'] - this.max_, msInterval);
    } else {
      interval = Math.max(totalRange['min'] - this.min_, msInterval);
    }

    this.setRange(this.min_ + interval, this.max_ + interval);
  }
  return this;
};


/**
 * Performs force scroll by ratio passed. Extends total range.
 * @param {number} ratio - Ratio.
 * @return {anychart.scales.GanttDateTime} - Itself for method chaining.
 */
anychart.scales.GanttDateTime.prototype.ratioForceScroll = function(ratio) {
  if (ratio && !this.isEmpty()) {
    this.resetLimitsByGaps_();
    this.getTotalRange();

    var msInterval = Math.round((this.max_ - this.min_) * ratio);
    var newMin = this.min_ + msInterval;
    var newMax = this.max_ + msInterval;

    if ((!isNaN(this.manualMin_) && newMin < this.manualMin_) || (!isNaN(this.manualMax_) && newMax > this.manualMax_))
      return this;

    // this.dataMin_ = Math.min(this.dataMin_, newMin);
    this.dataMin_ = NaN;
    this.min_ = newMin;
    // this.dataMax_ = Math.max(this.dataMax_, newMax);
    this.dataMax_ = NaN;
    this.max_ = newMax;

    this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
  }
  return this;
};


//endregion
//region -- Serialization/Deserialization.
/** @inheritDoc */
anychart.scales.GanttDateTime.prototype.serialize = function() {
  var json = anychart.scales.GanttDateTime.base(this, 'serialize');

  if (!isNaN(this.min_))
    json['visibleMinimum'] = this.min_;

  if (!isNaN(this.max_))
    json['visibleMaximum'] = this.max_;

  if (!isNaN(this.manualMin_))
    json['minimum'] = this.manualMin_;

  if (!isNaN(this.manualMax_))
    json['maximum'] = this.manualMax_;

  if (!isNaN(this.softMin_))
    json['softMinimum'] = this.softMin_;

  if (!isNaN(this.softMax_))
    json['softMaximum'] = this.softMax_;

  if (!isNaN(this.dataMin_))
    json['dataMinimum'] = this.dataMin_;

  if (!isNaN(this.dataMax_))
    json['dataMaximum'] = this.dataMax_;

  json['minimumGap'] = this.minimumGap_;
  json['maximumGap'] = this.maximumGap_;
  json['maxTicksCount'] = this.maxTicksCount_;

  json['zoomLevels'] = this.zoomLevels();

  if (this.fiscalYearStartMonth_ > 1)
    json['fiscalYearStartMonth'] = this.fiscalYearStartMonth_;

  if (this.fiscalYearOffset_)
    json['fiscalYearOffset'] = this.fiscalYearOffset_;

  if (this.calendar_) {
    var calendarConfig = this.calendar_.serialize();
    if (!goog.object.isEmpty(calendarConfig)) {
      json['calendar'] = calendarConfig;
    }
  }

  return json;
};


/** @inheritDoc */
anychart.scales.GanttDateTime.prototype.setupByJSON = function(config, opt_default) {
  anychart.scales.GanttDateTime.base(this, 'setupByJSON', config, opt_default);

  this.minimumGap(config['minimumGap']);
  this.maximumGap(config['maximumGap']);

  if ('minimum' in config)
    this.minimum(config['minimum']);

  if ('maximum' in config)
    this.maximum(config['maximum']);

  if ('softMinimum' in config)
    this.softMinimum(config['softMinimum']);

  if ('softMaximum' in config)
    this.softMaximum(config['softMaximum']);

  var recalc = false;
  if ('dataMinimum' in config) {
    this.dataMin_ = config['dataMinimum'];
    recalc = true;
  }

  if ('dataMaximum' in config) {
    this.dataMax_ = config['dataMaximum'];
    recalc = true;
  }

  if ('visibleMinimum' in config) {
    this.min_ = config['visibleMinimum'];
    recalc = true;
  }

  if ('visibleMaximum' in config) {
    this.max_ = config['visibleMaximum'];
    recalc = true;
  }

  if ('zoomLevels' in config)
    this.zoomLevels(config['zoomLevels']);

  if ('fiscalYearStartMonth' in config)
    this.fiscalYearStartMonth(config['fiscalYearStartMonth']);

  if ('fiscalYearOffset' in config)
    this.fiscalYearOffset(config['fiscalYearOffset']);

  if ('maxTicksCount' in config)
    this.maxTicksCount(config['maxTicksCount']);

  if ('calendar' in config) {
    this.calendar().setupByJSON(config['calendar']);
  }

  if (recalc) {
    this.consistent = false;
    this.calculate();
    this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION);
  }
};


//endregion
//region -- Exports.
//exports
(function() {
  var proto = anychart.scales.GanttDateTime.prototype;
  proto['ul_type'] = proto.getThisType;//jb
  proto['getRange'] = proto.getRange;
  proto['getTotalRange'] = proto.getTotalRange;
  proto['minimum'] = proto.minimum;
  proto['maximum'] = proto.maximum;
  proto['softMinimum'] = proto.softMinimum;
  proto['softMaximum'] = proto.softMaximum;
  proto['minimumGap'] = proto.minimumGap;
  proto['maximumGap'] = proto.maximumGap;
  proto['fiscalYearStartMonth'] = proto.fiscalYearStartMonth;
  proto['fiscalYearOffset'] = proto.fiscalYearOffset;
  proto['transform'] = proto.transform;
  proto['inverseTransform'] = proto.inverseTransform;
  proto['zoomLevels'] = proto.zoomLevels;
  proto['maxTicksCount'] = proto.maxTicksCount;
  proto['calendar'] = proto.calendar;
  //proto['ul_supported'] = proto.supported;//jb
})();


//endregion
