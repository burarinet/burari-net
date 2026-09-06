// Recovered from /application/blocks/form_for_java/view.js on 2026-09-06.
// Historical rates are deliberately preserved; they are not current tariffs.
export const companies=['北海道電力','東北電力','東京電力','北陸電力','中部電力','関西電力','中国電力','四国電力','九州電力','沖縄電力'];
export const rates=[0,1263.60,1242.00,1101.60,1144.80,1123.20,1058.40,1090.80,1096.20,993.60,1306.80];
export function calculate(input){
 const v=Object.fromEntries(Object.entries(input).map(([k,v])=>[k,String(v)]));
 const error=(message)=>({error:message});
 if(!Number.isInteger(Number(v.contractpower))||Number(v.contractpower)<5||Number(v.contractpower)>30)return error('現在の契約電力を5〜30 kWから選択してください。');
 if(!['1','2','3'].includes(v.factor))return error('現在の契約の力率を選択してください。');
 if(!Number.isInteger(Number(v.power_company))||Number(v.power_company)<1||Number(v.power_company)>10)return error('管轄電力会社を選択してください。');
 if(!['1','2'].includes(v.ev)||!['1','2'].includes(v.pump)||!['1','2'].includes(v.parking))return error('設備の有無をすべて選択してください。');
 if(v.ev==='2')return error('この設備条件では試算できません。削減が見込めない可能性があります。一度お電話等でお問い合わせください。');
 if(!['2','3'].includes(v.floor)||!['1','2'].includes(v.format))return error('エレベーターの階層と形式を選択してください。');
 const motor=['1.5','2.2','3.6','5.5'].indexOf(v.pump_power);
 if(v.pump==='1'&&motor<0)return error('給水ポンプのモーターを選択してください。');
 // The source cannot calculate a hydraulic elevator without pump data.
 // Never infer a tariff or use a stale disabled motor selection.
 if(v.format==='2'&&v.pump==='2')return error('油圧式エレベーター・給水ポンプなしの条件は、個別の確認が必要です。お電話でお問い合わせください。');
 let power=v.format==='2'?10+motor:(v.floor==='2'?2:3)+(v.pump==='1'?motor+1:0);
 if(v.parking==='1')power+=3;
 const rate=rates[Number(v.power_company)];
 const before=Number(v.contractpower)*rate*({1:105,2:100,3:95}[v.factor])/100;
 const after=power*rate*95/100;
 return {beforePower:Number(v.contractpower),afterPower:power,beforePrice:Math.floor(before),afterPrice:Math.floor(after),month:Math.floor(before-after),year:Math.floor((before-after)*12),rate};
}
