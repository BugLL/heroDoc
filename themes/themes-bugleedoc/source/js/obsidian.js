/**
 * Hexo-obsidian-theme
 * @author Guo Xiang - @TriDiamond
 * @description Use for hexo obsidian theme
 */
//JSHint ingores
/* jshint -W093 */
/* jshint -W030 */
/* jshint -W119 */

/**
 * Watch the TOC during scroll and fill in active status
 * @param {} menuSelector
 * @param {*} options
 */
function scrollSpy(menuSelector, options) {
  var menu = $(menuSelector);
  if (!menu) return;
  options = options || {};
  var offset = options.offset || 0;
  var activeClassName = options.activeClassName || 'active';

  var scollTarget = $('.content :header').find('a.headerlink'),
    lastId = null,
    active = $();

  $(window).scroll(function () {
    // Get container scroll position
    var fromTop = $(this).scrollTop() + offset;

    // Get id of current scroll item
    var id =
      scollTarget
        .filter(function () {
          return $(this).offset().top < fromTop;
        })
        .last()
        .parent()
        .attr('id') || '';

    if (lastId !== id) {
      active.removeClass(activeClassName);
      var newActive = [];

      for (
        var target = menu.find('[href="#' + id + '"],[href="#' + encodeURIComponent(id) + '"]');
        target.length && !target.is(menu);
        target = target.parent()
      ) {
        if (target.is('li')) newActive.push(target[0]);
      }
      active = $(newActive).addClass(activeClassName).trigger('scrollspy');
      lastId = id;
    }
  });
}

/**
 * Utilise the background color to avoid scrolling flashes
 */
function utiliseBgColor() {
  setTimeout(function () {
    if ($('#single').length) {
      $('html').css('background', '#fff');
    } else {
      $('html').css('background', '#100e17');
    }
  }, 500);
}

/**
 * Building the caption html in an article
 */
function buildImgCaption() {
  var images = $('.content').find('img');
  var usedCaption = [];

  images.each(function () {
    var caption = $(this).attr('alt');
    if (caption !== '' && usedCaption.indexOf(caption) < 0) {
      $('.content')
        .find("[alt='" + caption + "']")
        .parent()
        .append('<p class="image-caption">"' + caption + '"</p>');
      usedCaption.push(caption);
    }
  });
}

var Home = location.href,
  Pages = 4,
  xhr,
  xhrUrl = '';

