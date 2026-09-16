import test from 'node:test';
import assert from 'node:assert/strict';
import {participants,exchanges,exchangePhase} from '../src/assets/js/relationship-field.mjs';
test('exchanges connect distinct people, including a creator to advocate to customer chain',()=>{
 assert.ok(participants.length>=18 && participants.length<=30);
 for(const e of exchanges){assert.ok(participants[e.from]&&participants[e.to]);assert.notEqual(e.from,e.to);assert.equal(e.steps.length,3);}
 assert.equal(exchanges[3].to,exchanges[4].from);
 assert.ok(new Set(participants.map(p=>p[2])).size>10);
});
test('story scrubs from need through exchange to outcome and reverses safely',()=>{
 assert.deepEqual([0,.4,.8,1,.4,-1,2].map(exchangePhase),[0,1,2,2,1,0,2]);
});
