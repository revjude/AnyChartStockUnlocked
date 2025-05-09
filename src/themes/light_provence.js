goog.provide('anychart.themes.light_provence');


(function() {
  var global = this;
  var stockScrollerUnselected = '#999 0.6';


  /**
   * @this {*}
   * @return {*}
   */
  var returnSourceColor = function() {
    return this['sourceColor'];
  };


  /**
   * @this {*}
   * @return {*}
   */
  var returnDarkenSourceColor = function() {
    return global['anychart']['color']['darken'](this['sourceColor']);
  };


  /**
   * @this {*}
   * @return {*}
   */
  var returnLightenSourceColor = function() {
    return global['anychart']['color']['lighten'](this['sourceColor']);
  };


  global['anychart'] = global['anychart'] || {};
  global['anychart']['themes'] = global['anychart']['themes'] || {};
  global['anychart']['themes']['lightProvence'] = {
    'palette': {
      'type': 'distinct',
      'items': ['#aa8ab3', '#b7cbe2', '#cdd18e', '#938d9c', '#6f5264', '#96246a', '#519790', '#6aabcc', '#61687d', '#7b8030']
    },
    'defaultOrdinalColorScale': {
      'autoColors': function(rangesCount) {
        return global['anychart']['color']['blendedHueProgression']('#b7cbe2', '#574774', rangesCount);
      }
    },
    'defaultLinearColorScale': {'colors': ['#b7cbe2', '#574774']},
    'defaultFontSettings': {
      'fontFamily': '"Source Sans Pro", sans-serif',
      'fontSize': 13,
      'fontColor': '#997f89'
    },
    'defaultBackground': {
      'fill': '#ffffff',
      'stroke': '#ffffff',
      'cornerType': 'round',
      'corners': 0
    },
    'defaultAxis': {
      'stroke': '#dacfd3 0.8',
      'title': {
        'fontSize': 15
      },
      'ticks': {
        'stroke': '#dacfd3 0.8'
      },
      'minorTicks': {
        'stroke': '#e5dcdf 0.8'
      }
    },
    'defaultGridSettings': {
      'stroke': '#dacfd3 0.8'
    },
    'defaultMinorGridSettings': {
      'stroke': '#e5dcdf 0.8'
    },
    'defaultSeparator': {
      'fill': '#dacfd3 0.8'
    },
    'defaultTooltip': {
      'title': {
        'fontColor': '#745c65',
        'padding': {'bottom': 5},
        'fontSize': 15
      },
      'separator': {
        'enabled': false
      },
      'fontColor': '#997f89',
      'fontSize': 13,
      'background': {
        'fill': '#ffffff 0.9',
        'stroke': '1 #ebebeb',
        'corners': 0
      },
      'offsetX': 15,
      'offsetY': 0,
      'padding': {'top': 5, 'right': 15, 'bottom': 5, 'left': 15}
    },
    'defaultColorRange': {
      'stroke': '#c5c1c6',
      'ticks': {
        'stroke': '#c5c1c6', 'position': 'outside', 'length': 7, 'enabled': true
      },
      'minorTicks': {
        'stroke': '#c5c1c6', 'position': 'outside', 'length': 5, 'enabled': true
      },
      'marker': {
        'padding': {'top': 3, 'right': 3, 'bottom': 3, 'left': 3},
        'fill': '#997f89'
      }
    },
    'defaultScroller': {
      'fill': '#f2ebf3',
      'selectedFill': '#e2dce3',
      'thumbs': {
        'fill': '#d4ced5',
        'stroke': '#997f89',
        'hovered': {
          'fill': '#c5c1c6',
          'stroke': '#997f89'
        }
      }
    },
    'defaultLegend': {
      'fontSize': 13
    },
    'chart': {
      'defaultSeriesSettings': {
        'candlestick': {
          'normal': {
            'risingFill': '#aa8ab3',
            'risingStroke': '#aa8ab3',
            'fallingFill': '#b7cbe2',
            'fallingStroke': '#b7cbe2'
          },
          'hovered': {
            'risingFill': returnLightenSourceColor,
            'risingStroke': returnDarkenSourceColor,
            'fallingFill': returnLightenSourceColor,
            'fallingStroke': returnDarkenSourceColor
          },
          'selected': {
            'risingStroke': '3 #aa8ab3',
            'fallingStroke': '3 #b7cbe2',
            'risingFill': '#333333 0.85',
            'fallingFill': '#333333 0.85'
          }
        },
        'hollowcandles': {
          'normal': {
            'risingFill': '#aa8ab3',
            'risingStroke': '#aa8ab3',
            'fallingFill': '#b7cbe2',
            'fallingStroke': '#b7cbe2'
          },
          'hovered': {
            'risingFill': returnLightenSourceColor,
            'risingStroke': returnDarkenSourceColor,
            'fallingFill': returnLightenSourceColor,
            'fallingStroke': returnDarkenSourceColor
          },
          'selected': {
            'risingStroke': '3 #aa8ab3',
            'fallingStroke': '3 #b7cbe2',
            'risingFill': '#333333 0.85',
            'fallingFill': '#333333 0.85'
          }
        },
        'ohlc': {
          'normal': {
            'risingStroke': '#aa8ab3',
            'fallingStroke': '#b7cbe2'
          },
          'hovered': {
            'risingStroke': returnDarkenSourceColor,
            'fallingStroke': returnDarkenSourceColor
          },
          'selected': {
            'risingStroke': '3 #aa8ab3',
            'fallingStroke': '3 #b7cbe2'
          }
        }
      },
      'title': {
        'fontSize': 17
      },
      'padding': {'top': 20, 'right': 25, 'bottom': 15, 'left': 15}
    },
    'pieFunnelPyramidBase': {
      'normal': {
        'labels': {
          'fontColor': null
        }
      },
      'connectorStroke': '#dacfd3',
      'outsideLabels': {'autoColor': '#997f89'},
      'insideLabels': {'autoColor': '#212121'}
    },
    'map': {
      'unboundRegions': {'enabled': true, 'fill': '#f2ebf3', 'stroke': '#e2dce3'},
      'defaultSeriesSettings': {
        'base': {
          'normal': {
            'stroke': '#b2aab5',
            'labels': {
              'fontColor': '#212121'
            }
          }
        },
        'bubble': {
          'normal': {
            'stroke': returnDarkenSourceColor
          }
        },
        'connector': {
          'normal': {
            'stroke': returnDarkenSourceColor,
            'markers': {
              'stroke': '1.5 #f2ebf3'
            }
          },
          'hovered': {
            'markers': {
              'stroke': '1.5 #f2ebf3'
            }
          },
          'selected': {
            'stroke': '1.5 #000',
            'markers': {
              'fill': '#000',
              'stroke': '1.5 #f2ebf3'
            }
          }
        }
      }
    },
    'sparkline': {
      'padding': 0,
      'background': {'stroke': '#ffffff'},
      'defaultSeriesSettings': {
        'area': {
          'stroke': '1.5 #aa8ab3',
          'fill': '#aa8ab3 0.5'
        },
        'column': {
          'fill': '#aa8ab3',
          'negativeFill': '#b7cbe2'
        },
        'line': {
          'stroke': '1.5 #aa8ab3'
        },
        'winLoss': {
          'fill': '#aa8ab3',
          'negativeFill': '#b7cbe2'
        }
      }
    },
    'bullet': {
      'background': {'stroke': '#ffffff'},
      'defaultMarkerSettings': {
        'fill': '#aa8ab3',
        'stroke': '2 #aa8ab3'
      },
      'padding': {'top': 5, 'right': 10, 'bottom': 5, 'left': 10},
      'margin': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
      'rangePalette': {
        'items': ['#848D90', '#98A0A3', '#B4B9BB', '#CFD3D4', '#EAECED']
      }
    },
    'heatMap': {
      'normal': {
        'stroke': '1 #ffffff',
        'labels': {
          'fontColor': '#212121'
        }
      },
      'hovered': {
        'stroke': '1.5 #ffffff'
      },
      'selected': {
        'stroke': '2 #ffffff'
      }
    },
    'treeMap': {
      'normal': {
        'headers': {
          'background': {
            'enabled': true,
            'fill': '#f2ebf3',
            'stroke': '#e2dce3'
          }
        },
        'labels': {
          'fontColor': '#212121'
        },
        'stroke': '#e2dce3'
      },
      'hovered': {
        'headers': {
          'fontColor': '#997f89',
          'background': {
            'fill': '#e2dce3',
            'stroke': '#e2dce3'
          }
        }
      },
      'selected': {
        'labels': {
          'fontColor': '#fafafa'
        },
        'stroke': '2 #eceff1'
      }
    },
    'stock': {
      'padding': [20, 30, 20, 60],
      'defaultPlotSettings': {
        'xAxis': {
          'background': {
            'fill': '#f2ebf3 0.3',
            'stroke': '#dacfd3'
          }
        }
      },
      'scroller': {
        'fill': 'none',
        'selectedFill': '#f2ebf3 0.3',
        'outlineStroke': '#dacfd3',
        'defaultSeriesSettings': {
          'base': {
            'selected': {
              'stroke': returnSourceColor
            }
          },
          'candlestick': {
            'normal': {
              'risingStroke': stockScrollerUnselected,
              'fallingFill': stockScrollerUnselected,
              'risingFill': stockScrollerUnselected,
              'fallingStroke': stockScrollerUnselected
            }
          },
          'hollowcandles': {
            'normal': {
              'risingStroke': stockScrollerUnselected,
              'fallingFill': stockScrollerUnselected,
              'risingFill': stockScrollerUnselected,
              'fallingStroke': stockScrollerUnselected
            }
          },
          'ohlc': {
            'normal': {
              'risingStroke': stockScrollerUnselected,
              'fallingStroke': stockScrollerUnselected
            }
          }
        }
      }
    }
  };
}).call(this);
