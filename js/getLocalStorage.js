
var values = [];
var keys = Object.keys(localStorage);

for (var i = keys.length - 1; i >= 0; i--) {
  var key = keys[i];
  var value = localStorage[key];
  values.push(value);
}

values;