var Obsidian = {
  L: function (url, f, err) {
    if (url == xhrUrl) {
      return false;
    }
    xhrUrl = url;
    if (xhr) {
      xhr.abort();
    }
    xhr = $.ajax({
      type: 'GET',
      url: url,
      timeout: 10000,
      success: function (data) {
        f(data);
        xhrUrl = '';
      },
      error: function (a, b, c) {
        if (b == 'abort') {
          err && err();
        } else {
          window.location.href = url;
        }
        xhrUrl = '';
      },
    });
  },
  P: function () {
    return !!('ontouchstart' in window);
  },
  PS: function () {
    if (!(window.history && history.pushState)) {
      return;
    }
    history.replaceState(
      {
        u: Home,
        t: document.title,
      },
      document.title,
      Home
    );
    window.addEventListener('popstate', function (e) {
      var state = e.state;
      if (!state) return;
      document.title = state.t;

      if (state.u == Home) {
        $('#preview').css('position', 'fixed');
        setTimeout(function () {
          $('#preview').removeClass('show');
          $('#container').show();
          window.scrollTo(0, parseInt($('#container').data('scroll')));
          setTimeout(function () {
            $('#preview').html('');
            $(window).trigger('resize');
          }, 300);
        }, 0);
      } else {
        Obsidian.loading();
        Obsidian.L(state.u, function (data) {
          document.title = state.t;
          $('#preview').html($(data).filter('#single'));
          Obsidian.preview();
          setTimeout(function () {
            Obsidian.player();
          }, 0);
        });
      }
    });
  },
  HS: function (tag, flag) {
    var id = tag.data('id') || 0,
      url = tag.attr('href'),
      title = (tag.attr('title') || tag[0].innerText) + ' - ' + $('#config-title').text();

    if (!$('#preview').length || !(window.history && history.pushState)) location.href = url;
    Obsidian.loading();
    var state = {
      d: id,
      t: title,
      u: url,
    };
    Obsidian.L(url, function (data) {
      if (!$(data).filter('#single').length) {
        location.href = url;
        return;
      }
      switch (flag) {
        case 'push':
          history.pushState(state, title, url);
          $('#preview').html($(data).filter('#single'));
          break;
        case 'replace':
          history.replaceState(state, title, url);
          $('#preview').html($(data).filter('#single'));
          break;
      }
      document.title = title;
      $('#preview').html($(data).filter('#single'));
      switch (flag) {
        case 'push':
          Obsidian.preview();
          break;
        case 'replace':
          Obsidian.initArticleJs();
          window.scrollTo(0, 0);
          Obsidian.loaded();
          break;
      }
      setTimeout(function () {
        Obsidian.player();
        $('#top').show();
        comment = $('#gitalk-container');
        if (comment.data('ae') == true) {
          comment.click();
        }
      }, 0);
    });
  },
  preview: function () {
    // preview toggle
    $('#preview').one(
      'transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd',
      function () {
        var previewVisible = $('#preview').hasClass('show');
        if (!!previewVisible) {
          $('#container').hide();
        } else {
          $('#container').show();
        }
        Obsidian.loaded();
      }
    );
    setTimeout(function () {
      $('#preview').addClass('show');
      $('#container').data('scroll', window.scrollY);
      setTimeout(function () {
        $('body').removeClass('fixed');
        $('#preview').css({
          position: 'static',
          // 'overflow-y': 'auto'
        });
        Obsidian.initArticleJs();
      }, 500);
    }, 0);
  },
  player: function () {
    var p = $('#audio');
    if (!p.length) {
      $('.icon-play').css({
        color: '#dedede',
        cursor: 'not-allowed',
      });
      return;
    }
    var sourceSrc = $('#audio source').eq(0).attr('src');
    if (sourceSrc == '' && p[0].src == '') {
      audiolist = $('#audio-list li');
      mp3 = audiolist.eq([Math.floor(Math.random() * audiolist.length)]);
      p[0].src = mp3.data('url');
    }

    if (p.eq(0).data('autoplay') == true) {
      p[0].play();
    }

    p.on({
      timeupdate: function () {
        var progress = (p[0].currentTime / p[0].duration) * 100;
        $('.bar').css('width', progress + '%');
        if (progress / 5 <= 1) {
          p[0].volume = progress / 5;
        } else {
          p[0].volume = 1;
        }
      },
      ended: function () {
        $('.icon-pause').removeClass('icon-pause').addClass('icon-play');
      },
      playing: function () {
        $('.icon-play').removeClass('icon-play').addClass('icon-pause');
      },
    });
  },
  loading: function () {
    var w = window.innerWidth;
    var css =
      '<style class="loaderstyle" id="loaderstyle' +
      w +
      '">' +
      '@-moz-keyframes loader' +
      w +
      '{100%{background-position:' +
      w +
      'px 0}}' +
      '@-webkit-keyframes loader' +
      w +
      '{100%{background-position:' +
      w +
      'px 0}}' +
      '.loader' +
      w +
      '{-webkit-animation:loader' +
      w +
      ' 3s linear infinite;-moz-animation:loader' +
      w +
      ' 3s linear infinite;}' +
      '</style>';
    $('.loaderstyle').remove();
    $('head').append(css);
    $('#loader')
      .removeClass()
      .addClass('loader' + w)
      .show();
  },
  loaded: function () {
    $('#loader').removeClass().hide();
  },
  F: function (id, w, h) {
    var _height = $(id).parent().height(),
      _width = $(id).parent().width(),
      ratio = h / w;
    if (_height / _width > ratio) {
      id.style.height = _height + 'px';
      id.style.width = _height / ratio + 'px';
    } else {
      id.style.width = _width + 'px';
      id.style.height = _width * ratio + 'px';
    }
    id.style.left = (_width - parseInt(id.style.width)) / 2 + 'px';
    id.style.top = (_height - parseInt(id.style.height)) / 2 + 'px';
  },
  initArticleJs: function () {
    Obsidian.setCodeRowWithLang();
    Obsidian.tocSpy(200);
    if ($('#vcomments').length) {
      initValine();
    }
    if ($('span[id^="busuanzi_"]').length) {
      initialBusuanzi();
    }
    reprocessMathJax();
    buildImgCaption();
    utiliseBgColor('article');
    Obsidian.initialShare();
  },
  setCodeRowWithLang: function () {
    // Get the programming type of the current code block
    var code = $('code');
    if (code && code.length) {
      code.each(function () {
        var item = $(this),
          lang = '';
        if (item[0].className.indexOf(' ') > -1) {
          lang = item[0].className.split(' ')[0];
        } else {
          lang = item[0].className;
        }
        var langMap = {
          html: 'HTML',
          xml: 'XML',
          svg: 'SVG',
          mathml: 'MathML',
          css: 'CSS',
          clike: 'C-like',
          js: 'JavaScript',
          abap: 'ABAP',
          apacheconf: 'Apache Configuration',
          apl: 'APL',
          arff: 'ARFF',
          asciidoc: 'AsciiDoc',
          adoc: 'AsciiDoc',
          asm6502: '6502 Assembly',
          aspnet: 'ASP.NET (C#)',
          autohotkey: 'AutoHotkey',
          autoit: 'AutoIt',
          shell: 'BASH',
          bash: 'BASH',
          basic: 'BASIC',
          csharp: 'C#',
          dotnet: 'C#',
          cpp: 'C++',
          cil: 'CIL',
          csp: 'Content-Security-Policy',
          'css-extras': 'CSS Extras',
          django: 'Django/Jinja2',
          jinja2: 'Django/Jinja2',
          dockerfile: 'Docker',
          erb: 'ERB',
          fsharp: 'F#',
          gcode: 'G-code',
          gedcom: 'GEDCOM',
          glsl: 'GLSL',
          gml: 'GameMaker Language',
          gamemakerlanguage: 'GameMaker Language',
          graphql: 'GraphQL',
          hcl: 'HCL',
          http: 'HTTP',
          hpkp: 'HTTP Public-Key-Pins',
          hsts: 'HTTP Strict-Transport-Security',
          ichigojam: 'IchigoJam',
          inform7: 'Inform 7',
          javastacktrace: 'Java stack trace',
          json: 'JSON',
          jsonp: 'JSONP',
          latex: 'LaTeX',
          emacs: 'Lisp',
          elisp: 'Lisp',
          'emacs-lisp': 'Lisp',
          lolcode: 'LOLCODE',
          'markup-templating': 'Markup templating',
          matlab: 'MATLAB',
          mel: 'MEL',
          n1ql: 'N1QL',
          n4js: 'N4JS',
          n4jsd: 'N4JS',
          'nand2tetris-hdl': 'Nand To Tetris HDL',
          nasm: 'NASM',
          nginx: 'nginx',
          nsis: 'NSIS',
          objectivec: 'Objective-C',
          ocaml: 'OCaml',
          opencl: 'OpenCL',
          parigp: 'PARI/GP',
          objectpascal: 'Object Pascal',
          php: 'PHP',
          'php-extras': 'PHP Extras',
          plsql: 'PL/SQL',
          powershell: 'PowerShell',
          properties: '.properties',
          protobuf: 'Protocol Buffers',
          q: 'Q (kdb+ database)',
          jsx: 'React JSX',
          tsx: 'React TSX',
          renpy: "Ren'py",
          rest: 'reST (reStructuredText)',
          sas: 'SAS',
          sass: 'SASS (Sass)',
          scss: 'SASS (Scss)',
          sql: 'SQL',
          soy: 'Soy (Closure Template)',
          tap: 'TAP',
          toml: 'TOML',
          tt2: 'Template Toolkit 2',
          ts: 'TypeScript',
          vbnet: 'VB.Net',
          vhdl: 'VHDL',
          vim: 'vim',
          'visual-basic': 'Visual Basic',
          vb: 'Visual Basic',
          wasm: 'WebAssembly',
          wiki: 'Wiki markup',
          xeoracube: 'XeoraCube',
          xojo: 'Xojo (REALbasic)',
          xquery: 'XQuery',
          yaml: 'YAML',
        };

        var displayLangText = '';
        if (lang in langMap) displayLangText = langMap[lang];
        else displayLangText = lang;
        if (item.find('.language-mark').length <= 0 && displayLangText) {
          // reset code block styles
          item.css('background', 'transparent');
          item.css('padding', 0);

          var $code = item.text();

          item.empty();

          var myCodeMirror = CodeMirror(this, {
            value: $code,
            mode: Obsidian.getCodeMirrorMode(lang),
            lineNumbers: !item.is('.inline'),
            readOnly: true,
            lineWrapping: true,
            theme: 'dracula',
          });

          item
            .find('.CodeMirror')
            .prepend(
              '<span class="language-mark" ref=' +
                lang +
                '> <b class="iconfont icon-code" style="line-height: 0.7rem"></b> ' +
                displayLangText +
                '</span>'
            );
        }
      });
    }
  },
  tocSpy: function (offset) {
    var tocContainer = $('#toc');
    var toc = tocContainer,
      tocHeight = toc.height();
    scrollSpy(tocContainer, {
      offset: 300,
    });

    $('.toc-item').on('scrollspy', function () {
      var tocTop = toc.scrollTop(),
        link = $(this).children('.toc-link'),
        thisTop = link.position().top;
        console.log(thisTop);
        console.log(tocHeight);
        console.log($(this).height());
        console.log(link.height());
      // make sure the highlighted element contains no child
      if ($(this).height() != link.height()) return;
      console.log("222222");
      // if the highlighted element is above current view of toc
      if (thisTop <= 0) toc.scrollTop(tocTop + thisTop);
      // else if below current view of toc
      else if (tocHeight <= thisTop)
        toc.scrollTop(tocTop + thisTop + link.outerHeight() - tocHeight);
    });
  },
  reactToWindowHeight: function () {
    var postSpacing = 315;
    var winHeight = $(window).height();
    var winWidth = $(window).width();
    var firstPostHeight = $('#post0').height();
    if (winWidth <= 900) {
      postSpacing = 100;
    }
    if (firstPostHeight + postSpacing > winHeight || winWidth <= 900) {
      $('#mark').css('height', firstPostHeight + postSpacing + 'px');
      $('#screen').css('height', firstPostHeight + postSpacing + 'px');
    }
  },
  initialShare: function () {
    var $config = {
      title: document.title,
      description: document.description,
      wechatQrcodeTitle: '微信扫一扫：分享', // 微信二维码提示文字
      wechatQrcodeHelper: '<p>微信里点“发现”，扫一下</p><p>二维码便可将本文分享至朋友圈。</p>',
    };

    socialShare('.share-component-cc', $config);
  },
  v: function (t, e) {
    if (t)
      switch (t) {
        case 'javascript':
        case 'text/javascript':
        case 'js':
          return (t = 'javascript');
        case 'json':
          return e
            ? t
            : (t = {
                name: 'javascript',
                json: !0,
              });
        case 'jsonld':
        case 'json-ld':
          return e ? t : 'application/ld+json';
        case 'text/typescript':
        case 'typescript':
        case 'ts':
          return e
            ? 'typescript'
            : (t = {
                name: 'javascript',
                typescript: !0,
              });
        case 'clojure':
          return t;
        case 'coffee':
        case 'coffeescript':
        case 'css':
          return t;
        case 'less':
          return e ? 'less' : 'text/x-less';
        case 'scss':
          return e ? 'scss' : (t = 'text/x-scss');
        case 'gfm':
        case 'github flavored markdown':
          return (t = 'gfm');
        case 'markdown':
        case 'md':
        case 'mkd':
          return t;
        case 'xml':
        case 'xaml':
        case 'mjml':
        case 'xul':
        case 'enml':
          return e ? t : 'xml';
        case 'haskell':
          return t;
        case 'htmlmixed':
        case 'html':
        case 'xhtml':
        case 'svg':
        case 'epub':
          return e ? (/^html/.exec(t) ? 'html' : t) : (t = 'htmlmixed');
        case 'lua':
          return t;
        case 'lisp':
        case 'commonlisp':
        case 'common lisp':
          return (t = 'commonlisp');
        case 'pascal':
          return t;
        case 'perl':
        case 'perl5':
        case 'perl4':
        case 'perl3':
        case 'perl2':
          return 'perl';
        case 'perl6':
          return t;
        case 'php+html':
          return e ? 'php' : 'application/x-httpd-php';
        case 'php':
        case 'php3':
        case 'php4':
        case 'php5':
        case 'php6':
          return e ? t : 'text/x-php';
        case 'cython':
          return e ? t : (t = 'text/x-cython');
        case 'python':
          return e ? t : (t = 'text/x-python');
        case 'ruby':
          return t;
        case 'shell':
        case 'sh':
        case 'zsh':
        case 'bash':
          return (t = 'shell');
        case 'sql':
        case 'sql lite':
        case 'sqlite':
          return e ? t : (t = 'text/x-sql');
        case 'mssql':
          return e ? t : (t = 'text/x-mssql');
        case 'mysql':
          return e ? t : (t = 'text/x-mysql');
        case 'mariadb':
          return e ? t : (t = 'text/x-mariadb');
        case 'cassandra':
        case 'cql':
          return e ? t : (t = 'text/x-cassandra');
        case 'plsql':
          return e ? t : (t = 'text/x-plsql');
        case 'stex':
        case 'tex':
        case 'latex':
          return e ? t : 'text/x-stex';
        case 'tiddlywiki':
        case 'wiki':
          return e ? t : (t = 'tiddlywiki');
        case 'vb':
        case 'visual basic':
        case 'visualbasic':
        case 'basic':
          return e ? t : (t = 'vb');
        case 'vbscript':
        case 'velocity':
          return t;
        case 'verilog':
          return e ? t : (t = 'text/x-verilog');
        case 'xquery':
          return t;
        case 'yaml':
        case 'yml':
          return e ? t : 'yaml';
        case 'go':
        case 'groovy':
        case 'nginx':
          return t;
        case 'octave':
        case 'matlab':
          return e ? t : 'text/x-octave';
        case 'c':
        case 'clike':
        case 'csrc':
          return e ? t : (t = 'text/x-csrc');
        case 'c++':
        case 'c++src':
        case 'cpp':
        case 'cc':
        case 'hpp':
        case 'h++':
        case 'h':
          return e ? t : (t = 'text/x-c++src');
        case 'obj-c':
        case 'objc':
        case 'objective c':
        case 'objective-c':
        case 'objectivec':
          return e ? t : (t = 'text/x-objectivec');
        case 'text/x-scala':
        case 'scala':
          return e ? t : (t = 'text/x-scala');
        case 'csharp':
        case 'c#':
        case 'cs':
          return e ? t : (t = 'text/x-csharp');
        case 'java':
          return e ? t : (t = 'text/x-java');
        case 'squirrel':
          return e ? t : (t = 'text/x-squirrel');
        case 'ceylon':
          return e ? t : (t = 'text/x-ceylon');
        case 'kotlin':
          return e ? t : (t = 'text/x-kotlin');
        case 'swift':
          return (t = 'swift');
        case 'r':
        case 'rlang':
        case 'r-lang':
          return e ? t : (t = 'text/x-rsrc');
        case 'd':
        case 'diff':
        case 'erlang':
        case 'http':
        case 'jade':
          return t;
        case 'rst':
        case 'restructuredtext':
          return (t = 'rst');
        case 'rust':
        case 'jinja2':
          return t;
        case 'aspx':
        case 'asp':
        case 'asp.net':
          return e ? t : (t = 'application/x-aspx');
        case 'jsp':
          return e ? t : (t = 'application/x-jsp');
        case 'erb':
          return e ? t : (t = 'application/x-erb');
        case 'ejs':
        case 'embeddedjs':
        case 'embedded javaScript':
          return e ? t : (t = 'application/x-ejs');
        case 'powershell':
        case 'bat':
        case 'cmd':
          return e ? t : 'application/x-powershell';
        case 'dockerfile':
          return e ? t : 'text/x-dockerfile';
        case 'jsx':
        case 'react':
          return e ? t : 'text/jsx';
        case 'tsx':
          return e ? t : 'text/typescript-jsx';
        case 'vue.js':
        case 'vue':
        case 'vue-template':
          return e ? t : 'script/x-vue';
        case 'nsis':
          return e ? t : 'text/x-nsis';
        case 'mathematica':
          return e ? t : 'text/x-mathematica';
        case 'tiki':
        case 'tiki wiki':
        case 'tiki-wiki':
        case 'tikiwiki':
          return 'tiki';
        case 'properties':
        case 'ini':
          return e ? t : 'text/x-properties';
        case 'livescript':
          return e ? t : 'text/x-livescript';
        case 'asm':
        case 'assembly':
        case 'nasm':
        case 'gas':
          return e ? t : 'assembly';
        case 'toml':
          return e ? t : 'text/x-toml';
        case 'sequence':
          return 'sequence';
        case 'flow':
        case 'flowchart':
          return 'flow';
        case 'mermaid':
          return 'mermaid';
        case 'ocaml':
          return e ? t : 'text/x-ocaml';
        case 'f#':
        case 'fsharp':
          return e ? t : 'text/x-fsharp';
        case 'elm':
          return e ? t : 'text/x-elm';
        case 'pgp':
        case 'pgp-keys':
        case 'pgp-key':
        case 'pgp-signature':
        case 'asciiarmor':
        case 'ascii-armor':
        case 'ascii armor':
          return e ? t : 'application/pgp';
        case 'spreadsheet':
        case 'excel':
          return e ? t : 'text/x-spreadsheet';
        case 'elixir':
          return 'elixir';
        case 'cmake':
          return e ? t : 'text/x-cmake';
        case 'cypher':
        case 'cypher-query':
          return e ? t : 'application/x-cypher-query';
        case 'dart':
          return 'dart';
        case 'django':
          return e ? t : 'text/x-django';
        case 'dtd':
        case 'xml-dtd':
        case 'xml dtd':
        case 'xmldtd':
          return e ? t : 'application/xml-dtd';
        case 'dylan':
          return e ? t : 'text/x-dylan';
        case 'handlebars':
          return e ? t : 'text/x-handlebars-template';
        case 'idl':
          return e ? t : 'text/x-idl';
        case 'webidl':
        case 'web-idl':
        case 'web idl':
          return e ? t : 'text/x-webidl';
        case 'yacas':
          return e ? t : 'text/x-yacas';
        case 'mbox':
          return e ? t : 'application/mbox';
        case 'vhdl':
          return e ? t : 'text/x-vhdl';
        case 'julia':
          return 'julia';
        case 'haxe':
          return e ? t : 'text/x-haxe';
        case 'hxml':
          return e ? t : 'text/x-hxml';
        case 'fortran':
          return e ? t : 'text/x-fortran';
        case 'protobuf':
          return e ? t : 'text/x-protobuf';
        case 'makefile':
          return e ? t : 'text/x-makefile';
        case 'tcl':
          return e ? t : 'text/x-tcl';
        case 'scheme':
          return e ? t : 'text/x-scheme';
        case 'twig':
          return e ? t : 'text/x-twig';
        case 'sas':
          return e ? t : 'text/x-sas';
        case 'pseudocode':
          return e ? t : 'text/x-pseudocode';
        case 'julia':
        case 'text/x-julia':
        case 'stylus':
        case 'cobol':
        case 'oz':
        case 'sparql':
        case 'crystal':
          return t;
        case 'asn.1':
          return e ? 'ASN.1' : (t = 'text/x-ttcn-asn');
        case 'gherkin':
        case 'smalltalk':
        case 'turtle':
          return t;
        default:
          return '';
      }
  },
  getCodeMirrorMode: function (t, e, n) {
    var i = ((t = (t = t ? t.toLowerCase() : '')
        .replace(/^\s*\.*lang(uage)*-/g, '')
        .replace(/[{}]/g, '')
        .trim()).split(/\s+/) || [t])[0],
      r = Obsidian.v(t, n);
    return (
      r || t == i || (r = Obsidian.v(i.replace(/(^[.])|(,$)/g, ''), n)), r || (n ? i : e ? null : t)
    );
  },
  loadingOut: function () {
    setTimeout(function () {
      $('html, body').removeClass('loading');
      setTimeout(function () {
        $('.loader').css('z-index', '-1');
      }, 600);
    }, 500);
  },
};

