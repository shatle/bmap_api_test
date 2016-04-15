// set height
jQuery(document).ready(function($) {

	alertify.defaults.glossary.title = "提示"
	alertify.defaults.glossary.ok = "确定"
	alertify.defaults.glossary.cancel = "取消"

	// 
	function setResultHeight(){
		var h = $(window).height()-140-15*2;
		if (h< 50) { h = 50 }
		$('#result').height(h);
	}
	setResultHeight();
	$(window).resize(function(event) {
		setResultHeight();
	});

	// 百度地图API功能
	var map = new BMap.Map("allmap");
	var point = new BMap.Point(113.301459, 23.092816);
	map.centerAndZoom(point,11);
	// map.addControl(new BMap.NavigationControl());
	map.enableScrollWheelZoom();
	map.enableContinuousZoom();

	function myFun(result){
		var cityName = result.name;
		map.setCenter(cityName);
		$('input#inputCityName').val(cityName);
		$('input#inputAreaNum').val(11)
	}
	var myCity = new BMap.LocalCity();
	myCity.get(myFun);
	// 

	// 
	function theLocation(){
		var city = document.getElementById("inputCityName").value;
		var num = document.getElementById("inputAreaNum").value;
		if(city != ""){
			num = $.trim(num)=="" ? 11 : parseInt(num);
			map.centerAndZoom(city,num);      // 用城市名设置地图中心点
			$('input#inputAreaNum').val(num);
		}
	}
	$('button#btnCityName').click(theLocation);
	$('input#inputCityName').keydown(function(event) {
		if (event.keyCode == 13){
			theLocation();
		}
	});
	$('button#btnAreaNum').click(theLocation);
	$('input#inputAreaNum').keydown(function(event) {
		if (event.keyCode == 13){
			theLocation();
		}
	});
	// 
	
	// 百度地图API功能
	function searchWord(search_type){
		var word = $('#inputSearchWord').val();
		if ($.trim(word)==""){
			alertify.alert('请输入搜索名称');
			return false;
		}
		var maxSize = $('#inputSearchMaxSize').val();
		if ($.isNumeric(maxSize)){ maxSize = parseInt(maxSize); }
		else { maxSize = 10; }
		$('#inputSearchMaxSize').val(maxSize);
		var options = {
			onSearchComplete: function(results){
				// 判断状态是否正确
				if (local.getStatus() == BMAP_STATUS_SUCCESS){
					alertify.success('数据加载完成');
					// console.log("--results---", results.getCurrentNumPois())
					$('#resultCount').text(results.getCurrentNumPois());
					var s = [];
					for (var i = 0; i < results.getCurrentNumPois(); i ++){
						var poi = results.getPoi(i);
						s.push((i+1)+', '+poi.title + ", " + poi.address+ ", "+ poi.point.lng + ", "+ poi.point.lat );
					}
					document.getElementById("result").innerHTML = s.join("<br/><br/>");
				}
			},
			pageCapacity: maxSize
		};
		if (maxSize <= 20) {
			options['renderOptions'] = {map: map}
		}else {
			alertify.warning('最大结果数大于20时,不显示地标');
		}
		var local = new BMap.LocalSearch(map, options);
		if (search_type=="bound"){
			local.searchInBounds(word, map.getBounds());
		}else {
			local.search(word);
		}
	}
	$('#btnSearchWord').click(function(){
		searchWord();
	});
	$('#btnSearchWordByBound').click(function(){
		searchWord('bound');
	});
	$('#inputSearchWord, #inputSearchMaxSize').keydown(function(event) {
		if (event.keyCode == 13){
			searchWord();
		}
	});
	
	// 
});