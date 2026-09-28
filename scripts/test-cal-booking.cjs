// Real PHP endpoints, fake cURL transport: no external booking or credentials.
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawn,spawnSync}=require('node:child_process');
const root=path.join(__dirname,'..');
const php=process.env.PHP_BINARY||path.join(root,'.local-tools/php/php.exe');
test('PHP scheduling validates boundaries, rechecks slots and prevents duplicate invitations',async t=>{
  assert.equal(spawnSync(php,['-v']).status,0,'Set PHP_BINARY to a PHP 8.2+ executable');
  const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'cg-cal-test-'));
  for(const file of ['cal-common.php','cal-slots.php','cal-booking.php'])fs.copyFileSync(path.join(root,'public/api',file),path.join(fixture,file));
  const common=path.join(fixture,'cal-common.php');fs.writeFileSync(common,fs.readFileSync(common,'utf8').replace("cal_fail(503, 'Scheduling is temporarily unavailable. Please contact Carmelito.');", "error_log($error->getMessage()); cal_fail(503, 'Scheduling is temporarily unavailable. Please contact Carmelito.');"));
  fs.writeFileSync(path.join(fixture,'cal.config.php'),`<?php return ['api_key'=>'cal_test_fixture','event_type_id'=>42,'timezone'=>'Europe/Berlin','allowed_origins'=>['http://localhost']];`);
  const slot=new Date(Date.now()+86400000).toISOString().replace(/\.\d{3}Z$/,'Z');
  fs.writeFileSync(path.join(fixture,'router.php'),`<?php
  foreach(['CURLOPT_RETURNTRANSFER','CURLOPT_CONNECTTIMEOUT','CURLOPT_TIMEOUT','CURLOPT_FOLLOWLOCATION','CURLOPT_HTTPHEADER','CURLOPT_POST','CURLOPT_POSTFIELDS','CURLINFO_HTTP_CODE'] as $i=>$name)define($name,$i);
  function curl_init($url){return (object)['url'=>$url,'options'=>[]];}
  function curl_setopt_array($c,$o){$c->options=$o+$c->options;}
  function curl_getinfo($c,$i){return 200;}
  function curl_close($c){}
  function curl_exec($c){
    $mode=$_SERVER['HTTP_X_TEST_MODE']??'';
    if(str_contains($c->url,'/slots?')){
      if(!in_array('cal-api-version: 2024-09-04',$c->options[CURLOPT_HTTPHEADER],true))throw new Exception('version');
      if($mode==='unavailable')return json_encode(['status'=>'success','data'=>[]]);
      return json_encode(['status'=>'success','data'=>['day'=>[['start'=>'${slot}']]]]);
    }
    if(!in_array('cal-api-version: 2026-02-25',$c->options[CURLOPT_HTTPHEADER],true))throw new Exception('version');
    $body=json_decode($c->options[CURLOPT_POSTFIELDS],true);
    if($body['eventTypeId']!==42||$body['attendee']['timeZone']!=='Europe/Berlin'||isset($body['allowConflicts']))throw new Exception('payload');
    file_put_contents(__DIR__.'/calls.txt',"booking\\n",FILE_APPEND);
    if($mode==='timeout')return false;
    return json_encode(['status'=>'success','data'=>['status'=>$mode==='pending'?'pending':'accepted','uid'=>'test-only']]);
  }
  $_SERVER['REMOTE_ADDR']=$_SERVER['HTTP_X_TEST_IP']??'test';
  $route=parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH);
  require __DIR__.($route==='/slots'?'/cal-slots.php':'/cal-booking.php');`);
  const server=spawn(php,['-n','-d',`sys_temp_dir="${fixture.replaceAll("\\","/")}"`,'-S','127.0.0.1:8093',path.join(fixture,'router.php')],{stdio:['ignore','ignore','pipe']});
  let logs='';server.stderr.on('data',chunk=>logs+=chunk);t.after(()=>server.kill());
  for(let i=0;i<50;i++){try{await fetch('http://127.0.0.1:8093/slots');break;}catch{await new Promise(r=>setTimeout(r,100));}}
  let serial=0;
  const base={name:'Test Person',email:'test@example.com',context:'A local automated test.',offer:'Adoption Diagnosis',slot,eventTypeId:42,website:''};
  const post=async(changes={},headers={})=>{
    const response=await fetch('http://127.0.0.1:8093/book',{method:'POST',headers:{Origin:'http://localhost','Content-Type':'application/json','X-Test-IP':String(++serial),...headers},body:JSON.stringify({...base,id:`test-request-${String(serial).padStart(8,'0')}`,...changes})});
    const data=await response.json();assert.doesNotMatch(JSON.stringify(data),/cal_test_fixture|Authorization|test-only/);return {code:response.status,data};
  };
  const slots=await(await fetch('http://127.0.0.1:8093/slots')).json();assert.deepEqual(slots.slots,[slot],JSON.stringify(slots)+' '+logs);
  assert.equal((await post({}, {Origin:'https://untrusted.example'})).code,403);
  assert.equal((await post({}, {'Content-Type':'text/plain'})).code,415);
  for(const changes of [{email:'bad'},{name:['bad']},{eventTypeId:43},{slot:'yesterday'},{slot:'2026-02-31T12:00:00Z'},{website:'bot'}])assert.equal((await post(changes)).code,422);
  assert.equal((await post({}, {'X-Test-Mode':'unavailable'})).code,409);
  const request={id:'test-repeat-00000001'};
  assert.equal((await post(request)).data.status,'accepted');
  assert.equal((await post(request)).data.status,'accepted');
  assert.equal(fs.readFileSync(path.join(fixture,'calls.txt'),'utf8').trim().split('\n').length,1);
  assert.equal((await post({...request,email:'changed@example.com'})).code,409);
  assert.equal((await post({}, {'X-Test-Mode':'pending'})).data.status,'pending');
  const uncertain={id:'test-timeout-000001'};
  assert.equal((await post(uncertain,{'X-Test-Mode':'timeout'})).code,503);
  assert.equal((await post(uncertain)).code,409);
  for(let i=0;i<8;i++)assert.equal((await post({email:'invalid'},{'X-Test-IP':'rate-test'})).code,422);
  assert.equal((await post({}, {'X-Test-IP':'rate-test'})).code,429);
  const huge=await fetch('http://127.0.0.1:8093/book',{method:'POST',headers:{Origin:'http://localhost','Content-Type':'application/json','X-Test-IP':'huge'},body:'x'.repeat(17000)});assert.equal(huge.status,413);
});

