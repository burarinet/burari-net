import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {calculate} from '../lib/simulator.mjs';
const source=readFileSync(new URL('../../migration/original-simulator.js',import.meta.url),'utf8');
let current={},output={},alerts=[];
function $(selector){if(typeof selector==='function')return;const name=selector.match(/name="([^"]+)"/)?.[1];return {children(){return this},val(v){if(v!==undefined){output[name]=v;return this}return current[name]??''}}}
$.ajax=()=>{}; // Never submit a test or copy visitor data to the legacy endpoint.
const ctx=vm.createContext({$,alert:m=>alerts.push(m)});vm.runInContext(source,ctx);
let cases=0;
for(const floor of ['2','3'])for(const form of ['1','2'])for(const pump of ['1','2'])for(const motor of (pump==='1'?['1.5','2.2','3.6','5.5']:['']))for(const parking of ['1','2'])for(let power=5;power<=30;power++)for(const factor of ['1','2','3'])for(let company=1;company<=10;company++){
 if(form==='2'&&pump==='2')continue;
 current={ev:'1',floor,format:form,pump,pump_power:motor,parking,contractpower:String(power),factor,power_company:String(company)};output={};alerts=[];ctx.result_power();assert.equal(alerts.length,0);
 const actual=calculate(current);assert.equal(actual.error,undefined);
 for(const [modern,legacy] of Object.entries({beforePower:'be_power',afterPower:'af_power',beforePrice:'be_price',afterPrice:'af_price',month:'month',year:'year'})){assert.equal(actual[modern],Number(String(output[legacy]).replaceAll(',','')),JSON.stringify({current,modern}));}
 cases++;
}
const valid={ev:'1',floor:'2',format:'1',pump:'1',pump_power:'2.2',parking:'2',contractpower:'15',factor:'2',power_company:'6'};
for(const [field,value] of [['ev',''],['ev','2'],['floor',''],['format',''],['pump',''],['pump_power','bad'],['parking',''],['contractpower','NaN'],['contractpower','31'],['factor',''],['power_company','11']])assert.ok(calculate({...valid,[field]:value}).error);
assert.ok(calculate({...valid,format:'2',pump:'2',pump_power:'5.5'}).error);
assert.ok(calculate({...valid,format:'2',contractpower:'5'}).year<0);
console.log(`PASS: ${cases.toLocaleString()} legacy calculation comparisons; invalid inputs and unsupported combinations rejected.`);
