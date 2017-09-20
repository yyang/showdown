Comparing Markdown and Confluence Storage Format
=================================================

Confluence Storage Format is more comprehensive and supports additional features than markdown documentation. Therefore a few features requires hacking the original markdown file or modifying the parser.

## Supported with Hack

The following features are supported by _Confluence Storage Format_ but optionally supported or not supported by markdown / showdown.

#### 1. Strikethrough
* Markdown Supported: Optional
* Syntax: `~~strikethrough text~~
* Solution: Set `{strikethrough: true}` in options

#### 2. Underline
* Markdown Supported: No
* Solution: Use `<u>underline text</u>`

#### 3. Superscript and Subscript
* Markdown Supported: No
* Solution: Use `<sub>subscript</sub>` or `<sup>superscript</sup>`

#### 4. Colored Text
* Markdown Supported: No
* Solution: Use `<span style="color: red;">red text</span>`

#### 5. Big or Small Text
* Markdown Supported: No
* Solution: Use `<big>big text</big>` or `<small>small text</small>`

#### 6. Center Aligned Paragraph
* Markdown Supported: No
* Solution: Use `<p style="text-align: center;">centered text</p>`

#### 7. Task Lists
* Markdown Supported: Optional, supports Github flavoured
* Syntax: same as Github
* Solution: Set `{tasklists: true}` in options
* Known Isuses: Paragraph might not render after the task list. Causing the test 164.4 to fail. Should put a new section afterwards.

#### 8. Links
* Markdown Supported: Yes
* The parser supports wiki-like syntax with this hack, which includes link toward certain page within current conlfuence SPACE. Other links may still hire `<a>` tag and behaves as usual.
* Syntax: slightly different from Markdown, with a few examples:
    1. `[www.google.com]` will be `<a href="www.google.com">www.google.com</a>` instead of `[<a href="www.google.com">www.google.com</a>]`;
    2. `[link name|www.google.com]` will be `<a href="www.google.com">link name</a>`;
    3. `[link name|page name#anchor]` will use Confluence Storage Format and link to page with name `page name` and jump to anchor `anchor`;
    4. Additionally, link to attachments are supported via `[attatchment link^attachment-name.zip]`, and it will also use the Confluence Storage Format to find such attatchment.
    5. Image syntax like `[!image.jpg!|image page]` is supported and will use `image.jpg` from space attatchment. Moreover, we can use external file.
* Additionally, JIRA links are supported through specific link syntax, aka [JIRA:PROJ-123]. This is enabled through the following settings:
    - Add `jiraLink` option while initiating converter instance.

The _jiraLink_ option:

```lang=javascript:
converter.setOption('jiraLink', {
  macroId: '00000000-0000-0000-0000-000000000000',
  jiraServer: 'JIRA Server',
  jiraServerId: '11111111-1111-1111-1111-111111111111'
});
```

#### 9. Images
* Markdown Supported: Yes
* The parser is slightly modified: when the image url contains `^\/\/.{3,}\..{2,}` we consider it an external source and use it as normal url. And when it doesn't contain such protocol related part we will search in attachments.
* Base64 images are stll using standard `<img>` tag.

#### 10. Emoticons
* Markdown Supported: No
* Solution: hacked, using `:smile:` syntax.

## NOT Supported

#### Page Layouts

Since I have no idea what does it do

#### Variables

Hmm.... We will not use variables.

#### Resource Identifiers

Please use raw XHTML.