test('server configuration is excluded from passthrough and browser output',async()=>{
  let filter;
  require('../.eleventy.js')({setServerOptions(){},addFilter(){},addPassthroughCopy(mapping,options){if(mapping.public)filter=options.filter;}});
  for(const file of ['api/cal.config.php','api/contact.config.php','api\\cal.config.php'])assert.equal(filter(file),false);
  assert.equal(filter('api/cal.config.example.php'),true);
  assert.equal(filter('api/cal-booking.php'),true);
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'cg-cal-copy-'));fs.mkdirSync(path.join(temp,'public/api'),{recursive:true});fs.writeFileSync(path.join(temp,'public/api/cal.config.php'),'TEST_ONLY');fs.writeFileSync(path.join(temp,'public/api/cal.config.example.php'),'SAFE_EXAMPLE');
  await require('recursive-copy')(path.join(temp,'public'),path.join(temp,'output'),{filter});
  assert.ok(!fs.existsSync(path.join(temp,'output/api/cal.config.php')));assert.ok(fs.existsSync(path.join(temp,'output/api/cal.config.example.php')));
  assert.ok(!fs.existsSync(path.join(root,'_site/api/cal.config.php')));
  for(const file of ['_site/index.html','src/assets/js/v31-booking.js','src/assets/js/contact.js'])assert.doesNotMatch(fs.readFileSync(path.join(root,file),'utf8'),/cal_live_|Bearer\s/);
});
