import { search, getSearchSuggestions } from '../controllers/searchController.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
await mongoose.connect(process.env.DB || process.env.MONGO_URI);

console.log('=== TEST 1: SEARCH BY NAME (kanchipuram) ===');
let res1;
await search({ query: { q: 'kanchipuram' } }, { status: () => ({ json: (d) => { res1 = d; } }) });
console.log('Found products:', res1?.products?.length);
res1?.products?.forEach(p => console.log('  -', p.pName, '| Cat:', p.pCategory, '| Color:', p.color));

console.log('\n=== TEST 2: SEARCH BY COLOR (red) ===');
let res2;
await search({ query: { q: 'red' } }, { status: () => ({ json: (d) => { res2 = d; } }) });
console.log('Found products:', res2?.products?.length);
res2?.products?.forEach(p => console.log('  -', p.pName, '| Cat:', p.pCategory, '| Color:', p.color));

console.log('\n=== TEST 3: SEARCH BY COLOR (blue) ===');
let res3;
await search({ query: { q: 'blue' } }, { status: () => ({ json: (d) => { res3 = d; } }) });
console.log('Found products:', res3?.products?.length);
res3?.products?.forEach(p => console.log('  -', p.pName, '| Cat:', p.pCategory, '| Color:', p.color));

console.log('\n=== TEST 4: SEARCH BY CATEGORY (jewellery) ===');
let res4;
await search({ query: { q: 'jewellery' } }, { status: () => ({ json: (d) => { res4 = d; } }) });
console.log('Found products:', res4?.products?.length);
res4?.products?.forEach(p => console.log('  -', p.pName, '| Cat:', p.pCategory, '| Color:', p.color));

console.log('\n=== TEST 5: SEARCH SUGGESTIONS (silk) ===');
let res5;
await getSearchSuggestions({ query: { query: 'silk' } }, { status: () => ({ json: (d) => { res5 = d; } }) });
console.log('Suggested products count:', res5?.suggestions?.products?.length);
console.log('Suggested categories:', res5?.suggestions?.categories?.map(c => c.name));
console.log('Suggested colors:', res5?.suggestions?.colors?.map(c => c.name));

process.exit(0);
