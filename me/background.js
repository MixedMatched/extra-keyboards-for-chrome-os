/*
Copyright 2014 Google Inc. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
var AltGr = { PLAIN: "plain", ALTERNATE: "alternate" };
var Shift = { PLAIN: "plain", SHIFTED: "shifted" };

var contextID = -1;
var altGrState = AltGr.PLAIN;
var shiftState = Shift.PLAIN;
var lastRemappedKeyEvent = undefined;

var lut = {
"Digit1": { "plain": {"plain": "1", "shifted": "!"}, "alternate": {"plain": "", "shifted":""}, "code": "Digit1"},
"Digit2": { "plain": {"plain": "2", "shifted": "@"}, "alternate": {"plain": "", "shifted":""}, "code": "Digit2"},
"Digit3": { "plain": {"plain": "3", "shifted": "#"}, "alternate": {"plain": "", "shifted":""}, "code": "Digit3"},
"Digit4": { "plain": {"plain": "4", "shifted": "$"}, "alternate": {"plain": "", "shifted":""}, "code": "Digit4"},
"Digit5": { "plain": {"plain": "5", "shifted": "%"}, "alternate": {"plain": "", "shifted":""}, "code": "Digit5"},
"Digit6": { "plain": {"plain": "6", "shifted": "^"}, "alternate": {"plain": "", "shifted":""}, "code": "Digit6"},
"Digit7": { "plain": {"plain": "7", "shifted": "&"}, "alternate": {"plain": "", "shifted":""}, "code": "Digit7"},
"Digit8": { "plain": {"plain": "8", "shifted": "*"}, "alternate": {"plain": "", "shifted":""}, "code": "Digit8"},
"Digit9": { "plain": {"plain": "9", "shifted": "("}, "alternate": {"plain": "", "shifted":""}, "code": "Digit9"},
"Digit0": { "plain": {"plain": "0", "shifted": ")"}, "alternate": {"plain": "", "shifted":""}, "code": "Digit0"},
"Minus": { "plain": {"plain": "-", "shifted": "_"}, "alternate": {"plain": "", "shifted":""}, "code": "Minus"},
"Equal": { "plain": {"plain": "=", "shifted": "+"}, "alternate": {"plain": "", "shifted":""}, "code": "Equal"},
"KeyQ": { "plain": {"plain": "", "shifted": ""}, "alternate": {"plain": "", "shifted":""}, "code": ""},
"KeyW": { "plain": {"plain": "", "shifted": ""}, "alternate": {"plain": "", "shifted":""}, "code": ""},
"KeyE": { "plain": {"plain": "", "shifted": ""}, "alternate": {"plain": "", "shifted":""}, "code": ""},
"KeyR": { "plain": {"plain": "⚮", "shifted": "⚮"}, "alternate": {"plain": "", "shifted":""}, "code": "Key⚮"},
"KeyT": { "plain": {"plain": "t", "shifted": "t"}, "alternate": {"plain": "", "shifted":""}, "code": "KeyT"},
"KeyY": { "plain": {"plain": "g", "shifted": "g"}, "alternate": {"plain": "", "shifted":""}, "code": "KeyG"},
"KeyU": { "plain": {"plain": "r", "shifted": "r"}, "alternate": {"plain": "", "shifted":""}, "code": "KeyR"},
"KeyI": { "plain": {"plain": "", "shifted": ""}, "alternate": {"plain": "", "shifted":""}, "code": ""},
"KeyO": { "plain": {"plain": "", "shifted": ""}, "alternate": {"plain": "", "shifted":""}, "code": ""},
"KeyP": { "plain": {"plain": "", "shifted": ""}, "alternate": {"plain": "", "shifted":""}, "code": ""},
"BracketLeft": { "plain": {"plain": "[", "shifted": "{"}, "alternate": {"plain": "", "shifted":""}, "code": "BracketLeft"},
"BracketRight": { "plain": {"plain": "]", "shifted": "}"}, "alternate": {"plain": "", "shifted":""}, "code": "BracketRight"},
"KeyA": { "plain": {"plain": "f", "shifted": "f"}, "alternate": {"plain": "", "shifted":""}, "code": "KeyF"},
"KeyS": { "plain": {"plain": "m", "shifted": "m"}, "alternate": {"plain": "", "shifted":""}, "code": "KeyS"},
"KeyD": { "plain": {"plain": "v", "shifted": "v"}, "alternate": {"plain": "", "shifted":""}, "code": "Keyv"},
"KeyF": { "plain": {"plain": "⋞", "shifted": "⋞"}, "alternate": {"plain": "", "shifted":""}, "code": "Key⋞"},
"KeyG": { "plain": {"plain": "k", "shifted": "k"}, "alternate": {"plain": "", "shifted":""}, "code": "KeyK"},
"KeyH": { "plain": {"plain": "b", "shifted": "b"}, "alternate": {"plain": "", "shifted":""}, "code": "KeyB"},
"KeyJ": { "plain": {"plain": "e", "shifted": "e"}, "alternate": {"plain": "", "shifted":""}, "code": "KeyE"},
"KeyK": { "plain": {"plain": "∻", "shifted": "∻"}, "alternate": {"plain": "", "shifted":""}, "code": "Key∻"},
"KeyL": { "plain": {"plain": "⊁", "shifted": "⊁"}, "alternate": {"plain": "", "shifted":""}, "code": "Key⊁"},
"Semicolon": { "plain": {"plain": ";", "shifted": ":"}, "alternate": {"plain": "", "shifted":""}, "code": "Semicolon"},
"Quote": { "plain": {"plain": "'", "shifted": "\""}, "alternate": {"plain": "", "shifted":""}, "code": "Quote"},
"KeyZ": { "plain": {"plain": "", "shifted": ""}, "alternate": {"plain": "", "shifted":""}, "code": ""},
"KeyX": { "plain": {"plain": "", "shifted": ""}, "alternate": {"plain": "", "shifted":""}, "code": ""},
"KeyC": { "plain": {"plain": "", "shifted": ""}, "alternate": {"plain": "", "shifted":""}, "code": ""},
"KeyV": { "plain": {"plain": "", "shifted": ""}, "alternate": {"plain": "", "shifted":""}, "code": ""},
"KeyB": { "plain": {"plain": "", "shifted": ""}, "alternate": {"plain": "", "shifted":""}, "code": ""},
"KeyN": { "plain": {"plain": "", "shifted": ""}, "alternate": {"plain": "", "shifted":""}, "code": ""},
"KeyM": { "plain": {"plain": "", "shifted": ""}, "alternate": {"plain": "", "shifted":""}, "code": ""},
"Comma": { "plain": {"plain": ",", "shifted": "<"}, "alternate": {"plain": "", "shifted":""}, "code": "Comma"},
"Period": { "plain": {"plain": ".", "shifted": ">"}, "alternate": {"plain": "", "shifted":""}, "code": "Period"},
"Slash": { "plain": {"plain": "/", "shifted": "?"}, "alternate": {"plain": "", "shifted":""}, "code": "Slash"},
};
    

chrome.input.ime.onFocus.addListener(function(context) {
  contextID = context.contextID;
});

function updateAltGrState(keyData) {
  altGrState = (keyData.code == "AltRight") ? ((keyData.type == "keydown") ? AltGr.ALTERNATE : AltGr.PLAIN)
                                              : altGrState;
}

function updateShiftState(keyData) {
  shiftState = ((keyData.shiftKey && !(keyData.capsLock)) || (!(keyData.shiftKey) && keyData.capsLock)) ? 
                 Shift.SHIFTED : Shift.PLAIN;
}

function isPureModifier(keyData) {
  return (keyData.key == "Shift") || (keyData.key == "Ctrl") || (keyData.key == "Alt");
}

function isRemappedEvent(keyData) {
  // hack, should check for a sender ID (to be added to KeyData)
  return lastRemappedKeyEvent != undefined &&
         (lastRemappedKeyEvent.key == keyData.key &&
          lastRemappedKeyEvent.code == keyData.code &&
          lastRemappedKeyEvent.type == keyData.type
         ); // requestID would be different so we are not checking for it  
}


chrome.input.ime.onKeyEvent.addListener(
    function(engineID, keyData) {
      var handled = false;
      
      if (isRemappedEvent(keyData)) {
        lastRemappedKeyEvent = undefined;
        return handled;
      }

      updateAltGrState(keyData);
      updateShiftState(keyData);
                
      if (lut[keyData.code]) {
          var remappedKeyData = keyData;
          remappedKeyData.key = lut[keyData.code][altGrState][shiftState];
          remappedKeyData.code = lut[keyData.code].code;
        
        if (chrome.input.ime.sendKeyEvents != undefined) {
          chrome.input.ime.sendKeyEvents({"contextID": contextID, "keyData": [remappedKeyData]});
          handled = true;
          lastRemappedKeyEvent = remappedKeyData;
        } else if (keyData.type == "keydown" && !isPureModifier(keyData)) {
          chrome.input.ime.commitText({"contextID": contextID, "text": remappedKeyData.key});
          handled = true;
        }
      }
      
      return handled;
});
