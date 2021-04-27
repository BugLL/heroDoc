
/* 这里不使用exce，exce方法返回的数据太杂，使用string的match方法返回的是一个包含所有结果的数组 ?表示懒惰匹配(最小) .为任意非换行符 回车符 
* 表示匹配0或n个前一个字符
g表示多个结果匹配*/
/*hexo.extend.helper.register('getHS', function(tag,content){
	if(tag ==2){
		var hPat =/<h2.*?h2>/g;
		var hs = content.match(hPat);
	return hs;	
	}else if(tag ==3){
		var hPat =/<h3.*?h3>/g;
		var hs = content.match(hPat);
	return hs;	
	}else if(tag ==4){
		var hPat =/<h4.*?h4>/g;
		var hs = content.match(hPat);
	return hs;
	}else if(tag ==5){
		var hPat =/<h5.*?h5>/g;
		var hs = content.match(hPat);
	return hs;
	}
	return;
}); */


/* 自定义模板构造器插件 */
hexo.extend.generator.register('herodoc', function(locals){
    return {
      path: 'herodoc/index.html',
      data: locals.posts,
      layout: ['herodoc']
    }
  });
