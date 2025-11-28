
import { categories } from '../src/app/search/categories';

console.log('Testing categories export...');
if (!categories) {
    console.error('❌ categories is undefined!');
    process.exit(1);
}

console.log('✅ categories is defined.');
console.log('Keys:', Object.keys(categories));

if (!categories.men) {
    console.error('❌ categories.men is missing!');
} else {
    console.log('✅ categories.men exists.');
}