$(function () {
  initialMathJax();
  var inputArea = document.querySelector('#local-search-input');
  if (inputArea) {
    inputArea.onclick = function () {
      getSearchFile();
      this.onclick = null;
    };
    inputArea.onkeydown = function () {
      if (event.keyCode == 13) return false;
    };
  }
  if ($('#post0').length) {
    Obsidian.reactToWindowHeight();
  }
  if (Obsidian.P()) {
    $('body').addClass('touch');
  }
  if ($('#preview').length) {
    Obsidian.PS();
    $('.pview a').addClass('pviewa');
    Obsidian.loadingOut();
  } else {
    $('#single').css('min-height', window.innerHeight);
    Obsidian.loadingOut();
    window.addEventListener('popstate', function (e) {
      if (e.state) location.href = e.state.u;
    });
    Obsidian.player();
    $('.icon-icon, .image-icon').attr('href', '/');
    $('#top').show();
  }
  (() => {
    'use strict';

    var refOffset = 0,
      articleRefOffset = 0,
      articleMenuHeight = 51,
      menuHeight = 70,
      header = document.querySelector('#header这里先屏蔽'),
      logoImg = document.querySelector('.logo > img');

    var handler = () => {
      var newOffset = window.scrollY || window.pageYOffset;
      if ($('#header这里先屏蔽').length && !$('.scrollbar').length) {
        if (newOffset > menuHeight) {
          if (newOffset > refOffset) {
            header.classList.remove('animateIn');
            header.classList.add('animateOut');
          } else {
            header.classList.remove('animateOut');
            header.classList.add('animateIn');
          }
          header.style.paddingTop = '20px';
          header.style.background = 'rgba(16,14,23,1)';
          header.style.borderBottom = '1px solid #201c29';
          header.style.boxShadow = '0 0 30px rgba(0, 0, 0, 1)';
          refOffset = newOffset;
        } else {
          if ($(window).width() <= 780) {
            header.style.paddingTop = '10px';
          } else {
            header.style.paddingTop = '25px';
          }
          header.style.background = 'transparent';
          header.style.borderBottom = '0px';
          header.style.boxShadow = '2px 2px 10px #cfcfcf';
          if (!logoImg.classList.contains('spin')) {
            logoImg.classList.add('spin');
            setTimeout(function () {
              logoImg.classList.remove('spin');
            }, 2000);
          }
        }
      }
      var topHeader = document.querySelector('#top');
      var homeIcon = document.querySelector('#home-icon');
      if (topHeader && $('.scrollbar').length && !$('.icon-images').hasClass('active')) {
        if (newOffset > articleMenuHeight) {
          if (newOffset > articleRefOffset) {
            topHeader.classList.remove('animateIn');
            topHeader.classList.add('animateOut');
            $('.subtitle').fadeOut();
          } else {
            topHeader.classList.remove('animateOut');
            topHeader.classList.add('animateIn');
            $('.subtitle').fadeIn();
          }
          articleRefOffset = newOffset;
        } else {
          $('.subtitle').fadeOut();
          if (!homeIcon.classList.contains('spin')) {
            homeIcon.classList.add('spin');
            setTimeout(function () {
              homeIcon.classList.remove('spin');
            }, 2000);
          }
        }
        var wt = $(window).scrollTop(),
          tw = $('#top').width(),
          dh = document.body.scrollHeight,
          wh = $(window).height();
        var width = (tw / (dh - wh)) * wt;
        $('.scrollbar').width(width);
      }

      var scrollTop = $(window).scrollTop(),
        docHeight = $(document).height(),
        winHeight = $(window).height(),
        winWidth = $(window).width(),
        scrollPercent = scrollTop / (docHeight - winHeight),
        scrollPercentRounded = Math.round(scrollPercent * 100),
        backToTopState = $('#back-to-top').css('display');

      $('#back-to-top')
        .find('.percentage')
        .html(scrollPercentRounded + '%');
      $('#back-to-top')
        .find('.flow')
        .css('height', scrollPercentRounded + '%');

      if (winWidth >= 920) {
        if (scrollPercentRounded > 10) {
          if (backToTopState === 'none') {
            $('#back-to-top').removeClass('fadeOutRight');
            $('#back-to-top').addClass('fadeInRight');
            $('#back-to-top').css('display', 'block');
          }
        } else {
          if (backToTopState === 'block') {
            setTimeout(function () {
              $('#back-to-top').css('display', 'none');
            }, 400);
            $('#back-to-top').removeClass('fadeInRight');
            $('#back-to-top').addClass('fadeOutRight');
          }
        }
      }
    };

    window.addEventListener('scroll', handler, false);
  })($);
  $(window).on('touchmove', function (e) {
    if ($('body').hasClass('mu')) {
      e.preventDefault();
    }
  });
  $('body').on('click', function (e) {
    var tag = $(e.target).attr('class') || '',
      rel = $(e.target).attr('rel') || '',
      set,
      clone;

    // .content > ... > img
    if (e.target.nodeName == 'IMG' && $(e.target).parents('div.content').length > 0) {
      tag = 'pimg';
    }
    if (!tag && !rel) return;
    switch (true) {
      case tag.indexOf('share') != -1:
        var shareComponent = $('.share-component-cc');
        if (shareComponent.css('opacity') != '1') {
          $('.share-component-cc').css('opacity', 1);
        } else {
          $('.share-component-cc').css('opacity', 0);
        }
        break;
      case tag.indexOf('icon-top02') != -1:
        $('html,body').animate(
          {
            scrollTop: 0,
          },
          300
        );
        break;
      // nav menu
      case tag.indexOf('switchmenu') != -1:
        window.scrollTo(0, 0);
        $('html, body').toggleClass('mu');
        var switchMenu = $('.switchmenu');
        if (switchMenu.hasClass('icon-menu')) {
          switchMenu.removeClass('icon-menu').addClass('icon-cross');
        } else {
          switchMenu.removeClass('icon-cross').addClass('icon-menu');
        }
        return false;
      // next page
      case tag.indexOf('more') != -1:
        tag = $('.more');
        if (tag.data('status') == 'loading') {
          return false;
        }
        var num = parseInt(tag.data('page')) || 1;
        if (num == 1) {
          tag.data('page', 1);
        }
        if (num >= Pages) {
          return;
        }
        tag.html(tag.attr('data-loading')).data('status', 'loading');
        Obsidian.loading();
        Obsidian.L(
          tag.attr('href'),
          function (data) {
            var link = $(data).find('.more').attr('href');
            if (link != undefined) {
              tag.attr('href', link).html(tag.attr('data-load-more')).data('status', 'loaded');
              tag.data('page', parseInt(tag.data('page')) + 1);
            } else {
              $('#pager').remove();
            }
            var tempScrollTop = $(window).scrollTop();
            $('#primary').append($(data).find('.post'));
            $(window).scrollTop(tempScrollTop + 100);
            Obsidian.loaded();
            $('html,body').animate(
              {
                scrollTop: tempScrollTop + 400,
              },
              500
            );
            document.querySelectorAll('pre code').forEach(block => {
              if(typeof hljs !== 'undefined') hljs.highlightBlock(block);
            });
            Obsidian.setCodeRowWithLang();
            if ($('#vcomments').length) {
              initValine();
            }
          },
          function () {
            tag.html(tag.attr('data-load-more')).data('status', 'loaded');
          }
        );
        return false;
      // home
      case tag.indexOf('icon-home') != -1:
        $('.toc').fadeOut(100);
        if ($('#preview').hasClass('show')) {
          history.back();
        } else {
          location.href = $('.icon-home').data('url');
        }
        return false;
      // qrcode
      case tag.indexOf('icon-QRcode-o') != -1:
        if ($('.icon-scan').hasClass('tg')) {
          $('#qr').toggle();
        } else {
          $('.icon-scan').addClass('tg');
          $('#qr')
            .qrcode({
              width: 128,
              height: 128,
              text: location.href,
            })
            .toggle();
        }
        return false;
      // audio play
      case tag.indexOf('icon-play') != -1:
        $('#audio')[0].play();
        $('.icon-play').removeClass('icon-play').addClass('icon-pause');
        return false;
      // audio pause
      case tag.indexOf('icon-pause') != -1:
        $('#audio')[0].pause();
        $('.icon-pause').removeClass('icon-pause').addClass('icon-play');
        return false;
      // history state
      case tag.indexOf('posttitle') != -1:
        $('body').removeClass('fixed');
        Obsidian.HS($(e.target), 'push');
        // initialArticleTyped();
        return false;
      // history state
      case tag.indexOf('menu-link') != -1:
        $('body').removeClass('fixed');
        Obsidian.HS($(e.target), 'push');
        return false;
      // prev, next post
      case rel == 'prev' || rel == 'next':
        var t;
        if (rel == 'prev') {
          t = $('#prev_next a')[0].text;
        } else {
          t = $('#prev_next a')[1].text;
        }
        $(e.target).attr('title', t);
        Obsidian.HS($(e.target), 'replace');
        return false;
      // toc
      case tag.indexOf('toc-text') != -1 ||
        tag.indexOf('toc-link') != -1 ||
        tag.indexOf('toc-number') != -1:
        hash = '';
        if (e.target.nodeName == 'SPAN') {
          hash = $(e.target).parent().attr('href');
        } else {
          hash = $(e.target).attr('href');
        }
        to = $('.content :header').find('[href="' + hash + '"],[href="' + decodeURIComponent(hash) + '"]');
        $('html,body').animate(
          {
            // -200 是文章显示顶部header的高度 140 + 60（调整偏移量）
            scrollTop: to.offset().top - 80 - 200,
          },
          300
        );
        return false;
      // quick view
      case tag.indexOf('pviewa') != -1:
        $('body').removeClass('mu');
        setTimeout(function () {
          Obsidian.HS($(e.target), 'push');
          $('.toc').fadeIn(1000);
        }, 300);
        return false;
      // photoswipe
      case tag.indexOf('pimg') != -1:
        var pswpElement = $('.pswp').get(0);
        if (pswpElement) {
          var items = [];
          var index = 0;
          var imgs = [];
          $('.content img').each(function (i, v) {
            // get index
            if (e.target.src == v.src) {
              index = i;
            }
            var item = {
              src: v.src,
              w: v.naturalWidth,
              h: v.naturalHeight,
            };
            imgs.push(v);
            items.push(item);
          });
          var options = {
            index: index,
            shareEl: false,
            zoomEl: false,
            allowRotationOnUserZoom: true,
            history: false,
            getThumbBoundsFn: function (index) {
              // See Options -> getThumbBoundsFn section of documentation for more info
              var thumbnail = imgs[index],
                pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                rect = thumbnail.getBoundingClientRect();

              return {
                x: rect.left,
                y: rect.top + pageYScroll,
                w: rect.width,
              };
            },
          };
          var lightBox = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
          lightBox.init();
        }
        return false;
      // comment
      case -1 != tag.indexOf('comment'):
        Obsidian.loading(), (comment = $('#gitalk-container'));
        var gitalk = new Gitalk({
          clientID: comment.data('ci'),
          clientSecret: comment.data('cs'),
          repo: comment.data('r'),
          owner: comment.data('o'),
          admin: [comment.data('a')],
          id: md5(window.location.pathname),
          distractionFreeMode: comment.data('d'),
          labels: ['Gitalk'],
        });
        $('.comment').removeClass('link');
        gitalk.render('gitalk-container');
        Obsidian.loaded();
        return false;
      case tag.indexOf('category-list-child') != -1:
        tag = $(e.target);
        set = $('.set');
        clone = $('.clone-element');
        var categoryMask = $('.category-mask'),
          categoryDisplay = categoryMask.css('display'),
          setHeight = set.height();

        if (categoryDisplay == 'none') {
          tag.parent('.category-list-item').addClass('active');
          tag.find('.category-list-item').each(function () {
            $(this).addClass('sub-active');
          });
          clone.append(set.html()).show();
          clone.css('top', set.offset().top);
          clone.css('left', set.offset().left);
          set.empty().css('height', setHeight + 'px');
          $('.category-mask').fadeIn(500);
        }
        return false;
      case tag.indexOf('category-mask') != -1:
        set = $('.set');
        clone = $('.clone-element');
        set.append(clone.html()).css('height', 'auto');
        clone.empty().hide();
        $('.category-list-item.active').each(function () {
          var that = $(this);
          setTimeout(function () {
            that.removeClass('active');
          }, 400);
          $('.sub-active').each(function () {
            $(this).removeClass('sub-active');
          });
        });
        $('.category-mask').fadeOut(500);
        return false;
      case tag.indexOf('search-bar') != -1 || tag.indexOf('search-box-close') != -1:
        var searchBox = $('.search-box'),
          searchBoxDisplay = $('.search-box').css('display');

        if (searchBoxDisplay != 'block') {
          $('body').addClass('fixed');
          searchBox.fadeIn(400);
        } else {
          $('body').removeClass('fixed');
          searchBox.fadeOut(400);
        }
        return false;
      default:
        return true;
    }
  });

  // 是否自动展开评论
  comment = $('#gitalk-container');
  if (comment.data('ae') == true) {
    comment.click();
  }

  if ($('.article').length) {
    Obsidian.tocSpy(200);
    buildImgCaption();
    Obsidian.initialShare();
  }

  // Watch window history changes
  window.onpopstate = function (event) {
    utiliseBgColor();
    if ($('.search-box').css('display') == 'block') {
      $('body').addClass('fixed');
    }
  };

  utiliseBgColor();
  initialTyped();
  Obsidian.setCodeRowWithLang();
  console.log(
    '%c Github %c',
    'background:#24272A; color:#73ddd7',
    '',
    'https://github.com/TriDiamond/hexo-theme-obsidian'
  );
});



