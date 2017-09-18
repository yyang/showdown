showdown.subParser('emoticons', function (text, options, globals) {
  'use strict';

  text = globals.converter._dispatch('emoticons.before', text, options, globals);

  // Parse emoticons
  text = text.replace(/:(\S*):/g, function (wm, m) {
    var supportedEmoticons = ['smile', 'sad', 'cheeky', 'laugh', 'wink', 'thumbs-up', 'thumbs-down', 'information', 'tick', 'cross', 'warning'];
    return supportedEmoticons.indexOf(m) === -1 ? wm : '<ac:emoticon ac:name="' + m + '" />';
  });

  text = globals.converter._dispatch('emoticons.after', text, options, globals);

  return text;
});
