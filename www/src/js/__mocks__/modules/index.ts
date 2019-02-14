import { Module } from 'types/modules';

import ACC2002_JSON from './ACC2002.json';
import BFS1001_JSON from './BFS1001.json';
import CS1010S_JSON from './CS1010S.json';
import CS3216_JSON from './CS3216.json';
import CS4243_JSON from './CS4243.json';
import GES1021_JSON from './GES1021.json';
import PC1222_JSON from './PC1222.json';

// Have to cast these as Module explicitly, otherwise TS will try to
// incorrectly infer the shape from the JSON - specifically Weeks will
// not be cast correctly
export const CS1010S = CS1010S_JSON as Module;
export const ACC2002 = ACC2002_JSON as Module;
export const BFS1001 = BFS1001_JSON as Module;
export const CS3216 = CS3216_JSON as Module;
export const GES1021 = GES1021_JSON as Module;
export const PC1222 = PC1222_JSON as Module;
export const CS4243 = CS4243_JSON as Module;

const modules: Module[] = [ACC2002, BFS1001, CS1010S, CS3216, GES1021, PC1222];
export default modules;