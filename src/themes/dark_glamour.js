goog.provide('anychart.themes.dark_glamour');


(function() {
  var global = this;
  var stockScrollerUnselected = '#999 0.6';


  /**
   * @this {*}
   * @return {*}
   */
  var returnSourceColor60 = function() {
    return global['anychart']['color']['setOpacity'](this['sourceColor'], 0.6, true);
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
  global['anychart']['themes']['darkGlamour'] = {
    'palette': {
      'type': 'distinct',
      'items': ['#f8bbd0', '#ce93d8', '#ab47bc', '#d81b60', '#880e4f', '#ffd600', '#ff6e40', '#03a9f4', '#5e35b1', '#1976d2']
    },
    'defaultOrdinalColorScale': {
      'autoColors': function(rangesCount) {
        return global['anychart']['color']['blendedHueProgression']('#f8bbd0', '#d81b60', rangesCount);
      }
    },
    'defaultLinearColorScale': {'colors': ['#f8bbd0', '#d81b60']},
    'defaultFontSettings': {
      'fontFamily': '"Source Sans Pro", sans-serif',
      'fontSize': 13,
      'fontColor': '#d7cacc'
    },
    'defaultBackground': {
      'fill': '#263238',
      'stroke': '#192125',
      'cornerType': 'round',
      'corners': 0
    },
    'defaultAxis': {
      'stroke': '#655B66',
      'title': {
        'fontSize': 15
      },
      'ticks': {
        'stroke': '#655B66'
      },
      'minorTicks': {
        'stroke': '#46474F'
      }
    },
    'defaultGridSettings': {
      'stroke': '#655B66'
    },
    'defaultMinorGridSettings': {
      'stroke': '#46474F'
    },
    'defaultSeparator': {
      'fill': '#84707C'
    },
    'defaultTooltip': {
      'background': {
        'fill': '#263238 0.9',
        'stroke': '2 #192125',
        'corners': 3
      },
      'fontSize': 13,
      'title': {
        'align': 'center',
        'fontSize': 15
      },
      'padding': {'top': 10, 'right': 15, 'bottom': 10, 'left': 15},
      'separator': {
        'margin': {'top': 10, 'right': 10, 'bottom': 10, 'left': 10}
      }
    },
    'defaultColorRange': {
      'stroke': '#455a64',
      'ticks': {
        'stroke': '#455a64', 'position': 'outside', 'length': 7, 'enabled': true
      },
      'minorTicks': {
        'stroke': '#455a64', 'position': 'outside', 'length': 5, 'enabled': true
      },
      'marker': {
        'padding': {'top': 3, 'right': 3, 'bottom': 3, 'left': 3},
        'fill': '#d7cacc'
      }
    },
    'defaultScroller': {
      'fill': '#37474f',
      'selectedFill': '#455a64',
      'thumbs': {
        'fill': '#546e7a',
        'stroke': '#37474f',
        'hovered': {
          'fill': '#78909c',
          'stroke': '#455a64'
        }
      }
    },
    'defaultLegend': {
      'fontSize': 13
    },
    'chart': {
      'defaultSeriesSettings': {
        'base': {
          'selected': {
            'stroke': '1.5 #fafafa',
            'markers': {
              'stroke': '1.5 #fafafa'
            }
          }
        },
        'lineLike': {
          'selected': {
            'stroke': '3 #fafafa'
          }
        },
        'areaLike': {
          'selected': {
            'stroke': '3 #fafafa'
          }
        },
        'marker': {
          'selected': {
            'stroke': '1.5 #fafafa'
          }
        },
        'candlestick': {
          'normal': {
            'risingFill': '#f8bbd0',
            'risingStroke': '#f8bbd0',
            'fallingFill': '#d81b60',
            'fallingStroke': '#d81b60'
          },
          'hovered': {
            'risingFill': returnLightenSourceColor,
            'risingStroke': returnDarkenSourceColor,
            'fallingFill': returnLightenSourceColor,
            'fallingStroke': returnDarkenSourceColor
          },
          'selected': {
            'risingStroke': '3 #f8bbd0',
            'fallingStroke': '3 #d81b60',
            'risingFill': '#333333 0.85',
            'fallingFill': '#333333 0.85'
          }
        },
        'hollowcandles': {
          'normal': {
            'risingFill': '#f8bbd0',
            'risingStroke': '#f8bbd0',
            'fallingFill': '#d81b60',
            'fallingStroke': '#d81b60'
          },
          'hovered': {
            'risingFill': returnLightenSourceColor,
            'risingStroke': returnDarkenSourceColor,
            'fallingFill': returnLightenSourceColor,
            'fallingStroke': returnDarkenSourceColor
          },
          'selected': {
            'risingStroke': '3 #f8bbd0',
            'fallingStroke': '3 #d81b60',
            'risingFill': '#333333 0.85',
            'fallingFill': '#333333 0.85'
          }
        },
        'ohlc': {
          'normal': {
            'risingStroke': '#f8bbd0',
            'fallingStroke': '#d81b60'
          },
          'hovered': {
            'risingStroke': returnDarkenSourceColor,
            'fallingStroke': returnDarkenSourceColor
          },
          'selected': {
            'risingStroke': '3 #f8bbd0',
            'fallingStroke': '3 #d81b60'
          }
        }
      },
      'title': {
        'fontSize': 17
      },
      'padding': {'top': 20, 'right': 25, 'bottom': 15, 'left': 15}
    },
    'cartesianBase': {
      'defaultSeriesSettings': {
        'box': {
          'selected': {
            'medianStroke': '#fafafa',
            'stemStroke': '#fafafa',
            'whiskerStroke': '#fafafa',
            'outlierMarkers': {
              'enabled': null,
              'size': 4,
              'fill': '#fafafa',
              'stroke': '#fafafa'
            }
          }
        }
      }
    },
    'pieFunnelPyramidBase': {
      'normal': {
        'labels': {
          'fontColor': null
        }
      },
      'selected': {
        'stroke': '1.5 #fafafa'
      },
      'connectorStroke': '#84707C',
      'outsideLabels': {'autoColor': '#d7cacc'},
      'insideLabels': {'autoColor': '#37474f'}
    },
    'map': {
      'unboundRegions': {'enabled': true, 'fill': '#37474f', 'stroke': '#455a64'},
      'defaultSeriesSettings': {
        'base': {
          'normal': {
            'stroke': returnLightenSourceColor,
            'labels': {
              'fontColor': '#212121'
            }
          },
          'hovered': {
            'fill': '#bdbdbd'
          },
          'selected': {
            'fill': '3 #fafafa'
          }
        },
        'connector': {
          'normal': {
            'markers': {
              'stroke': '1.5 #37474f'
            }
          },
          'hovered': {
            'markers': {
              'stroke': '1.5 #37474f'
            }
          },
          'selected': {
            'stroke': '1.5 #fafafa',
            'markers': {
              'fill': '#fafafa',
              'stroke': '1.5 #37474f'
            }
          }
        },
        'marker': {
          'normal': {
            'labels': {
              'fontColor': '#d7cacc'
            }
          }
        }
      }
    },
    'sparkline': {
      'padding': 0,
      'background': {'stroke': '#263238'},
      'defaultSeriesSettings': {
        'area': {
          'stroke': '1.5 #f8bbd0',
          'fill': '#f8bbd0 0.5'
        },
        'column': {
          'fill': '#f8bbd0',
          'negativeFill': '#d81b60'
        },
        'line': {
          'stroke': '1.5 #f8bbd0'
        },
        'winLoss': {
          'fill': '#f8bbd0',
          'negativeFill': '#d81b60'
        }
      }
    },
    'bullet': {
      'background': {'stroke': '#263238'},
      'defaultMarkerSettings': {
        'fill': '#f8bbd0',
        'stroke': '2 #f8bbd0'
      },
      'padding': {'top': 5, 'right': 10, 'bottom': 5, 'left': 10},
      'margin': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
      'rangePalette': {
        'items': ['#4D6570', '#445963', '#3B4D56', '#34444C', '#2D3B42']
      }
    },
    'heatMap': {
      'normal': {
        'stroke': '1 #263238',
        'labels': {
          'fontColor': '#212121'
        }
      },
      'hovered': {
        'stroke': '1.5 #263238'
      },
      'selected': {
        'stroke': '2 #fafafa',
        'labels': {
          'fontColor': '#fafafa'
        }
      }
    },
    'treeMap': {
      'normal': {
        'headers': {
          'background': {
            'enabled': true,
            'fill': '#37474f',
            'stroke': '#455a64'
          }
        },
        'labels': {
          'fontColor': '#212121'
        },
        'stroke': '#455a64'
      },
      'hovered': {
        'headers': {
          'fontColor': '#d7cacc',
          'background': {
            'fill': '#455a64',
            'stroke': '#455a64'
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
            'fill': '#655B66 0.3',
            'stroke': '#655B66'
          }
        }
      },
      'scroller': {
        'fill': 'none',
        'selectedFill': '#655B66 0.3',
        'outlineStroke': '#655B66',
        'defaultSeriesSettings': {
          'base': {
            'selected': {
              'stroke': returnSourceColor60,
              'fill': returnSourceColor60
            }
          },
          'lineLike': {
            'selected': {
              'stroke': returnSourceColor60
            }
          },
          'areaLike': {
            'selected': {
              'stroke': returnSourceColor60,
              'fill': returnSourceColor60
            }
          },
          'marker': {
            'selected': {
              'stroke': returnSourceColor60
            }
          },
          'candlestick': {
            'normal': {
              'risingFill': stockScrollerUnselected,
              'risingStroke': stockScrollerUnselected,
              'fallingFill': stockScrollerUnselected,
              'fallingStroke': stockScrollerUnselected
            },
            'selected': {
              'risingStroke': returnSourceColor60,
              'fallingStroke': returnSourceColor60,
              'risingFill': returnSourceColor60,
              'fallingFill': returnSourceColor60
            }
          },
          'hollowcandles': {
            'normal': {
              'risingFill': stockScrollerUnselected,
              'risingStroke': stockScrollerUnselected,
              'fallingFill': stockScrollerUnselected,
              'fallingStroke': stockScrollerUnselected
            },
            'selected': {
              'risingStroke': returnSourceColor60,
              'fallingStroke': returnSourceColor60,
              'risingFill': returnSourceColor60,
              'fallingFill': returnSourceColor60
            }
          },
          'ohlc': {
            'normal': {
              'risingStroke': stockScrollerUnselected,
              'fallingStroke': stockScrollerUnselected
            },
            'selected': {
              'risingStroke': returnSourceColor60,
              'fallingStroke': returnSourceColor60
            }
          }
        }
      }
    }
  };
}).call(this);