/*左侧菜单item控制*/
$(function() {
    var Accordion = function(el, multiple) {
        this.el = el || {};
        this.multiple = multiple || false;
 
        // Variables privadas
        var links = this.el.find('.link');
        // Evento
        links.on('click', {el: this.el, multiple: this.multiple}, this.dropdown)
 
        // Variables privadas
        var links1 = this.el.find('.link1');
        // Evento
        links1.on('click', {el: this.el, multiple: this.multiple}, this.dropdown1)

    }
 
    Accordion.prototype.dropdown = function(e) {
        var $el = e.data.el;
            $this = $(this),
            $next = $this.next();
 
        $next.slideToggle();
        $this.parent().toggleClass('open');
        if ( $this[0].firstChild.getAttribute("id") != "thisOpened") {
            $this[0].firstChild.setAttribute("id","thisOpened");
            $this[0].firstChild.setAttribute("class","arrow-bottom");
          }else{
                $this[0].firstChild.setAttribute("id","thisNotOpened");
                $this[0].firstChild.setAttribute("class","arrow-right");
          }
        if($this.parent()[0].classList[0] != "open"){
            //关闭自己的
            var isCollection = $this.parent().children()[1].getElementsByTagName("i")
            for(var k=0,length = isCollection.length;k<length;k++ ){
                if(isCollection[k].getAttribute("id") == "thisOpened"){
                    isCollection[k].setAttribute("id","thisNotOpened");
                    isCollection[k].setAttribute("class","arrow-right"); 
                  break;
                }
            }
   
        }else{
            //关闭其他的
            $this.parent().parent().children().toArray().forEach(function(i){
              // console.log();
               if($(i).find(".link")[0].innerText != $this[0].innerText){

                  var otherOpened = $(i).find(".arrow-bottom");
                  $(otherOpened).toArray().forEach(function(o){
                          console.log(o);
                      if (o.getAttribute("id") == "thisOpened") {
                          o.setAttribute("id","thisNotOpened");
                          o.setAttribute("class","arrow-right"); 
                      }
                  });
               }

            });

        }
        if (!e.data.multiple) {
            $el.find('.submenu').not($next).slideUp().parent().removeClass('open');
            $el.find('.submenu1').not($next).slideUp().parent().removeClass('open');
        };

/*        var link1s = $el.find('.link1');
        for(var k,length = link1s.length;k<length;k++){

        console.log(link1s[k]);
        }*/
    }   

    Accordion.prototype.dropdown1 = function(e) {
        var $el = e.data.el;
            $this = $(this),
            $next = $this.next();
            var currentLink1 = $(this)[0];
            if (currentLink1.firstChild.getAttribute("id") != "thisOpened") {
                 currentLink1.firstChild.setAttribute("id","thisOpened")
                  currentLink1.firstChild.setAttribute("class","arrow-bottom");

                  $el.find(".link1").toArray().forEach(function(i){
                      if(i.innerText != currentLink1.innerText){
                          i.firstChild.setAttribute("id","thisNotOpened");
                          i.firstChild.setAttribute("class","arrow-right");
                      }
                  });

            }else{
                    currentLink1.firstChild.setAttribute("id","thisNotOpened");
                    currentLink1.firstChild.setAttribute("class","arrow-right");
            }

            
 
        $next.slideToggle();
        $this.parent().toggleClass('open');
 
        if (!e.data.multiple) {
            $el.find('.submenu1').not($next).slideUp().parent().removeClass('open');
        };
/*        var link1s = $el.find('.link1');
        for(var k,length = link1s.length;k<length;k++){

        console.log(link1s[k]);
        }*/
    }  
 
    var accordion = new Accordion($('#accordion'), false);
});
/* 加载左侧菜单*/


