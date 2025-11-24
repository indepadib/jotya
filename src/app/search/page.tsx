import { Suspense } from 'react';
import SearchForm from './SearchForm';

export default function SearchPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchForm />
        </Suspense>
    );
}
