// set height
jQuery(document).ready(function($) {

	alertify.defaults.glossary.title = "提示"
	alertify.defaults.glossary.ok = "确定"
	alertify.defaults.glossary.cancel = "取消"

	// 
	function setResultHeight(){
		var h = $(window).height()-230-15*2;
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
	map.centerAndZoom(point,12);
	// map.addControl(new BMap.NavigationControl());
	map.enableScrollWheelZoom();
	map.enableContinuousZoom();

	function myFun(result){
		var cityName = result.name;
		map.setCenter(cityName);
		$('input#inputCityName').val(cityName);
		$('input#inputAreaNum').val(12)
	}
	var myCity = new BMap.LocalCity();
	myCity.get(myFun);
	// 

	// 
	function theLocation(){
		var city = document.getElementById("inputCityName").value;
		var num = document.getElementById("inputAreaNum").value;
		if(city != ""){
			num = $.trim(num)=="" ? 12 : parseInt(num);
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
	// 
	
	// 百度地图API功能
	function searchWord(search_type){
		var word = $('#inputSearchWord').val();
		console.info("--searchWord--", search_type, word)
		if ($.trim(word)==""){
			alertify.alert('请输入搜索名称');
			return false;
		}

		var options = {
			onSearchComplete: function(results){
				alertify.success('数据加载完成');
				// 判断状态是否正确
				if (local.getStatus() == BMAP_STATUS_SUCCESS){
					// console.log("--results---", results.getCurrentNumPois())
					$('#resultCount').text(results.getCurrentNumPois());
					var s = [];
					for (var i = 0; i < results.getCurrentNumPois(); i ++){
						var poi = results.getPoi(i);
						s.push((i+1)+', '+poi.title + ", " + poi.address+ ", "+ poi.point.lng + ", "+ poi.point.lat );
					}
					$('#result').val( s.join("\n") );
				}else {
					$('#result').val( '' );
					$('#resultCount').text(0);
				}
			},
			pageCapacity: 80,
			renderOptions:{map: map}
		};
		var local = new BMap.LocalSearch(map, options);

		var search_type = null;
		if ($('input#enableRect').length&&$('input#enableRect')[0].checked){
			search_type = 'rect';
		}else if ($('input#enableBound').length&&$('input#enableBound')[0].checked){
			search_type = 'bound';
		}

		console.info('search_type', search_type )
		
		if (search_type=="rect"){
			if (!click_points||click_points.length!=2){
				alertify.alert('请先在地图上画框');
				return false;
			}
			var d = getCoorData(click_points)
			console.info('getCoorData', d )
			var pStart = new BMap.Point(d.x,d.y);
			var pEnd = new BMap.Point(d.maxX,d.maxY);
			var bs = new BMap.Bounds(pStart,pEnd);   //自己规定范围
			coors = [d.x,d.y, d.maxX,d.maxY];
			takeCoorsToInputs(coors[0],coors[1],coors[2],coors[3])
			local.searchInBounds(word, bs);
		}else if (search_type=="bound"){
			var bs = map.getBounds();
			console.info('bound', bs)
			coors = [bs.Je,bs.Ie, bs.Ee,bs.De];
			takeCoorsToInputs(coors[0],coors[1],coors[2],coors[3])
			local.searchInBounds(word, bs);
		}else {
			coors = [];
			var x = $.trim($('#inputLng').val()),
					y = $.trim($('#inputLat').val()),
					maxX = $.trim($('#inputLngMax').val()),
					maxY = $.trim($('#inputLatMax').val());
			if (x==""&&y==""&&maxX==""&&maxY==""){
				local.search(word);
			}else {
				if (x==""||y==""||maxX==""||maxY==""){
					alertify.error("完善坐标数据");
					return false;
				}
				if (!$.isNumeric(x) || !$.isNumeric(y) || !$.isNumeric(maxX) || !$.isNumeric(maxY)){
					alertify.error("坐标只能输入数字")
					return false;
				}else {
					x = parseFloat(x),
					y = parseFloat(y),
					maxX = parseFloat(maxX),
					maxY = parseFloat(maxY);

					if (x>maxX || y>maxY){
						alertify.error("坐标只能输入数字")
						return false;
					}else {
						var pStart = new BMap.Point(x,y);
						var pEnd = new BMap.Point(maxX,maxY);
						var bs = new BMap.Bounds(pStart,pEnd);   //自己规定范围
						coors = [x,y, maxX,maxY];
						local.searchInBounds(word, bs);
					}
				}
			}
			// takeCoorsToInputs('','', '','')
			
		}	
	}
	$('#btnSearchWord').click(function(){
		searchWord();
	});

	$('#inputSearchWord').keydown(function(event) {
		if (event.keyCode == 13){
			searchWord();
		}
	});

	$('input#enableRect').change(function(){
		$('input#enableBound').prop('checked',false);
		if (this.checked){
			alertify.alert('启用画框查询后，直接在地图点击任意两点，'+
				'会自动出现矩形，查询数据会限于矩形内，再点击"查询".');
			$('input.td-input').attr("disabled", 'disabled')
		}else {
			$('input.td-input').removeAttr('disabled');
		}
			
	});

	$('input#enableBound').change(function(){
		$('input#enableRect').prop('checked',false);
		if (this.checked){
			$('input.td-input').attr("disabled", 'disabled')
		}else {
			$('input.td-input').removeAttr('disabled');
		}
	});

	function takeCoorsToInputs(x, y, maxX, maxY){
		$('#inputLng').val(x);
		$('#inputLat').val(y);
		$('#inputLngMax').val(maxX);
		$('#inputLatMax').val(maxY);
	}

	// ==================

	var click_points = [];
	var polygon = null;
	var coors = [];
	function clearRect(){
		if (polygon){ map.removeOverlay(polygon); }
	}
	function mapRect(maxX, x, maxY, y){
		console.info(maxX, x, maxY, y)
		clearRect();
		polygon = new BMap.Polygon([
		new BMap.Point(x,y),
		new BMap.Point(maxX,y),
		new BMap.Point(maxX,maxY),
		new BMap.Point(x,maxY)
		], {strokeColor:"blue", strokeWeight:6, strokeOpacity:0.5});
		map.addOverlay(polygon);
	}

	function getCoorData(tow_elem_arr){
		if (tow_elem_arr.length!=2){return false; };
		var ret = {};
		if (tow_elem_arr[0][0] > tow_elem_arr[1][0]){
			ret.maxX = tow_elem_arr[0][0];
			ret.x = tow_elem_arr[1][0];
		}else {
			ret.maxX = tow_elem_arr[1][0];
			ret.x = tow_elem_arr[0][0];
		}
		if (tow_elem_arr[0][1] > tow_elem_arr[1][1]){
			ret.maxY = tow_elem_arr[0][1];
			ret.y = tow_elem_arr[1][1];
		}else {
			ret.maxY = tow_elem_arr[1][1];
			ret.y = tow_elem_arr[0][1];
		}
		return ret;
	}

	// 
	$('#btnClearRect').click(function(){
		clearRect();
		click_points = [];
	});
	// 
	map.addEventListener("click",function(e){
		// alert(e.point.lng + "," + e.point.lat);
		if ($('input#enableRect').length&&$('input#enableRect')[0].checked){
			if (click_points.length==2){
				click_points.splice(0,1);
			}
			click_points.push([e.point.lng, e.point.lat])
			console.info("-click_points---", click_points)
			if (click_points.length==2){
				var d = getCoorData(click_points);
				if (d)	mapRect(d.maxX, d.x, d.maxY, d.y);
			}
		}		
	});

	Date.prototype.pattern=function(fmt) {         
    var o = {         
    "M+" : this.getMonth()+1, //月份         
    "d+" : this.getDate(), //日         
    "h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //小时         
    "H+" : this.getHours(), //小时         
    "m+" : this.getMinutes(), //分         
    "s+" : this.getSeconds(), //秒         
    "q+" : Math.floor((this.getMonth()+3)/3), //季度         
    "S" : this.getMilliseconds() //毫秒         
    };         
    var week = {         
    "0" : "/u65e5",         
    "1" : "/u4e00",         
    "2" : "/u4e8c",         
    "3" : "/u4e09",         
    "4" : "/u56db",         
    "5" : "/u4e94",         
    "6" : "/u516d"        
    };         
    if(/(y+)/.test(fmt)){         
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));         
    }         
    if(/(E+)/.test(fmt)){         
        fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "")+week[this.getDay()+""]);         
    }         
    for(var k in o){         
        if(new RegExp("("+ k +")").test(fmt)){         
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));         
        }         
    }         
    return fmt;         
	}   

	

	$('#btnOutput').click(function(e){
		try {
		    var isFileSaverSupported = !!new Blob;
		    if (!isFileSaverSupported){
		    	alertify.alert("当前浏览器不支持输出文件，建议下载最新chrome");
		    }else {
		    	var result = $('#result').val();
		    	// console.info('result000---', result);
		    	var blob = new Blob([result], {type: "text/plain;charset=utf-8"});
		    	var date = new Date();      
					var dateStr = date.pattern("yyyy-MM-dd_hh:mm:ss");
					saveAs(blob, dateStr+'_'+coors.join('_')+".csv");
		    }
		} catch (e) {}
	})
	
	// 
});