// A local search script with the help of [hexo-generator-search](https://github.com/PaicHyperionDev/hexo-generator-search)
// Copyright (C) 2017
// Liam Huang <http://github.com/Liam0205>
// This library is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as
// published by the Free Software Foundation; either version 2.1 of the
// License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA
// 02110-1301 USA
//

var searchFunc = function (path, search_id, content_id) {
  // 0x00. environment initialization
  'use strict';
  var BTN = "<i id='local-search-close'></i>";
  var SEARCH_START = "<span>" + $('#local-search-result').data('start') + "</span>",
      SEARCH_INITIALISE = "<span class='local-search-empty'>" + $('#local-search-result').data('initialise') + "<span>",
      SEARCH_EMPTY = "<span class='local-search-empty'>" + $('#local-search-result').data('empty') + "<span>";
  var $input = document.getElementById(search_id);
  var $resultContent = document.getElementById(content_id);
  var $scrollableContent = document.getElementById("mmsearch-scrollable");
  $resultContent.innerHTML = BTN + "<ul>" + SEARCH_INITIALISE + "</ul>";
  $.ajax({
    // 0x01. load xml file
    url: path,
    dataType: "xml",
    success: function (xmlResponse) {
      // 0x02. parse xml file
      var datas = $("entry", xmlResponse).map(function () {
        return {
          title: $("title", this).text(),
          content: $("content", this).text(),
          url: $("url", this).text()
        };
      }).get();
      $resultContent.innerHTML = "";

      $input.addEventListener('input', function () {
        // 0x03. parse query to keywords list
        var str = '<ul class=\"search-result-list\">';
        var keywords = this.value.trim().toLowerCase().split(/[\s\-]+/);
        $resultContent.innerHTML = "";
        if (this.value.trim().length <= 0) {
          $('#local-search-result').html(SEARCH_START);
		  $resultContent.style.backgroundColor='#FFFFFF';
		  $scrollableContent.style.boxShadow="";
		  $scrollableContent.style.display="none"; 
          return;
        }
		//设置阴影
		$scrollableContent.style.boxShadow="2px 2px 5px #595959";
		$scrollableContent.style.display="block";
        // 0x04. perform local searching
        datas.forEach(function (data) {
          var isMatch = true;
          var content_index = [];
          if (!data.title || data.title.trim() === '') {
            data.title = "Untitled";
          }
          var orig_data_title = data.title.trim();
          var data_title = orig_data_title.toLowerCase();
          var orig_data_content = data.content.trim().replace(/<[^>]+>/g, "");
          var data_content = orig_data_content.toLowerCase();
          var data_url = /^\//.test(data.url) ? '' : '/' + data.url;
          var index_title = -1;
          var index_content = -1;
          var first_occur = -1;
          // only match artiles with not empty contents
          if (data_content !== '') {
            keywords.forEach(function (keyword, i) {
              index_title = data_title.indexOf(keyword);
              index_content = data_content.indexOf(keyword);

              if (index_title < 0 && index_content < 0) {
                isMatch = false;
              } else {
                if (index_content < 0) {
                  index_content = 0;
                }
                if (i == 0) {
                  first_occur = index_content;
                }
                 // content_index.push({index_content:index_content, keyword_len:keyword_len});
              }
            });
          } else {
            isMatch = false;
          }
          // 0x05. show search results
          if (isMatch) {
            // console.log(data_url);
            str += "<li><span  class=\"search-result-title\" style=\"color:#452828;cursor:pointer;font-weight:800\"; onclick=\"searchResultClick('"+decodeURI(data_url)+"')\" >"  + orig_data_title + "</span>";
            var content = orig_data_content;
            if (first_occur >= 0) {
              // cut out 100 characters
              var start = first_occur - 20;
              var end = first_occur + 80;

              if (start < 0) {
                start = 0;
              }

              if (start == 0) {
                end = 100;
              }

              if (end > content.length) {
                end = content.length;
              }

              var match_content = content.substring(start, end);

			 
              // highlight all keywords
              keywords.forEach(function (keyword) {
                var regS = new RegExp(keyword, "gi");
                match_content = match_content.replace(regS, "<span class=\"search-keyword\">" + keyword + "</span>");
              });

              str += "<p class=\"search-result\">" + match_content + "...</p>";
            }
			//<!--搜索结果水平居中 分割线-->
			str += "<div style=\"margin:0 auto;border:1px;background-color:#d1d3d5;width:100%;height:2px;margin-top:-30px;\"></div>";
            str += "</li>";
          }
        });
        str += "</ul>";
        if (str.indexOf('<li>') === -1) {
          $resultContent.innerHTML = BTN + "<ul>" + SEARCH_EMPTY + "</ul>";
          return;
        }
        $resultContent.innerHTML = BTN + str;
      });
    }
  });
  $(document).on('click', '#local-search-close', function() {
	$resultContent.style.backgroundColor='#FFFFFF';
    $scrollableContent.style.boxShadow="";
    $scrollableContent.style.display="none"; 	
    $('#local-search-input').val('');
    $('#local-search-result').html(SEARCH_START);
  });
};

var getSearchFile = function(){
    var path = "/search.xml";
    searchFunc(path, 'local-search-input', 'local-search-result');
};








function searchResultClick(path){

    // console.log(path);
   save(path);
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
    }else{
        //主页，跳转到herodoc页面
   setCookies(path);

  }
}