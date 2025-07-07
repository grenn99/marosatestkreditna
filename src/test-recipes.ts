import { getRecipesByProductId } from './data/sampleRecipes';

// Test function to check if recipes are being loaded correctly
export function testRecipes() {
  console.log('Testing recipes for product ID 1:', getRecipesByProductId(1));
  console.log('Testing recipes for product ID 10:', getRecipesByProductId(10));
}

// Run the test
testRecipes();
