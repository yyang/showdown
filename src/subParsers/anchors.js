/**
 * Turn Markdown link shortcuts into XHTML <a> tags.
 */
showdown.subParser('anchors', function (text, options, globals) {
  'use strict';

  text = globals.converter._dispatch('anchors.before', text, options, globals);

  var writeAnchorTag = function (wholeMatch, linkText, linkId, url, m5, m6, title) {
    if (showdown.helper.isUndefined(title)) {
      title = '';
    }
    linkId = linkId.toLowerCase();

    // Special case for explicit empty url
    if (wholeMatch.search(/\(<?\s*>? ?(['"].*['"])?\)$/m) > -1) {
      url = '';
    } else if (!url) {
      if (!linkId) {
        // lower-case and turn embedded newlines into spaces
        linkId = linkText.toLowerCase().replace(/ ?\n/g, ' ');
      }
      url = '#' + linkId;

      if (!showdown.helper.isUndefined(globals.gUrls[linkId])) {
        url = globals.gUrls[linkId];
        if (!showdown.helper.isUndefined(globals.gTitles[linkId])) {
          title = globals.gTitles[linkId];
        }
      } else {
        return wholeMatch;
      }
    }

    //url = showdown.helper.escapeCharacters(url, '*_', false); // replaced line to improve performance
    url = url.replace(showdown.helper.regexes.asteriskAndDash, showdown.helper.escapeCharactersCallback);

    var result = '<a href="' + url + '"';

    if (title !== '' && title !== null) {
      title = title.replace(/"/g, '&quot;');
      //title = showdown.helper.escapeCharacters(title, '*_', false); // replaced line to improve performance
      title = title.replace(showdown.helper.regexes.asteriskAndDash, showdown.helper.escapeCharactersCallback);
      result += ' title="' + title + '"';
    }

    if (options.openLinksInNewWindow) {
      // escaped _
      result += ' target="¨E95Eblank"';
    }

    result += '>' + linkText + '</a>';

    return result;
  };

  var writeWikiAnchorTag = function (wholeMatch, prefix, linkText, pageTitle, pageAnchor, attachmentName) {
    var linkTarget = '',
        linkBody = '',
        link = '';

    // Handles traditional case
    // [Google|www.google.com]
    var strictUrlRgx = /^((?:https?:)?\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    var urlRgx = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    var mailtoRgx = /^mailto\:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

    if (urlRgx.test(pageTitle) || mailtoRgx.test(pageTitle)) {
      return prefix + writeAnchorTag(wholeMatch, linkText, '', pageTitle);
    } else if (urlRgx.test(linkText) || mailtoRgx.test(linkText)) {
      return prefix + writeAnchorTag(wholeMatch, linkText, '', linkText);
    }

    // Compose Link Target
    // <ri:attachment ri:filename="atlassian_logo.gif" />
    // <ri:page ri:content-title="pagetitle"/>
    if (attachmentName) {
      linkTarget = '<ri:attachment ri:filename="' + attachmentName + '" />';
    } else {
      linkTarget = '<ri:page ri:content-title="' + (pageTitle || linkText) + '"/>';
    }

    // Compose Link Body
    if (/^!.+!$/.test(linkText)) {
      var image = /^!(.+)!$/.exec(linkText)[1];

      linkBody += '<ac:image>\n';
      if (strictUrlRgx.test(image)) {
        linkBody += '<ri:url ri:value="' + image + '" />\n';
      } else {
        linkBody += '<ri:attachment ri:filename="' + image + '" />\n';
      }
      linkBody += '</ac:image>';
    } else {
      linkBody = '<ac:plain-text-link-body>\n  <![CDATA[' + linkText + ']]>\n</ac:plain-text-link-body>';
    }

    // Compose Link
    if (pageAnchor) {
      link += '<ac:link ac:anchor="' + pageAnchor + '">\n';
    } else {
      link += '<ac:link>\n';
    }
    link += linkTarget + '\n' + linkBody + '\n</ac:link>';

    return prefix + link;
  };

  // First, handle reference-style links: [link text] [id]
  text = text.replace(/\[((?:\[[^\]]*]|[^\[\]])*)] ?(?:\n *)?\[(.*?)]()()()()/g, writeAnchorTag);

  // Next, inline-style links: [link text](url "optional title")
  // cases with crazy urls like ./image/cat1).png
  text = text.replace(/\[((?:\[[^\]]*]|[^\[\]])*)]()[ \t]*\([ \t]?<([^>]*)>(?:[ \t]*((["'])([^"]*?)\5))?[ \t]?\)/g,
    writeAnchorTag);

  // normal cases
  text = text.replace(/\[((?:\[[^\]]*]|[^\[\]])*)]()[ \t]*\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?:[ \t]*((["'])([^"]*?)\5))?[ \t]?\)/g,
                      writeAnchorTag);

  // handle confluence wiki style shortcuts:
  //   [link text|page name#anchor] or
  //   [link text|www.google.com] or
  //   [attachment link^attachmentname.zip]
  // These must come last in case you've also got [link test][1]
  // or [link test](/foo)
  text = text.replace(/(^|[^!])\[([^|#\^\]]{2,})(?:(?:\|([^|#\^]+)(?:#([^|#\^\]]+))?)|\^([^|#\^\]]+))?]/g, writeWikiAnchorTag);

  // Lastly handle GithubMentions if option is enabled
  if (options.ghMentions) {
    text = text.replace(/(^|\s)(\\)?(@([a-z\d\-]+))(?=[.!?;,[\]()]|\s|$)/gmi, function (wm, st, escape, mentions, username) {
      if (escape === '\\') {
        return st + mentions;
      }

      //check if options.ghMentionsLink is a string
      if (!showdown.helper.isString(options.ghMentionsLink)) {
        throw new Error('ghMentionsLink option must be a string');
      }
      var lnk = options.ghMentionsLink.replace(/\{u}/g, username),
          target = '';
      if (options.openLinksInNewWindow) {
        target = ' target="¨E95Eblank"';
      }
      return st + '<a href="' + lnk + '"' + target + '>' + mentions + '</a>';
    });
  }

  text = globals.converter._dispatch('anchors.after', text, options, globals);
  return text;
});
