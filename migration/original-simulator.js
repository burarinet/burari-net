$(function(){
	$('select[name="ev"]').change(function(){
		var tmp_ev=$('select[name="ev"]').children(':selected').val();
		if(tmp_ev=="1"){
			$('.tr_f').removeAttr("disabled");
			$('.tr_f').css('color', '#000');
		}else{
			$('.tr_f').attr("disabled", "disabled");
			$('.tr_f').css('color', '#999');
		}
	});
	$('select[name="pump"]').change(function(){
		var tmp_pump=$('select[name="pump"]').children(':selected').val();
		if(tmp_pump=="1"){
			$('.tr_p').removeAttr("disabled");
			$('.tr_p').css('color', '#000');
		}else{
			$('.tr_p').attr("disabled", "disabled");
			$('.tr_p').css('color', '#999');
		}
	});

	$('#simu_btn').click(function() {
		result_power();
	});
	$(".simuform").change(function(e) {
		result_clear();
	});
	$(window).load(function(){
			$('.tr_f').attr("disabled", "disabled");
			$('.tr_p').attr("disabled", "disabled");
			$('.tr_f').css('color', '#999');
			$('.tr_p').css('color', '#999');
	});
});
var powerlist=[ 0 ,1263.60, 1242.00, 1101.60, 1144.80, 1123.20, 1058.40, 1090.80, 1096.20, 993.60, 1306.80 ];
function result_clear(){
	$('input[name="af_power"]').val("");
	$('input[name="af_price"]').val("");
	$('input[name="be_power"]').val("");
	$('input[name="be_price"]').val("");
	$('input[name="month"]').val("");
	$('input[name="year"]').val("");
}

function result_power(){
	var tmp_ev=$('select[name="ev"]').children(':selected').val();
	var tmp_floor=$('select[name="floor"]').children(':selected').val();
	var tmp_format=$('select[name="format"]').children(':selected').val();
	var tmp_pump=$('select[name="pump"]').children(':selected').val();
	var tmp_pump_power=$('select[name="pump_power"]').children(':selected').val();
	var tmp_parking=$('select[name="parking"]').children(':selected').val();
	var tmp_contractpower=$('select[name="contractpower"]').children(':selected').val();
	var tmp_factor=$('select[name="factor"]').children(':selected').val();
	var power_company=$('select[name="power_company"]').children(':selected').val();
	
	var tmp_power_company=powerlist[power_company];
	
	if(tmp_contractpower==""){alert("現在の契約Kwを入力してください。");return;}
	if(tmp_factor==""){alert("現在の契約の力率を入力してください。");return;}
	
	var tmp_power=0;
	var error="";
	
	if(tmp_ev=="1"){
		if(tmp_floor=="2"){
			if(tmp_format=="1"){
				if(tmp_pump=="1"){
					if(tmp_pump_power==""){error="給水ポンプのモーターを選択してください";}
					else if(tmp_pump_power=="1.5"){tmp_power=3;}
					else if(tmp_pump_power=="2.2"){tmp_power=4;}
					else if(tmp_pump_power=="3.6"){tmp_power=5;}
					else if(tmp_pump_power=="5.5"){tmp_power=6;}
				}else{tmp_power=2;}
			}else if(tmp_format=="2"){
				if(tmp_pump_power==""){error="給水ポンプのモーターを選択してください";}
				else if(tmp_pump_power=="1.5"){tmp_power=10;}
				else if(tmp_pump_power=="2.2"){tmp_power=11;}
				else if(tmp_pump_power=="3.6"){tmp_power=12;}
				else if(tmp_pump_power=="5.5"){tmp_power=13;}
			}else{error="エレベーターの形式を選択してください。";}
		}else if(tmp_floor=="3"){
			if(tmp_format=="1"){
				if(tmp_pump=="1"){
					if(tmp_pump_power==""){error="給水ポンプのモーターを選択してください";}
					else if(tmp_pump_power=="1.5"){tmp_power=4;}
					else if(tmp_pump_power=="2.2"){tmp_power=5;}
					else if(tmp_pump_power=="3.6"){tmp_power=6;}
					else if(tmp_pump_power=="5.5"){tmp_power=7;}
				}else{tmp_power=3;}
			}else if(tmp_format=="2"){
				if(tmp_pump_power==""){error="給水ポンプのモーターを選択してください";}
				else if(tmp_pump_power=="1.5"){tmp_power=10;}
				else if(tmp_pump_power=="2.2"){tmp_power=11;}
				else if(tmp_pump_power=="3.6"){tmp_power=12;}
				else if(tmp_pump_power=="5.5"){tmp_power=13;}
			}else{error="エレベーターの形式を選択してください。";}
		}else{tmp_power=0;}
	}else{tmp_power=0;error="削減が見込めない可能性が高いです。\n一度お電話等でお問い合わせ下さい。";}
	if(error!=""){alert(error);return;}
	if(tmp_parking=="1"){tmp_power=tmp_power+3;}
	if(tmp_power==0){error="削減が見込めない可能性が高いです。\n一度お電話等でお問い合わせ下さい。";}
	if(error!=""){alert(error);return;}

	var expected_sum=tmp_power * parseFloat(tmp_power_company) * 95 / 100;;
	var ex_sum_1=Math.floor(expected_sum);
	$('input[name="af_price"]').val(addFigure(ex_sum_1));
	$('input[name="af_power"]').val(Math.floor(tmp_power));
	
	
	$('input[name="be_power"]').val(tmp_contractpower);
	var per=100;
	if(tmp_factor=="1"){per=105;}
	else if(tmp_factor=="2"){per=100;}
	else if(tmp_factor=="3"){per=95;}
	
	var expected_sum_2=parseFloat(tmp_contractpower) * parseFloat(tmp_power_company) * per / 100;
	var ex_sum_2=Math.floor(expected_sum_2);
	$('input[name="be_price"]').val(addFigure(ex_sum_2));

	var expected_month=parseFloat(expected_sum_2) - parseFloat(expected_sum);
	var expected_year=parseFloat(expected_month) * 12;
	var ex_month=Math.floor(expected_month);
	$('input[name="month"]').val(addFigure(ex_month));
	
	var ex_year=Math.floor(expected_year);
	$('input[name="year"]').val(addFigure(ex_year));

	$.ajax({
		type: 'POST',
		url: 'http://www.burari-net.co.jp/result.php',
		async:false,
		data:{
			mode:'price_data',
			ev:tmp_ev,
			floor:tmp_floor,
			format:tmp_format,
			pump_power:tmp_pump_power,
			parking:tmp_parking,
			contractpower:tmp_contractpower,
			factor:tmp_factor,
			power_company:power_company,
			be_price:ex_sum_2,
			af_power:tmp_power,
			af_price:ex_sum_1,
			pump:tmp_pump
		}
	});
}
function addFigure(n) {
var l, m='';
var mark = (n < 0) ? '-' : '';
var flt = '';
n = Math.abs(n);
if (n % 1) {
flt  = n + '';
flt = flt.substr(flt.indexOf('.'));
}
n = Math.floor(n) + '';
while ( (l = n.length) > 3 ) {
m = "," + n.substr( l - 3, 3 ) + m;
n = n.substr( 0, l - 3 );
}
return mark + n + m + flt;
}

