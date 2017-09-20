var bootstrap = require('../bootstrap.js'),
    converter = new bootstrap.showdown.Converter(),
    assertion = bootstrap.assertion,
    testsuite = bootstrap.getTestSuite('test/cases/');

describe('makeHtml() standard testsuite', function () {
  'use strict';
  for (var i = 0; i < testsuite.length; ++i) {

    if (testsuite[i].name === 'inline-anchors') {
      converter = new bootstrap.showdown.Converter({jiraLink: {
        macroId: '00000000-0000-0000-0000-000000000000',
        jiraServer: 'JIRA Server',
        jiraServerId: '11111111-1111-1111-1111-111111111111'
      }});
    }

    it(testsuite[i].name.replace(/-/g, ' '), assertion(testsuite[i], converter));
  }
});
