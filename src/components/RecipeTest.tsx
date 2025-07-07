import React from 'react';
import { sampleRecipes } from '../data/sampleRecipes';
import { RecipeCard } from './RecipeCard';

export function RecipeTest() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Recipe Test Component</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">All Sample Recipes:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
          {JSON.stringify(sampleRecipes, null, 2)}
        </pre>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Recipe Cards:</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {sampleRecipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} compact={true} />
          ))}
        </div>
      </div>
    </div>
  );
}
