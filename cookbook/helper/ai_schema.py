"""
Pydantic models for AI structured output schemas.
Used with litellm's json_schema response format to ensure valid JSON responses from LLMs.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class NutritionInformation(BaseModel):
    """Nutrition information following schema.org/NutritionInformation"""
    calories: Optional[str] = Field(None, description="Calories in kilocalories")
    carbohydrateContent: Optional[str] = Field(None, description="Carbohydrate content in grams")
    fiberContent: Optional[str] = Field(None, description="Fiber content in grams")
    fatContent: Optional[str] = Field(None, description="Fat content in grams")
    proteinContent: Optional[str] = Field(None, description="Protein content in grams")
    saturatedFatContent: Optional[str] = Field(None, description="Saturated fat content in grams")
    sodiumContent: Optional[str] = Field(None, description="Sodium content in milligrams")
    sugarContent: Optional[str] = Field(None, description="Sugar content in grams")
    transFatContent: Optional[str] = Field(None, description="Trans fat content in grams")
    unsaturatedFatContent: Optional[str] = Field(None, description="Unsaturated fat content in grams")
    cholesterolContent: Optional[str] = Field(None, description="Cholesterol content in milligrams")


class RecipeIngredient(BaseModel):
    """Recipe ingredient following schema.org/RecipeIngredient"""
    name: str = Field(..., description="Ingredient name and quantity as a string")


class HowToStep(BaseModel):
    """Recipe instruction step following schema.org/HowToStep"""
    text: str = Field(..., description="Step instructions as text")


class Recipe(BaseModel):
    """Recipe following schema.org/Recipe structure"""
    name: str = Field(..., description="Recipe name")
    description: Optional[str] = Field(None, description="Recipe description")
    prepTime: Optional[str] = Field(None, description="ISO 8601 duration format (e.g., PT15M)")
    cookTime: Optional[str] = Field(None, description="ISO 8601 duration format (e.g., PT1H)")
    totalTime: Optional[str] = Field(None, description="ISO 8601 duration format (e.g., PT1H15M)")
    recipeYield: Optional[str] = Field(None, description="Number of servings or yield description")
    recipeCategory: Optional[str] = Field(None, description="Recipe category (e.g., 'Appetizer', 'Main course')")
    recipeCuisine: Optional[str] = Field(None, description="Recipe cuisine (e.g., 'Italian', 'French')")
    author: Optional[str] = Field(None, description="Recipe author or source")
    image: Optional[str] = Field(None, description="Image URL")
    keywords: Optional[str] = Field(None, description="Comma-separated keywords")
    recipeIngredient: List[RecipeIngredient] = Field(default_factory=list, description="List of ingredients")
    recipeInstructions: List[HowToStep] = Field(default_factory=list, description="List of instruction steps")
    nutrition: Optional[NutritionInformation] = Field(None, description="Nutrition information")


class PropertyExtractionResult(BaseModel):
    """Result for property extraction from recipe"""
    working_time: Optional[int] = Field(None, description="Working time in minutes")
    waiting_time: Optional[int] = Field(None, description="Waiting time in minutes")
    servings: Optional[int] = Field(None, description="Number of servings")
    servings_text: Optional[str] = Field(None, description="Servings as text")


class StepSortResult(BaseModel):
    """Result for step sorting/reordering"""
    steps: List[str] = Field(default_factory=list, description="Sorted recipe steps")


def validate_recipe_response(response_dict: dict) -> tuple[bool, str]:
    """
    Validate that a response from the LLM conforms to the Recipe schema.
    
    Args:
        response_dict: Dictionary response from the LLM
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        Recipe.model_validate(response_dict)
        return True, ""
    except Exception as e:
        return False, str(e)


def validate_property_response(response_dict: dict) -> tuple[bool, str]:
    """
    Validate that a response from the LLM conforms to the PropertyExtractionResult schema.
    
    Args:
        response_dict: Dictionary response from the LLM
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        PropertyExtractionResult.model_validate(response_dict)
        return True, ""
    except Exception as e:
        return False, str(e)
