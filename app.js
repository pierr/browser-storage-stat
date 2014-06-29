console.info('Application test.');


//Repeat the string pattern.
String.prototype.repeat = function(num) {
  return new Array(num + 1).join(this);
};

//Guid function.
var guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  };
})();

function toObject(arr) {
  var rv = {};
  for (var i = 0; i < arr.length; ++i)
    rv[arr[i].name] = arr[i].value;
  return rv;
}
var util = {};
util.json = {
  replacer: function(match, pIndent, pKey, pVal, pEnd) {
    var key = '<span class=json-key>';
    var val = '<span class=json-value>';
    var str = '<span class=json-string>';
    var r = pIndent || '';
    if (pKey)
      r = r + key + pKey.replace(/[": ]/g, '') + '</span>: ';
    if (pVal)
      r = r + (pVal[0] == '"' ? str : val) + pVal + '</span>';
    return r + (pEnd || '');
  },
  prettyPrint: function(obj) {
    var jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/mg;
    return JSON.stringify(obj, null, 3)
      .replace(/&/g, '&amp;').replace(/\\"/g, '&quot;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(jsonLine, util.json.replacer);
  }
};



function renderNotification(message) {
  $('#notifications').html("<div class='alert bg-" + message.type + "'>" + message.text + "</div>");
}
/**
 * Popule le local storage.
 * @param  object The datas to save in the local storage.
 * @return void  affiche un message d'erreur ou de succès.
 */
function populateLocalStorage(data) {
  localStorage.clear();
  $('#notifications').html({
    type: "info",
    text: 'En cours de traitement ...'
  });
  data = data || {};
  var json;
  try {
    json = jQuery.parseJSON(data.singleElt);
  } catch (e) {
    renderNotification({
      type: "danger",
      text: "Le text inséré n'est pas un JSON valide."
    });
    return "";
  }

  var coeff = Math.floor(1 + ((data.ajustment || 0) / 100)) + 1;
  //Increase the json size.
  var nbProp = 0;
  for (var prop in json) {
    var stringJson = "" + json[prop];
    json[prop] = stringJson.repeat(stringJson.length * coeff);
    nbProp++;
  }
  var remainingProp = Math.abs(data.ppte - nbProp);
  for (var j = 0; j < remainingProp; j++) {
    json[guid()] = guid() + guid() + guid() + guid();
  }
  var stringifyJSON = JSON.stringify(json);
  var limit = 0;
  for (var i = 0; i < +(data.nbObject || 0); i++) {
    try {
      localStorage.setItem(guid(), stringifyJSON);
    } catch (e) {
      console.log("LIMIT REACHED: (" + i + ")");
      limit = i;
      break;
    }
  }
  var message = function() {
    if (limit === 0) {
      return {
        type: "success",
        text: "La limite n'est pas atteinte, vous pouvez stocker <kbd>" + data.nbObject + "</kbd> objets de longeur moyenne: <kbd>" + stringifyJSON.length + "</kbd> sans problèmes. La taille de l'espace occupé ess <kbd>" + processLocalStorageSize() + "</kbd>"
      };
    } else {
      return {
        type: "danger",
        text: 'La limite est de <kbd>' + limit + "</kbd> objets de longeur textuelle moyenne de <kbd>" + stringifyJSON.length + "</kbd>. La taille de l'espace occupé ess <kbd>" + processLocalStorageSize() + "</kbd>"
      };
    }
  }();
  renderNotification(message);
  $('#codeContainer').html(util.json.prettyPrint(json));
}
/* Process the occupied size in the local storage.
 * @return {[type]} [description]
 */
function processLocalStorageSize() {
  var total = 0;
  for (var x in localStorage) {
    total += (localStorage[x].length * 2) / 1024 / 1024;
    //console.log(x + " = " + amount.toFixed(2) + " MB");
  }
  return total.toFixed(2) + " MB";
}

//Main function.
$(function() {
  
  //Update the slider label.
  $('input[name="ajustment"]').on('change', function(e) {
    $('label[for="ajustment"]').html(e.target.value);
  });
  
  $('input[name="ppte"]').on('change', function(e) {
    $('label[for="ppte"]').html(e.target.value);
  });

  //Submit form event.
  $('form').on('submit', function(e) {
    e.preventDefault();
    var data = $(this).serializeArray();
    populateLocalStorage(toObject(data));
  });
});