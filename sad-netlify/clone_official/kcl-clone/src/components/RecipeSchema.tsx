import React from 'react';
import { Helmet } from 'react-helmet-async';

interface RecipeIngredient {
  name: string;
  amount?: string;
}

interface RecipeInstruction {
  text: string;
  name?: string;
  url?: string;
  image?: string;
}

interface RecipeNutrition {
  calories?: string;
  fatContent?: string;
  saturatedFatContent?: string;
  cholesterolContent?: string;
  sodiumContent?: string;
  carbohydrateContent?: string;
  fiberContent?: string;
  sugarContent?: string;
  proteinContent?: string;
}

interface RecipeSchemaProps {
  name: string;
  description: string;
  recipeYield: string; // e.g., "4 servings"
  recipeIngredients: RecipeIngredient[];
  recipeInstructions: RecipeInstruction[];
  image: string;
  authorName: string;
  authorUrl?: string;
  datePublished: string; // ISO 8601 format
  prepTime?: string; // ISO 8601 duration format (e.g., "PT15M" for 15 minutes)
  cookTime?: string; // ISO 8601 duration format
  totalTime?: string; // ISO 8601 duration format
  recipeCategory?: string; // e.g., "Dessert", "Main Course"
  recipeCuisine?: string; // e.g., "Italian", "Mexican"
  keywords?: string[];
  recipeNutrition?: RecipeNutrition;
  suitableForDiet?: ('LowFatDiet' | 'DiabeticDiet' | 'GlutenFreeDiet' | 'HalalDiet' | 'HinduDiet' | 'KosherDiet' | 'LowCalorieDiet' | 'LowLactoseDiet' | 'VeganDiet' | 'VegetarianDiet')[];
  video?: {
    name: string;
    description: string;
    thumbnailUrl: string;
    contentUrl: string;
    embedUrl?: string;
    uploadDate: string; // ISO 8601 format
    duration: string; // ISO 8601 duration format
  };
}

/**
 * Component for implementing schema.org Recipe markup
 * This helps search engines understand recipe content and enables rich recipe snippets
 * in search results with images, ratings, cook time, calories, etc.
 */
const RecipeSchema: React.FC<RecipeSchemaProps> = ({
  name,
  description,
  recipeYield,
  recipeIngredients,
  recipeInstructions,
  image,
  authorName,
  authorUrl,
  datePublished,
  prepTime,
  cookTime,
  totalTime,
  recipeCategory,
  recipeCuisine,
  keywords,
  recipeNutrition,
  suitableForDiet,
  video
}) => {
  // Build the basic recipe schema
  const recipeSchema: any = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    'name': name,
    'description': description,
    'recipeYield': recipeYield,
    'recipeIngredient': recipeIngredients.map(ingredient =>
      ingredient.amount ? `${ingredient.amount} ${ingredient.name}` : ingredient.name
    ),
    'recipeInstructions': recipeInstructions.map(instruction => ({
      '@type': 'HowToStep',
      'text': instruction.text,
      ...(instruction.name && { 'name': instruction.name }),
      ...(instruction.url && { 'url': instruction.url }),
      ...(instruction.image && { 'image': instruction.image })
    })),
    'image': image,
    'author': {
      '@type': 'Person',
      'name': authorName,
      ...(authorUrl && { 'url': authorUrl })
    },
    'datePublished': datePublished
  };

  // Add optional properties
  if (prepTime) recipeSchema.prepTime = prepTime;
  if (cookTime) recipeSchema.cookTime = cookTime;
  if (totalTime) recipeSchema.totalTime = totalTime;
  if (recipeCategory) recipeSchema.recipeCategory = recipeCategory;
  if (recipeCuisine) recipeSchema.recipeCuisine = recipeCuisine;
  if (keywords && keywords.length > 0) recipeSchema.keywords = keywords.join(', ');

  // Add nutrition information if provided
  if (recipeNutrition) {
    recipeSchema.nutrition = {
      '@type': 'NutritionInformation',
      ...(recipeNutrition.calories && { 'calories': recipeNutrition.calories }),
      ...(recipeNutrition.fatContent && { 'fatContent': recipeNutrition.fatContent }),
      ...(recipeNutrition.saturatedFatContent && { 'saturatedFatContent': recipeNutrition.saturatedFatContent }),
      ...(recipeNutrition.cholesterolContent && { 'cholesterolContent': recipeNutrition.cholesterolContent }),
      ...(recipeNutrition.sodiumContent && { 'sodiumContent': recipeNutrition.sodiumContent }),
      ...(recipeNutrition.carbohydrateContent && { 'carbohydrateContent': recipeNutrition.carbohydrateContent }),
      ...(recipeNutrition.fiberContent && { 'fiberContent': recipeNutrition.fiberContent }),
      ...(recipeNutrition.sugarContent && { 'sugarContent': recipeNutrition.sugarContent }),
      ...(recipeNutrition.proteinContent && { 'proteinContent': recipeNutrition.proteinContent })
    };
  }

  // Add suitable for diet information if provided
  if (suitableForDiet && suitableForDiet.length > 0) {
    recipeSchema.suitableForDiet = suitableForDiet.map(diet => `https://schema.org/${diet}`);
  }

  // Add video information if provided
  if (video) {
    recipeSchema.video = {
      '@type': 'VideoObject',
      'name': video.name,
      'description': video.description,
      'thumbnailUrl': video.thumbnailUrl,
      'contentUrl': video.contentUrl,
      ...(video.embedUrl && { 'embedUrl': video.embedUrl }),
      'uploadDate': video.uploadDate,
      'duration': video.duration
    };
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(recipeSchema)}
      </script>
    </Helmet>
  );
};

export default RecipeSchema;
