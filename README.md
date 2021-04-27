# hexo-hero-doc
英雄互娱文档中心仓库
	
	
	<div id ="screen-content" class="screencontainer">  <!--中央容器-->
		<div class="screenitemcontainer">
		<% for (var i in theme.sdk){ %><!--这里的i等同于配置文件中的sdk一级子项，例如英雄USDK-->
				<%- partial('_partial/screen_item',{i:i}) %><!--{i:i}表示传一个i等于i的值给目标-->
		<%}%>
		</div>
		<div class="animated fadeInDown faqcontainer">
			<div class="animated fadeInDown" style="height:60px;font-size:18px;color:#414b59;padding-left:40px;padding-top:16px;">常见问题</div>
			<div class="animated fadeInDown" style="margin:0 auto;border:1px;background-color:#f0f2f5;width:94%;height:2px;margin-top:-16px;"></div><!--水平居中-->
			<div style="display:flex;">
				<%- partial('_partial/faq-normal',{page:page}) %>
				<div style="border:1px;background-color:#f0f2f5;height:280px;width:2px;margin-top:20px;margin-left:20px;"></div>
				<%- partial('_partial/faq-usdk',{page:page}) %>
				<div style="border:1px;background-color:#f0f2f5;height:280px;width:2px;margin-top:20px;margin-left:20px;"></div>
				<%- partial('_partial/faq-channel',{page:page}) %>
			</div>
		</div>
		
		<!-- waline 评论插件 start-->
		<% if (theme.waline.enable == true){%>
			<div id="waline" class="waline-style"></div>
			<!-- 导入js -->
			<%- js(theme.waline.js)%>
			<script>
			 var metaArray = '<%= theme.waline.meta %>'.split(',');
			 var requiredFieldsArray = '<%= theme.waline.requiredFields %>'.split(',');
			  new Waline({
				el: '#waline',
				path: <%= theme.waline.path %>,
				serverURL: '<%= theme.waline.serverURL %>',
				placeholder: '<%= theme.waline.placeholder %>',
				avatar: '<%= theme.waline.avatar %>',
				meta: metaArray,
				requiredFields:requiredFieldsArray,
				pageSize: <%= theme.waline.pageSize %>,
				lang: '<%= theme.waline.lang %>',
				visitor: <%= theme.waline.visitor %>,
				highlight: <%= theme.waline.highlight %>
			  });
			</script>
		<%}%>
		<!-- waline 评论插件 end -->
	</div>
