"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Format;
(function (Format) {
  Format["Currency"] = "currency";
  Format["Percentage"] = "percentage";
  Format["Email"] = "email";
  Format["Url"] = "url";
  Format["Phone"] = "phone";
  Format["Fax"] = "fax";
  Format["IPv4"] = "ipv4";
  Format["IPv6"] = "ipv6";
})(Format = exports.Format || (exports.Format = {}));
var resources = (function () {
  function resources() {
  }
  resources.removePhoneFormat = function (phone) {
    if (phone) {
      return phone.replace(resources._preg, '');
    }
    return phone;
  };
  resources.removeFaxFormat = function (fax) {
    if (fax) {
      return fax.replace(resources._preg, '');
    }
    return fax;
  };
  resources._preg = / |\-|\.|\(|\)/g;
  resources.format1 = / |,|\$|€|£|¥|'|٬|،| /g;
  resources.format2 = / |\.|\$|€|£|¥|'|٬|،| /g;
  resources.getCurrency = null;
  resources.formatNumber = null;
  resources.formatPhone = null;
  resources.formatFax = null;
  return resources;
}());
exports.resources = resources;
var _datereg = '/Date(';
var _re = /-?\d+/;
function toDate(v) {
  if (!v || v === '') {
    return null;
  }
  if (v instanceof Date) {
    return v;
  }
  else if (typeof v === 'number') {
    return new Date(v);
  }
  var i = v.indexOf(_datereg);
  if (i >= 0) {
    var m = _re.exec(v);
    var d = parseInt(m[0], null);
    return new Date(d);
  }
  else {
    if (isNaN(v)) {
      return new Date(v);
    }
    else {
      var d = parseInt(v, null);
      return new Date(d);
    }
  }
}
function jsonToDate(obj, fields) {
  if (!obj || !fields) {
    return obj;
  }
  if (!Array.isArray(obj)) {
    for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
      var field = fields_1[_i];
      var val = obj[field];
      if (val && !(val instanceof Date)) {
        obj[field] = toDate(val);
      }
    }
  }
}
function json(obj, m, loc, cur) {
  jsonToDate(obj, m.dates);
  if (resources.removePhoneFormat && m.phones && m.phones.length > 0) {
    for (var _i = 0, _a = m.phones; _i < _a.length; _i++) {
      var p = _a[_i];
      var v = obj[p];
      if (v) {
        obj[p] = resources.removePhoneFormat(v);
      }
    }
  }
  if (resources.removeFaxFormat && m.faxes && m.faxes.length > 0) {
    for (var _b = 0, _c = m.faxes; _b < _c.length; _b++) {
      var p = _c[_b];
      var v = obj[p];
      if (v) {
        obj[p] = resources.removeFaxFormat(v);
      }
    }
  }
  var r1 = resources.format1;
  var r2 = resources.format2;
  if (m.integers) {
    if (loc && loc.decimalSeparator !== '.') {
      for (var _d = 0, _e = m.integers; _d < _e.length; _d++) {
        var p = _e[_d];
        var v = obj[p];
        if (v) {
          v = '' + v;
          v = v.replace(r2, '');
          if (v.indexOf(loc.decimalSeparator) >= 0) {
            v = v.replace(loc.decimalSeparator, '.');
          }
          if (!isNaN(v)) {
            obj[p] = parseFloat(v);
          }
        }
      }
    }
    else {
      for (var _f = 0, _g = m.integers; _f < _g.length; _f++) {
        var p = _g[_f];
        var v = obj[p];
        if (v) {
          v = '' + v;
          v = v.replace(r1, '');
          if (!isNaN(v)) {
            obj[p] = parseFloat(v);
          }
        }
      }
    }
  }
  if (m.numbers) {
    if (loc && loc.decimalSeparator !== '.') {
      for (var _h = 0, _j = m.numbers; _h < _j.length; _h++) {
        var p = _j[_h];
        var v = obj[p];
        if (v) {
          v = '' + v;
          v = v.replace(r2, '');
          if (v.indexOf(loc.decimalSeparator) >= 0) {
            v = v.replace(loc.decimalSeparator, '.');
          }
          if (v.indexOf('%') >= 0) {
            var attr = m.model.attributes[p];
            if (attr.format === Format.Percentage) {
              v = v.replace('%', '');
            }
          }
          if (!isNaN(v)) {
            obj[p] = parseFloat(v);
          }
        }
      }
    }
    else {
      for (var _k = 0, _l = m.numbers; _k < _l.length; _k++) {
        var p = _l[_k];
        var v = obj[p];
        if (v) {
          v = '' + v;
          v = v.replace(r1, '');
          if (v.indexOf('%') >= 0) {
            var attr = m.model.attributes[p];
            if (attr.format === Format.Percentage) {
              v = v.replace('%', '');
            }
          }
          if (!isNaN(v)) {
            obj[p] = parseFloat(v);
          }
        }
      }
    }
  }
  if (m.currencies) {
    if (cur) {
      cur = cur.toUpperCase();
    }
    if (loc && loc.decimalSeparator !== '.') {
      for (var _m = 0, _o = m.currencies; _m < _o.length; _m++) {
        var p = _o[_m];
        var v = obj[p];
        if (v) {
          v = '' + v;
          if (resources.getCurrency && cur) {
            var currency = resources.getCurrency(cur);
            if (currency && v.indexOf(currency.currencySymbol) >= 0) {
              v = v.replace(currency.currencySymbol, '');
            }
          }
          if (loc && v.indexOf(loc.currencySymbol) >= 0) {
            v = v.replace(loc.currencySymbol, '');
          }
          v = v.replace(r2, '');
          if (v.indexOf(loc.decimalSeparator) >= 0) {
            v = v.replace(loc.decimalSeparator, '.');
          }
          if (!isNaN(v)) {
            obj[p] = parseFloat(v);
          }
        }
      }
    }
    else {
      for (var _p = 0, _q = m.currencies; _p < _q.length; _p++) {
        var p = _q[_p];
        var v = obj[p];
        if (v) {
          v = '' + v;
          v = v.replace(r1, '');
          if (resources.getCurrency && cur) {
            var currency = resources.getCurrency(cur);
            if (currency && v.indexOf(currency.currencySymbol) >= 0) {
              v = v.replace(currency.currencySymbol, '');
            }
          }
          if (loc && v.indexOf(loc.currencySymbol) >= 0) {
            v = v.replace(loc.currencySymbol, '');
          }
          if (!isNaN(v)) {
            obj[p] = parseFloat(v);
          }
        }
      }
    }
  }
  if (m.objects) {
    for (var _r = 0, _s = m.objects; _r < _s.length; _r++) {
      var objectField = _s[_r];
      if (obj[objectField.attributeName]) {
        json(obj[objectField.attributeName], objectField, loc, cur);
      }
    }
  }
  if (m.arrays) {
    for (var _t = 0, _u = m.arrays; _t < _u.length; _t++) {
      var arrayField = _u[_t];
      if (obj[arrayField.attributeName]) {
        var arr = obj[arrayField.attributeName];
        if (Array.isArray(arr)) {
          for (var _v = 0, arr_1 = arr; _v < arr_1.length; _v++) {
            var a = arr_1[_v];
            json(a, arrayField, loc, cur);
          }
        }
      }
    }
  }
}
exports.json = json;
function format(obj, m, loc, cur, includingCurrencySymbol) {
  if (includingCurrencySymbol === void 0) { includingCurrencySymbol = false; }
  if (resources.formatPhone && m.phones) {
    for (var _i = 0, _a = m.phones; _i < _a.length; _i++) {
      var p = _a[_i];
      var v = obj[p];
      if (v) {
        obj[p] = resources.formatPhone(v);
      }
    }
  }
  if (resources.formatFax && m.faxes) {
    for (var _b = 0, _c = m.faxes; _b < _c.length; _b++) {
      var p = _c[_b];
      var v = obj[p];
      if (v) {
        obj[p] = resources.formatFax(v);
      }
    }
  }
  if (resources.formatNumber) {
    if (m.integers) {
      for (var _d = 0, _e = m.integers; _d < _e.length; _d++) {
        var p = _e[_d];
        var v = obj[p];
        if (v && !isNaN(v)) {
          var attr = m.model.attributes[p];
          if (attr && !attr.noformat) {
            obj[p] = resources.formatNumber(v, attr.scale, loc);
          }
        }
      }
    }
    if (m.numbers) {
      for (var _f = 0, _g = m.numbers; _f < _g.length; _f++) {
        var p = _g[_f];
        var v = obj[p];
        if (v && !isNaN(v)) {
          var attr = m.model.attributes[p];
          if (attr && !attr.noformat) {
            var z = resources.formatNumber(v, attr.scale, loc);
            if (attr.format === Format.Percentage) {
              z = z + '%';
            }
            obj[p] = z;
          }
        }
      }
    }
    if (m.currencies) {
      for (var _h = 0, _j = m.currencies; _h < _j.length; _h++) {
        var p = _j[_h];
        var v = obj[p];
        if (v && !isNaN(v)) {
          var attr = m.model.attributes[p];
          if (attr && !attr.noformat && (cur || attr.scale)) {
            var scale = attr.scale;
            var currency = void 0;
            if (resources.getCurrency && cur) {
              currency = resources.getCurrency(cur);
              if (currency) {
                scale = currency.decimalDigits;
              }
            }
            if (scale && currency) {
              var v2 = resources.formatNumber(v, scale, loc);
              if (loc && includingCurrencySymbol) {
                var symbol = (loc.currencyCode === cur ? loc.currencySymbol : currency.currencySymbol);
                switch (loc.currencyPattern) {
                  case 0:
                    v2 = symbol + v2;
                    break;
                  case 1:
                    v2 = '' + v2 + symbol;
                    break;
                  case 2:
                    v2 = symbol + ' ' + v2;
                    break;
                  case 3:
                    v2 = '' + v2 + ' ' + symbol;
                    break;
                  default:
                    break;
                }
              }
              obj[p] = v2;
            }
          }
        }
      }
    }
  }
  if (m.objects && m.objects.length > 0) {
    for (var _k = 0, _l = m.objects; _k < _l.length; _k++) {
      var p = _l[_k];
      var v = obj[p.attributeName];
      if (v) {
        format(v, p, loc, cur, includingCurrencySymbol);
      }
    }
  }
  if (m.arrays) {
    for (var _m = 0, _o = m.arrays; _m < _o.length; _m++) {
      var p = _o[_m];
      var arr = obj[p.attributeName];
      if (arr && Array.isArray(arr)) {
        for (var _p = 0, arr_2 = arr; _p < arr_2.length; _p++) {
          var a = arr_2[_p];
          format(a, p, loc, cur, includingCurrencySymbol);
        }
      }
    }
  }
}
exports.format = format;