/* 中间文章和侧边栏同步更新 不刷新页面 */
$(function() {
  var MyArticle = function(sidemenu_el, multiple) {
        var $localPath =  window.location.href;
        var $lPath = $localPath.substr(0,$localPath.indexOf("//") + 2);
        var $sPath = $localPath.substr($localPath.indexOf("//") + 2);
        var $bPath = $sPath.substr(0,$sPath.indexOf("/") + 1);
        var $homePath = $lPath + $bPath;
        var $article_el = document.getElementById('center-article');
        var $sidemenu_el = document.getElementById('mm-side-menu');
     
        this.multiple = multiple || false;
        // 获取点击事件
        var submenuLink = sidemenu_el.find('.submenu1').find('li');

        submenuLink.on('click', {article_el: this.article_el, sidemenu_el: this.sidemenu_el,multiple:this.multiple}, function(e){
            //如果和当前文章路径不一致则reload当前文章，主页链接除外
            save(this.id);
            //设置选中
            this.style.backgroundColor = "#C5C4C4";
            this.style.color = "#ffffff"       
            //还原其他li颜色 // #444359;
             var current = this.innerHTML;
                for(var k=0,length = submenuLink.length;k<length;k++ ){
                  // console.log(submenuLink[k].innerHTML);
                    if (submenuLink[k].innerHTML.search(current) == -1) {
                        submenuLink[k].style.backgroundColor = "#f0f2f5";    
                        submenuLink[k].style.color = "#4d4d4d";        
                    }
                }


            $.ajax({
                    url: $homePath + this.id,
                    cache: false,
                    success: function(html){
                      // console.log(html)
                            var articleRex = /<!-- article main start -->(([\s\S])*?)<!-- article main end -->/;
                            // 中间文章
                            var articleData = html.match(articleRex);
                            //返回的是数组，第一个值为匹配的数据
                            // var  articleContent = articleData[0] + "</div>";                              
                            $('#center-article').html(articleData[0]);
                            Obsidian.setCodeRowWithLang();//重新处理一下代码

                            var headRex = /<!-- src-article-head start -->(([\s\S])*?)<!-- src-article-head end -->/;
                            // 文章标题
                            var headData = html.match(headRex);
                            $('#article-head').html(headData[0]);

                            var tocRex = /<!-- toc start -->(([\s\S])*?)<!-- toc end -->/;
                            // 目录
                            var tocData = html.match(tocRex);
                            $('#toc').html(tocData[0]);
                            Obsidian.tocSpy(200);

                          }

                  });
             // $('#center-article').load(this.sidemenu_el.name + " #center-article")
        });
}
 var reloadArticle = new MyArticle( $('#mm-side-menu'), false);
});




