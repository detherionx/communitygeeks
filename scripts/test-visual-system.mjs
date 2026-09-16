import test from 'node:test';
import assert from 'node:assert/strict';
import {arrivalProgress,participantSVG} from '../src/assets/js/visual-primitives.mjs';
test('boundary transition reverses with scroll and clamps outside the viewport',()=>{assert.deepEqual([1200,355,60,-500].map(top=>arrivalProgress(top,1000)),[0,.5,1,1]);});
test('shared participant SVG has no external assets or randomized geometry',()=>{assert.equal(participantSVG(),participantSVG());assert.ok(!participantSVG().includes('href='));});