/* 首页设置跳转传值 */
function setCookies(path){
  // alert(path);
  if(typeof(Storage)=="undefined"){
    alert("不支持web存储");
  }else{
    save(path)
  window.location.href = "herodoc";
  }



}

    


$(document).ready(function (){
    //判断当前页面
    var loc= window.location.href;
    if (loc.search("herodoc") != -1) {
      var cp_keypath = "key_path";  
      var str = localStorage.getItem(cp_keypath); 
      if (str!= null) {
        var $localPath =  window.location.href;
        var $lPath = $localPath.substr(0,$localPath.indexOf("//") + 2);
        var $sPath = $localPath.substr($localPath.indexOf("//") + 2);
        var $bPath = $sPath.substr(0,$sPath.indexOf("/") + 1);
        var $homePath = $lPath + $bPath;
                    $.ajax({
                      url: $homePath + str,
                      cache: false,
                      success: function(html){
                        // console.log(html)
                              var articleRex = /<!-- article main start -->(([\s\S])*?)<!-- article main end -->/;
                              // 设置中间文章内容
                              var articleData = html.match(articleRex);
                              //返回的是数组，第一个值为匹配的数据
                              // var  articleContent = articleData[0] + "</div>";  
                              // console.log(articleData[0]);  
                              // console.log(html);                   
                              $('#center-article').html(articleData[0]);
                               Obsidian.setCodeRowWithLang();

                              var headRex = /<!-- src-article-head start -->(([\s\S])*?)<!-- src-article-head end -->/;
                              // 设置文章标题
                              var headData = html.match(headRex);
                              $('#article-head').html(headData[0]);
  
                              var tocRex = /<!-- toc start -->(([\s\S])*?)<!-- toc end -->/;
                              // 设置目录
                              var tocData = html.match(tocRex);
                              $('#toc').html(tocData[0]);
                              Obsidian.tocSpy(200);
  
                            }
  
                    });
            }

     //设置左侧菜单栏
     //分离路径     
      // alert(str);
      var strArray = str.split("/");
      var pathArray = new Array();
      strArray.forEach(function(e){
        if (e.length != 0 && e !="article") {
            var item = e;
            if (e.search("-") != -1) {
                item = e.substr(e.indexOf("-")+1);
            }
            pathArray.push(item);                  
        }
      });
      //获取控件模拟点击
      var sideMenu =  $('#mm-side-menu'); //find里面 . 表示搜索class，不加.表示搜索标签
      var submenuLink = sideMenu.find('.link');//结果是一个数组 一级目录
      var submenuLink1 = sideMenu.find('.link1');//结果是一个数组 二级目录
      var submenuLi = sideMenu.find('.submenu1').find("li"); // 三级目录
      //初始化icon 三角形
          var sideI = sideMenu.find("i");
          sideI.toArray().forEach(function(x){
            console.log(x)
          if (x.getAttribute("id") !="thisNotOpened") {
               x.setAttribute("id","thisNotOpened");
              x.setAttribute("class","arrow-right");
          }else{
                x.setAttribute("class","arrow-bottom");
                x.setAttribute("id","thisOpened");
          }

      });  
      pathArray.forEach(function(e){
        if (e != pathArray[pathArray.length-1]) {
            //模拟点击
            if (pathArray.indexOf(e) == 0) {
                for(var k=0,length = submenuLink.length;k<length;k++ ){
                    if (submenuLink[k].innerHTML.search(e) != -1) {    
                            if (submenuLink[k].getAttribute("id")!="currentOpen") {             
                            var event = document.createEvent("MouseEvents");//鼠标事件对象
                            event.initMouseEvent("click");//具体鼠标事件
                            submenuLink[k].dispatchEvent(event);//分发   
                            submenuLink[k].setAttribute("id","currentOpen");
                          }    
                    }else{
                      submenuLink[k].setAttribute("id","notOpened"+k);
                    }
                }
            }else if (pathArray.indexOf(e) == 1) {
                 for(var k=0,length = submenuLink1.length;k<length;k++ ){
                    if (submenuLink1[k].innerHTML.search(e) != -1) {
                          if (submenuLink1[k].getAttribute("id")!="currentOpen1") {  
                            var event = document.createEvent("MouseEvents");//鼠标事件对象
                            event.initMouseEvent("click");//具体鼠标事件
                            submenuLink1[k].dispatchEvent(event);//分发
                            submenuLink1[k].setAttribute("id","currentOpen1"); 
                            // console.log(submenuLink1[k]);  
                          }
                    }else{
                      submenuLink1[k].setAttribute("id","notOpened1"+k);
                    }
                }
            }
        }else{
            //模拟选中
                 for(var k=0,length = submenuLi.length;k<length;k++ ){
                    if (submenuLi[k].innerHTML.search(e) != -1) {
                        submenuLi[k].style.backgroundColor = "#C5C4C4";       
                        submenuLi[k].style.color = "#ffffff";     
                    }else{
                        submenuLi[k].style.backgroundColor = "#f0f2f5";
                        submenuLi[k].style.color = "#4d4d4d"; 
                    }
                }
            }
          
      });   

 
    }
});

//保存数据  
function save(cp_value){  
    var cp_keypath ="key_path";  
    localStorage.setItem(cp_keypath,cp_value);
    // alert("添加成功");
}

// js导入css和js


var importCssJs = {
  css: function(path) {
    if(!path || path.length === 0) {
      throw new Error('参数"path"错误');
    }
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.href = path;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    head.appendChild(link);
  },
  js: function(path) {
    if(!path || path.length === 0) {
      throw new Error('参数"path"错误');
    }
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.src = path;
    script.type = 'text/javascript';
    head.appendChild(script);
  }
}
